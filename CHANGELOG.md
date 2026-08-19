# Changelog

## 0.5.0 — 2026-08-19 (six new operations + the phantom-field cleanup 0.4.2 queued)

### Added — six operations, closing the parity gap with the MCP/n8n surfaces

Three Creates: **Calculate Freight Emissions** (ISO 14083 / GLEC v3.2 with published DEFRA, EPA
and ADEME factors), **Validate Freight Identifier** (container ISO 6346, AWB mod-7 and IMO check
digits — a failed check digit comes back as `valid: false`, never silently dropped), and
**Check ICS2 Goods Description**. Three Searches: **Find Airport**, **Find Nearest Airport**, and
**Resolve Freight Identifier** — give it one token (`176`, `UN1845`, `NLRTM`, `FOB`,
`MSKU1100810`) and it detects what the token is and returns the matching records, one row per
candidate flattened from the API envelope's `result.candidates` array. 26 operations total: 15
Creates, 11 Searches.

### Fixed — the phantom output fields 0.4.2 found are now corrected

0.4.2's contract check found 17 declared output fields that production never returns, and said
plainly that fixing them was its own change because **renaming a declared output key changes what
users can map** — a Zap mapped to the old key stops resolving and must be re-mapped to the new
one. This is that change. Every declaration now uses the field's real name, verified live:

- `chargeableWeight`: `billing_basis` → `basis`
- `pallet`: `limiting_factor` → `weight_limited` (boolean)
- `adrLookup`: `tunnel_code` → `tunnel_restriction_code`; `limited_quantity` and
  `excepted_quantity` newly declared
- `airlineLookup`: `iata` → `iata_code`, `icao` → `icao_code`, `cargo` → `has_cargo`;
  `callsign` newly declared
- `incotermsLookup`: `mode` → `category`
- `hsLookup`: `chapter` and `heading` deleted (they never existed on `/api/hs`); `level`,
  `parent` and `section` declared instead
- `adrExemption`: `transport_category` and `multiplier` moved to their real per-item nesting
  (`items[]transport_category`, `items[]multiplier`)
- `cbm`: `revenue_tonnes` deleted; `ldm`: `pallet_type` and `quantity` deleted
- Every sample is now a key-subset of a real production response, captured 2026-08-19

### Added — ADR scope verdicts

`adrLookup`, `adrExemption` and `adrExemptionConsignment` now declare the Table A scope fields
the API added 2026-08-19: `not_subject_to_adr`, `conditions_ref`, `carriage_prohibited`. They are
sparse — present only when the row or load carries a scope remark — and recorded as conditional
in the contract-check baseline, not asserted on every response.

### Fixed — shipmentSummary compliance block was conditional all along, not phantom

The three `compliance__*` fields 0.4.2 ledgered as gaps are real: verified live 2026-08-19,
production returns the block whenever any item carries `un_number`. The contract check simply
never sent one. The UN Number input now defaults to `1203` so the check exercises the
dangerous-goods path, and the three entries are reclassified from phantom to conditional.

## 0.4.2 — 2026-08-08 (versioned User-Agent)

### Added

**Every outbound call now sends `User-Agent: zapier-freightutils/<version>`.** Until now this app
sent no distinguishing User-Agent, so FreightUtils' own server metrics could not tell a call from
this Zapier app apart from a call from the n8n node, the Make app, or a plain script. Usage
visibility depended entirely on Zapier's dashboard — which reports task invocations, but says
nothing about which of our integrations is actually carrying load.

The version is read from `package.json` at module load, never typed into the source, so it moves
with the release automatically. It is set in the app's single `beforeRequest` hook, which every
action and search routes through — there is no per-action wiring to forget.

Nothing about request bodies, responses, field keys or auth changes. The server records only a
label and a date against this (no IP, no key, no account identifier).

### Added — a guard for the phantom-field class

`npm run contract-check` drives every operation's REAL `perform` against production and asserts
that every field it DECLARES actually comes back. It runs the perform rather than diffing raw HTTP,
because several operations reshape the response — a raw diff would report false failures on all of
them and get switched off.

**It found the problem is much wider than the one action fixed in 0.4.1: 17 declared output fields
across 13 of the 20 operations are never returned.** Every one is verified against a live response
and recorded in `scripts/contract-known-gaps.json` with its real name where one exists — mostly
renames the declarations never followed (`iata` → `iata_code`, `tunnel_code` →
`tunnel_restriction_code`, `billing_basis` → `basis`, `mode` → `category`) and fields declared at
the wrong nesting level (`transport_category` is really `items__transport_category`).

**These are not fixed in this release, and that is stated rather than glossed:** correcting a
declared output key changes what users can map, so it is its own change with its own testing. The
baseline is printed on every run and the guard is prospective — a NEW phantom fails immediately.
Eight further absences were checked and found to be legitimately CONDITIONAL (the `shipmentSummary`
mode-specific and customs blocks appear for other inputs), so they are recorded as correct
declarations rather than defects.

Weekly on a schedule, on demand, and on any change to the declarations themselves.

## 0.4.1 — 2026-08-06 (output-side truth)

### Fixed

**`Calculate Consignment` advertised five output fields that `/api/consignment` has never returned.** Zapier renders `outputFields` in the step mapper, so every one of them was offered to users as something they could map — and anyone who mapped one has had a step producing an empty value on every run since. Verified by curling production, not by reading code:

| Declared | Reality |
|---|---|
| `suggested_vehicle` | Never returned. The consignment engine deliberately emits no vehicle suggestion; a different tool (`shipment_summary`) is the one that does. |
| `billing_basis` (top level) | Real, but it lives at `totals.billing_basis`. |
| `totals__chargeable_weight_air` | The response carries ONE chargeable weight — `totals.chargeable_weight_kg`, computed for the mode you asked for. |
| `totals__chargeable_weight_road` | As above. |
| `totals__chargeable_weight_sea` | As above. |

The `sample` also claimed `totals.pallet_spaces` and `totals.item_count`; the real names are `line_count` and `piece_count`, and there is no `pallet_spaces` in this response at all.

**Nothing about the request changes**, and every field that was already REAL keeps its exact key — `mode`, `totals__cbm`, `totals__gross_weight_kg`, `totals__ldm`, `totals__revenue_tonnes`. So no working mapping breaks. Newly declared, because they were real and undeclared: `totals__volumetric_weight_kg`, `totals__chargeable_weight_kg`, `totals__line_count`, `totals__piece_count`, `totals__billing_basis`, `schema_version`, `air_volumetric_divisor`.

The `sample` is now a copy of an actual production response rather than a hand-written illustration of what the action ought to return, which is how the drift got in.

**Scope note.** Only `creates/consignment.js` was audited against production in this pass. The other 11 Creates and 8 Searches declare their own `sample`/`outputFields` the same hand-written way and have NOT been checked — see the repo issue opened alongside this release.

## 0.4.0 — 2026-05-01

### Added

- **`adrLqCheckConsignment` Create action** (`Check ADR LQ/EQ Eligibility (Multi-Item Consignment)`) — wraps `POST /api/adr/lq-check` with the multi-item form. Zap users supply parallel lists (`un_numbers[]`, `quantities[]`, `units[]`) plus the `mode` (`lq` or `eq`); the perform handler zips them into the `items[]` array the API expects. Returns the consignment-level `overall_status` plus per-item `status` and `reason`.
- **`adrExemptionConsignment` Create action** (`Calculate ADR 1.1.3.6 Exemption (Multi-Item Consignment)`) — wraps `POST /api/adr-calculator` with the multi-item form. Zap users supply parallel `un_numbers[]` + `quantities[]`; the perform handler emits `items[]`. Returns aggregate `total_points`, `threshold`, `exempt`, `has_category_zero`, `has_quantity_exceedance`, plus per-item `transport_category` and `points`. Closes the multi-item exemption parity gap surfaced in the 2026-04-29 Zap audit (single-substance `adrExemption` already shipped at v0.1.0; the multi-item variant is the new piece).

### No breaking changes

- Existing 0.3.x Zaps unaffected. The 10 prior Creates and 8 Searches are unchanged byte-for-byte; only `index.js` gains 2 new registration lines and 2 new files appear under `creates/`.
- Both new actions use Zapier's parallel-list pattern (`list: true` on each input field), the same convention used in `consignment` and `shipmentSummary`. No user-facing field-key changes.

### Versioning note

The 0.3.0 source committed at `8dea43d` contained these 2 new actions on top of the originally-tagged 0.3.0 (which had 10 Creates). The package.json version was not bumped at that commit, so `zapier push` deployed the 12-action source as version "0.3.0" — overwriting the prior 10-action 0.3.0 in the dev environment. This 0.4.0 bump disambiguates: 0.3.0 = 10 Creates (original tag, deployment-blocked from public promotion 2026-04-29), 0.4.0 = 12 Creates (current). No migration required for any user — all changes since 0.2.0 are additive.

### Verified

- `npx zapier validate` clean (15 checks pass, 0 errors, 2 pre-existing warnings: D003 + D027).
- Live `zapier push` deployed 0.4.0 to the private dev environment.
- `zapier describe` confirms 12 Creates total, including both new consignment actions.

## 0.3.0 — 2026-04-29

### Added

- **`shipmentSummary` Create action** (`Calculate Shipment Summary`) — composite that wraps `POST /api/shipment/summary`, the FreightUtils endpoint chaining CBM + chargeable weight + LDM + ADR compliance + UK-duty estimation into a single call. One Zap step replaces what was previously 4–5 chained actions (CBM → chargeable weight → LDM → UK duty → ADR check). Closes the only remaining gap from the 18-tool `freightutils-mcp@2.0.0` catalogue (Zap audit 2026-04-29 confirmed coverage at 17/18 prior to this release).

  - Per-item line items via Zapier `list: true` on `length` / `width` / `height` / `weight` / `quantity` / `description` / `stackable` / `pallet_type` / `hs_code` / `un_number` / `customs_value` — Zap users add as many entries as they have items per shipment, all positionally aligned at runtime.
  - Top-level shipment fields: `mode` (road / air / sea), `origin_country`, `destination_country`, `incoterm`, `freight_cost`, `insurance_cost`.
  - All input field keys are `snake_case` (matches the v0.2.0 convention; verified by lint).
  - Sample mirrors the live response verbatim — `mode`, `itemCount`, `totals.{pieces,grossWeight,volumeCBM,chargeableWeight,billingBasis}`, `modeSpecific.{loadingMetres,palletSpaces,trailerUtilisation,suggestedVehicle,chargeableWeightRoad}`, `compliance.{hasDangerousGoods,adrFlags.{unNumbers,totalPoints,exemptionApplicable}}`, `customs.{hsCodesPresent,canEstimateUkDuty}`, plus `warnings`, `disclaimer`, `dataVersion`.

### No breaking changes

- Existing v0.2.0 Zaps unaffected. Nine pre-existing Creates and eight Searches all unchanged. `index.js` only gained the new action's import + registration line. `package.json` version bump is the sole non-additive edit.
- The action-level `key:` is `shipmentSummary` (camelCase), matching the sibling-action convention (`chargeableWeight`, `ukDuty`, `unitConvert`, etc.) — Zapier internal operation keys are stable and not user-facing form-field names.

### Verified

- `npx zapier validate` clean.
- Live `POST /api/shipment/summary` smoke (snake_case body, 2-item road shipment with one DG item) returned 200 with the expected structure (`itemCount: 2`, `totals.chargeableWeight: 1575`, `compliance.hasDangerousGoods: true`, `compliance.adrFlags.unNumbers: ["1203"]`, etc.). Sample object in `creates/shipmentSummary.js` is taken from this response verbatim.

## 0.2.0 — 2026-04-25 (later — input-side casing)

### BREAKING

User-facing input field keys migrated from `camelCase` to `snake_case` to match the response convention. **Existing user Zaps that mapped data into the OLD camelCase field keys will break and need to be re-mapped.** Acceptable trade-off given near-zero installed user base on this still-private integration.

| Action | Old field key | New field key |
|--------|---------------|---------------|
| `consignment` (Calculate Consignment) | `grossWeight` | `gross_weight` |
| `ukDuty` (Calculate UK Import Duty) | `commodityCode` | `commodity_code` |
| `ukDuty` (Calculate UK Import Duty) | `originCountry` | `origin_country` |
| `ukDuty` (Calculate UK Import Duty) | `customsValue` | `customs_value` |

Other actions / searches (`adrLookup`, `adrLqCheck`, `adrExemption`, `cbm`, `chargeableWeight`, `ldm`, `pallet`, `unitConvert`, `airlineLookup`, `containerLookup`, `hsLookup`, `incotermsLookup`, `uldLookup`, `unlocodeLookup`, `vehicleLookup`) — input field keys already snake-clean (or single-word) in v0.1.x. The `key:` identifiers on the operations themselves (e.g. `'ukDuty'`, `'chargeableWeight'`) are Zapier internal operation keys, not user-facing input field keys; these are left as-is to avoid breaking existing user Zaps that reference operations by these keys (Zapier doesn't expose a way to alias them).

### Migration

For each affected action in an existing Zap:
1. Open the action's "Set up trigger / action" step.
2. Re-map any input that previously used `commodityCode`, `originCountry`, `customsValue`, or `grossWeight` to the new snake_case keys (`commodity_code`, `origin_country`, `customs_value`, `gross_weight`).
3. Re-test the action.

### Wire compatibility

- `creates/ukDuty.js` perform body now sends `commodity_code` / `origin_country` / `customs_value` directly (the website's `/api/duty` route accepts both casings; snake_case is canonical going forward).
- `creates/consignment.js` perform body — the website's `/api/consignment` input parser only recognises `camelCase` aliases on item-level fields (`grossWeight`/`grossWeightKg`/`weight`/`gw`). The Zapier perform function maps the user's `gross_weight` input → `grossWeight` on the wire. Documented inline. The remap can come out once the website's input parser adds snake_case aliases.

### Other cleanup

- `creates/pallet.js` — sample fixture and outputFields key `limitingFactor` renamed to `limiting_factor` for casing consistency. Note: the `/api/pallet` endpoint doesn't actually return this field in the live response (sample was aspirational from v0.1.0); the rename is purely for sample-shape hygiene.

### Verified

- `npx zapier validate` — 0 errors. Same pre-existing warnings as v0.1.2 (D028 cleanInputData, D003 connectionLabel, D027 platform-core upgrade — all carry-over).
- Source-only verification of input + output keys against the canonical snake_case convention.

## 0.1.2 — 2026-04-25 (later — fan-out adapt)

### Fixed

- **Output fields + samples migrated to `snake_case`** for the six operations whose underlying endpoints flipped casing in the website's 2026-04-25 migration: `unlocodeLookup`, `uldLookup`, `containerLookup`, `vehicleLookup`, `consignment`, `ukDuty`. Sample fixtures now reflect the actual API response shape (e.g. `containerLookup.sample` previously declared `internalLengthCm`/`maxGrossKg` but the API never returned those exact keys; now declares `internal_length_cm`/`max_gross_kg` matching the live response). Output field declarations re-keyed accordingly. Existing user maps to the OLD camelCase output keys break — Zaps need a one-time re-map.
- **Credential test endpoint** switched from `/api/health` → `/api/auth/whoami`. /api/health returned 200 to any caller, silently green-ticking invalid keys (B028 in the n8n dogfood was the same defect on the n8n side; same fix landed in n8n-nodes-freightutils v0.1.1 in this same fan-out sprint). /api/auth/whoami requires a valid key and returns 401 otherwise.

### Notes

- **Input fields unchanged.** Field keys like `commodityCode`, `originCountry`, `customsValue` on `ukDuty` continue to use camelCase — renaming them would break existing user Zap maps. The /api/duty endpoint accepts both casings on the request body. The `ukDuty` perform function now sends `commodity_code`/`origin_country`/`customs_value` to the API to align the wire format with the canonical convention; user-facing field keys preserved.
- **Title-case warnings on `unlocodeLookup` / `adrLqCheck`** from `zapier validate` — leave as-is per memory (queued for a v0.2.0 breaking pass that re-keys input fields globally).
- Connection label remains static (`'FreightUtils Account'`) per v0.1.1 security fix; D003 warning is the deliberate trade-off.

## 0.1.1 — 2026-04-25

### Fixed
- Connection label no longer interpolates API key prefix (security)
- Search action renamed "Find HS Code" → "HS Code Lookup"
- Input field "Search Query" → "HS Code or Keyword" with help text
- Output field `hscode` → `hs_code` for naming consistency

### Docs
- README: Email by Zapier free-plan To: override known-issue

## 0.1.0 — 2026-04-24

Initial private release. 9 Creates + 8 Searches wrapping the FreightUtils REST API.
