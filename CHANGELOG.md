# Changelog

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
