# Changelog

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
