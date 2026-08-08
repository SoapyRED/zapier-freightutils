#!/usr/bin/env node
/**
 * Wrapper-contract check — every declared output field must actually appear in
 * a real response.
 *
 * WHY THIS EXISTS (2026-08-06, then generalised 2026-08-08). `Calculate
 * Consignment` advertised FIVE output fields `/api/consignment` has never
 * returned: `suggested_vehicle`, a top-level `billing_basis`, and a
 * `chargeable_weight_air`/`_road`/`_sea` trio. Zapier renders `outputFields` in
 * the step mapper, so every one of them was offered to paying users as
 * something they could map — and anyone who mapped one had a step silently
 * producing an empty value on every run since.
 *
 * That was found by reading, and fixed by hand, one action at a time. This is
 * the machine that stops the class coming back across all twenty operations.
 *
 * IT RUNS THE REAL `perform`, NOT A RAW HTTP DIFF, and that distinction is the
 * whole design. Several operations transform the response before returning it —
 * `hsLookup` renames `hscode` to `hs_code` and returns an ARRAY, the consignment
 * actions reshape parallel input lists into `items[]`. A guard that compared
 * `outputFields` against the raw API body would report false failures on every
 * one of those and be switched off within a week. Driving the operation's own
 * `perform` through a minimal `z` shim tests the contract the USER sees: what
 * the step actually emits into the mapper.
 *
 * WHAT IT ASSERTS, per operation:
 *   1. Every declared `outputFields[].key` is present in the real output.
 *      A declared-but-absent key is the phantom-field defect. FAILS.
 *   2. Every `sample` key is present in the real output. The sample is what
 *      Zapier shows before a Zap has ever run, so a wrong sample misleads at
 *      exactly the moment the user is deciding what to map. FAILS.
 *   3. Real keys that are NOT declared are REPORTED, never failed. Undeclared
 *      fields still flow through to the user, so this is a completeness hint,
 *      not a defect — and failing on it would make every additive API change
 *      break this repo's build.
 *
 * NETWORK. This calls PRODUCTION, so it is not a lint: it never belongs in a
 * blocking offline chain. Weekly on a schedule, plus manual dispatch.
 *
 *   node scripts/contract-check.mjs             check every operation
 *   node scripts/contract-check.mjs --only=ldm  one operation, by key
 *
 * Exit: 0 clean · 1 a declared field was missing · 2 the harness could not run
 * (network, rate limit, a malformed operation) — DISTINCT, because a harness
 * that cannot reach the API must never look like a clean contract.
 */
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const require = createRequire(pathToFileURL(path.join(ROOT, 'package.json')));

const ONLY = (process.argv.find((a) => a.startsWith('--only=')) ?? '').split('=')[1] || null;
const API_KEY = process.env.FREIGHTUTILS_API_KEY || '';
const { name: PKG_NAME, version: PKG_VERSION } = require(path.join(ROOT, 'package.json'));

const EXIT = { CLEAN: 0, CONTRACT: 1, HARNESS: 2 };

/**
 * EXIT CODES ARE SET, NOT FORCED — `process.exitCode`, never `process.exit()`.
 *
 * On Windows, calling process.exit() while undici still holds a keep-alive
 * socket trips a libuv assertion and the process dies with 0xC0000409 (reported
 * as -1073740791). CI reads that as neither pass nor fail, and a gate whose exit
 * code is noise is a gate nobody can wire up — it was observed on this very
 * script's first negative test. Setting exitCode lets the loop drain and node
 * exit with the code we meant.
 */
class HarnessAbort extends Error {}
const harnessFail = (msg) => {
  console.error(`\n✗ contract-check HARNESS ERROR — ${msg}`);
  console.error('  This is exit 2, NOT a contract failure. Nothing was proved about the declarations.');
  process.exitCode = EXIT.HARNESS;
  throw new HarnessAbort(msg);
};

// ── The `z` shim ──────────────────────────────────────────────────────────
// Only the surface the performs actually use: z.request({url, method, params,
// body}) → { data, status }. If an operation ever needs more, this throws by
// TypeError rather than silently returning undefined — a shim that quietly
// under-implements would produce fake "missing field" failures.
async function zRequest(opts) {
  const url = new URL(opts.url);
  for (const [k, v] of Object.entries(opts.params ?? {})) {
    if (v === undefined || v === null || v === '') continue;
    url.searchParams.set(k, String(v));
  }
  const headers = {
    Accept: 'application/json',
    // Same versioned UA the app sends, so this check's own traffic is
    // attributable and does not pollute the "unknown" bucket.
    'User-Agent': `${PKG_NAME}/${PKG_VERSION}`,
    ...(API_KEY ? { 'X-API-Key': API_KEY } : {}),
    ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
  };
  const res = await fetch(url.toString(), {
    method: opts.method ?? 'GET',
    headers,
    ...(opts.body ? { body: JSON.stringify(opts.body) } : {}),
  });
  const text = await res.text();
  if (res.status === 429) {
    harnessFail(
      'the API rate-limited this run (HTTP 429). Anonymous access is 25 requests/day per IP and this ' +
      'check makes one call per operation. Set the FREIGHTUTILS_API_KEY secret so the run authenticates.',
    );
  }
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    harnessFail(`${opts.url} returned non-JSON (HTTP ${res.status}): ${text.slice(0, 200)}`);
  }
  return { data, status: res.status };
}

// The performs use exactly three `z` members — enumerated from the source
// (`grep -ohE 'z\.[a-zA-Z.]+'`), not guessed. z.errors.* are the platform's
// error constructors: an operation throwing one is making a DELIBERATE
// statement ("this input cannot be answered"), which is different from the
// harness breaking, so they are real classes here and caught separately below.
class HaltedError extends Error {}
class ZapierError extends Error {}
const z = { request: zRequest, errors: { Error: ZapierError, HaltedError }, JSON, console };

// ── Key flattening — Zapier's `__` convention ─────────────────────────────
// `outputFields` addresses nesting with a double underscore (`totals__cbm`),
// so the real output is flattened the same way before comparison. Arrays are
// flattened from their FIRST element: Zapier maps array outputs positionally
// and the declaration describes one item's shape.
/**
 * Zapier addresses line-item children two ways — `items[]un_number` and
 * `items__un_number` — and both appear in this repo's declarations. They mean
 * the same field. Normalising before comparison is not cosmetic: without it the
 * guard reported every line-item field in `adrLqCheck` as a phantom, which is
 * the kind of false positive that gets a guard switched off in a week.
 */
function normaliseKey(k) {
  return k.replace(/\[\]/g, '__');
}

function flattenKeys(value, prefix = '', out = new Set()) {
  if (value === null || value === undefined) return out;
  if (Array.isArray(value)) {
    if (value.length > 0) flattenKeys(value[0], prefix, out);
    return out;
  }
  if (typeof value !== 'object') return out;
  for (const [k, v] of Object.entries(value)) {
    const key = prefix ? `${prefix}__${k}` : k;
    out.add(key);
    if (v && typeof v === 'object') flattenKeys(v, key, out);
  }
  return out;
}

/** Build the test input for an operation from its own declared defaults. */
function inputFrom(op) {
  const data = {};
  for (const f of op.operation.inputFields ?? []) {
    if (typeof f !== 'object' || !f.key) continue; // skip dynamic-field functions
    if (f.default !== undefined) data[f.key] = f.default;
  }
  return data;
}

// ── Load every operation ──────────────────────────────────────────────────
function loadDir(dir) {
  const abs = path.join(ROOT, dir);
  let files;
  try {
    files = readdirSync(abs).filter((f) => f.endsWith('.js') && !f.includes('-Moonika'));
  } catch (e) {
    harnessFail(`cannot read ${dir}/ (${e.code})`);
  }
  if (files.length === 0) harnessFail(`${dir}/ contains no operation files — the loader is looking in the wrong place`);
  return files.map((f) => {
    const mod = require(path.join(abs, f));
    if (!mod?.key || !mod?.operation?.perform) harnessFail(`${dir}/${f} is not a Zapier operation (no key / operation.perform)`);
    return { ...mod, __file: `${dir}/${f}` };
  });
}

// ── Known gaps — the baseline, and why there is one ───────────────────────
// This guard landed on a codebase that already had 13 of 20 operations
// declaring at least one absent field. A check that goes red on day one and
// stays red is a check somebody disables, so the pre-existing set is declared
// in contract-known-gaps.json and the guard is PROSPECTIVE: anything not
// listed there fails. Entries print on every run with their verdict, so the
// backlog stays visible instead of becoming silence.
let GAPS;
try {
  GAPS = require(path.join(HERE, 'contract-known-gaps.json'));
} catch (e) {
  harnessFail(`cannot read scripts/contract-known-gaps.json (${e.code ?? e.message}) — without it every pre-existing gap would fail and the run would be meaningless`);
}
const gapFor = (op, field) => (GAPS.gaps ?? []).find((g) => g.op === op && normaliseKey(g.field) === field);
const sampleGapFor = (op, field) =>
  (GAPS.sampleGaps ?? []).find((g) => g.op === op && (g.fields ?? []).map(normaliseKey).includes(field));
const usedGaps = new Set();

const ops = [...loadDir('creates'), ...loadDir('searches')].filter((o) => !ONLY || o.key === ONLY);
if (ops.length === 0) harnessFail(ONLY ? `no operation with key "${ONLY}"` : 'no operations loaded');

// ── Run ───────────────────────────────────────────────────────────────────
const failures = [];
const notes = [];
const skipped = [];
const known = [];
const knownSample = [];
let checked = 0;
let declaredTotal = 0;

console.log(`contract-check — ${ops.length} operation(s) against PRODUCTION as ${PKG_NAME}/${PKG_VERSION}` +
  `${API_KEY ? ' (authenticated)' : ' (ANONYMOUS — 25/day per IP)'}\n`);

for (const op of ops) {
  const declared = (op.operation.outputFields ?? [])
    .filter((f) => typeof f === 'object' && f.key)
    .map((f) => normaliseKey(f.key));
  const sampleKeys = [...flattenKeys(op.operation.sample ?? {})].map(normaliseKey);

  let output;
  try {
    output = await op.operation.perform(z, { inputData: inputFrom(op), authData: {} });
  } catch (e) {
    // A DELIBERATE halt is not a harness failure and not a contract failure:
    // the operation is refusing this input on purpose (e.g. a default that is
    // legitimately ambiguous). Report and skip — asserting a contract against
    // a response that was never produced would be inventing a verdict.
    if (e instanceof HaltedError || e instanceof ZapierError) {
      skipped.push({ key: op.key, why: e.message });
      console.log(`  ⏭ ${op.key.padEnd(26)} operation halted on its own defaults: ${e.message.slice(0, 90)}`);
      continue;
    }
    // Anything else means the harness broke — we learned nothing.
    harnessFail(`${op.__file} perform() threw: ${e.message}`);
  }

  const real = flattenKeys(output);
  checked++;
  declaredTotal += declared.length;

  const absent = declared.filter((k) => !real.has(k));
  const sampleAbsent = sampleKeys.filter((k) => !real.has(k));
  const undeclared = [...real].filter((k) => !declared.includes(k));

  // Split each absence into NEW (fails) and KNOWN (declared in the baseline).
  const newMissing = [];
  for (const k of absent) {
    const g = gapFor(op.key, k);
    if (g) { usedGaps.add(`${g.op}::${g.field}`); known.push({ op: op.key, field: k, ...g }); }
    else newMissing.push(k);
  }
  const newSampleMissing = [];
  for (const k of sampleAbsent) {
    const g = sampleGapFor(op.key, k);
    if (g) { usedGaps.add(`${g.op}::sample`); knownSample.push({ op: op.key, field: k, verdict: g.verdict }); }
    else newSampleMissing.push(k);
  }

  if (newMissing.length || newSampleMissing.length) {
    failures.push({ op, missing: newMissing, sampleMissing: newSampleMissing });
    console.log(`  ✗ ${op.key.padEnd(26)} ${newMissing.length} NEW phantom output field(s), ${newSampleMissing.length} NEW phantom sample key(s)`);
    for (const k of newMissing) console.log(`       DECLARED, NEVER RETURNED: outputFields "${k}"`);
    for (const k of newSampleMissing) console.log(`       SAMPLE CLAIMS, NEVER RETURNED: "${k}"`);
  } else {
    const knownHere = absent.length + sampleAbsent.length;
    console.log(
      `  ✓ ${op.key.padEnd(26)} ${declared.length} declared field(s)` +
      (knownHere ? `, ${knownHere} known gap(s) — see the baseline below` : ', all present'),
    );
  }
  if (undeclared.length) notes.push({ key: op.key, undeclared });
}

if (notes.length) {
  console.log('\n  Real but UNDECLARED — reported, never failed. These still reach the user; declaring');
  console.log('  them only improves the mapper. Failing here would break the build on any additive');
  console.log('  API change, which is how a useful guard becomes a disabled one.');
  for (const n of notes) console.log(`    · ${n.key}: ${n.undeclared.join(', ')}`);
}

// ── The baseline, printed every run ───────────────────────────────────────
// Not an allowlist tucked away in a file nobody opens. A `phantom` here is a
// LIVE customer-facing defect: Zapier renders it in the step mapper, so a user
// who maps it gets an empty value on every run. This block IS the pre-publish
// worklist.
if (known.length || knownSample.length) {
  const phantoms = known.filter((g) => g.verdict === 'phantom');
  const conditionals = known.filter((g) => g.verdict === 'conditional');
  console.log(`\n  KNOWN GAPS — declared in contract-known-gaps.json, not failed here.`);
  if (conditionals.length) {
    console.log(`  ${conditionals.length} CONDITIONAL (the declaration is correct; the field needs a different input):`);
    for (const g of conditionals) console.log(`    · ${g.op}.${g.field} — ${g.why}`);
  }
  if (phantoms.length) {
    console.log(`  ${phantoms.length} PHANTOM output field(s) — REAL DEFECTS, each one live in the step mapper today:`);
    for (const g of phantoms) console.log(`    ✗ ${g.op}.${g.field} — ${g.why}`);
  }
  const sPhantom = knownSample.filter((g) => g.verdict === 'phantom').length;
  if (sPhantom) console.log(`  ${sPhantom} phantom sample key(s) across ${new Set(knownSample.map((g) => g.op)).size} operation(s).`);
}

// A baseline entry that matches nothing is STALE PAPERWORK, and stale paperwork
// reads as coverage. Either the field was fixed (delete the entry) or the
// operation was renamed (repoint it) — both need a human, so this fails.
// Skipped under --only, where most entries legitimately cannot match.
if (!ONLY) {
  const declaredIds = [
    ...(GAPS.gaps ?? []).map((g) => `${g.op}::${g.field}`),
    ...(GAPS.sampleGaps ?? []).map((g) => `${g.op}::sample`),
  ];
  const stale = [...new Set(declaredIds)].filter((id) => !usedGaps.has(id));
  // Entries for operations that HALTED were never exercised — not stale, just unproven.
  const haltedOps = new Set(skipped.map((s) => s.key));
  const reallyStale = stale.filter((id) => !haltedOps.has(id.split('::')[0]));
  if (reallyStale.length) {
    console.error(`\n✗ contract-check — ${reallyStale.length} STALE baseline entr(ies) matched nothing:`);
    for (const id of reallyStale) console.error(`    ${id}`);
    console.error('  If the field was fixed, delete its entry in the same change. A baseline that');
    console.error('  describes gaps that no longer exist is indistinguishable from coverage.');
    process.exitCode = EXIT.CONTRACT;
  }
}

console.log('');
if (process.exitCode === EXIT.CONTRACT && failures.length === 0) {
  // A stale baseline entry already set the failing code above — do not also
  // print a pass line under it.
} else if (failures.length > 0) {
  console.error(`✗ contract-check FAILED — ${failures.length} of ${checked} operation(s) declare a field the API does not return.`);
  console.error('  Zapier renders these in the step mapper, so each one is offered to users as mappable');
  console.error('  and produces an empty value on every run. Fix the declaration against a real response.');
  process.exitCode = EXIT.CONTRACT;
}
// A SKIP IS PRINTED, NEVER SILENT. An operation that halts on its own defaults
// is unverified, and an unverified operation inside a green run is exactly the
// "reads as coverage" failure this repo keeps finding elsewhere.
if (skipped.length) {
  console.log(`  ${skipped.length} operation(s) NOT verified (halted on their own defaults): ${skipped.map((s) => s.key).join(', ')}`);
  console.log('  Give those actions defaults that produce a real answer if you want them covered.');
}
const phantomCount = known.filter((g) => g.verdict === 'phantom').length;
console.log(
  `✓ contract-check PASSED — ${checked} of ${ops.length} operation(s) verified, ${declaredTotal} declared output field(s); ` +
  `NO NEW phantom fields. Baseline carries ${phantomCount} known phantom(s) + ` +
  `${known.length - phantomCount} conditional(s), printed above; ${notes.length} operation(s) have undeclared extras; ` +
  `${skipped.length} unverified (halted).`,
);
if (phantomCount > 0) {
  console.log(`  The ${phantomCount} phantom(s) are a live worklist, not a clean bill of health.`);
}
