# zapier-freightutils

[![GitHub release](https://img.shields.io/github/v/release/SoapyRED/zapier-freightutils)](https://github.com/SoapyRED/zapier-freightutils/releases)
[![License: MIT](https://img.shields.io/github/license/SoapyRED/zapier-freightutils)](https://opensource.org/licenses/MIT)

Zapier integration for [FreightUtils](https://www.freightutils.com) — free freight tools API. **Currently private** (invite-only). Public Zapier marketplace listing is queued for v0.2.0+.

## What's in this release

17 operations — **9 Creates** and **8 Searches** — wrapping the FreightUtils REST API.

**Creates**
- Calculate CBM
- Calculate LDM
- Calculate Chargeable Weight
- Calculate Consignment (single-line totals)
- Calculate Pallet Fitting
- Convert Units
- Check ADR LQ/EQ Eligibility
- Calculate ADR 1.1.3.6 Exemption
- Calculate UK Import Duty

**Searches**
- Find ADR Entry
- HS Code Lookup
- Find Incoterm
- Find Airline
- Find UN/LOCODE Location
- Find ULD (Unit Load Device)
- Find Sea-Freight Container
- Find Road-Freight Vehicle

## Install

The app is **private** during v0.1.0 — accept the invite URL below to add it to your Zapier account, then it appears under **Your Apps** in the connector picker.

**Invite URL (all versions):** <https://zapier.com/developer/public-invite/240886/145e481391f55dc7f247e59cc2b5d855/>

**Invite URL (v0.1.0 specific):** <https://zapier.com/developer/public-invite/240886/495444/00fc64ef006cef74d55db1356b548b24/>

Authenticate with your FreightUtils API key; the test call hits `/api/health` — green tick means auth works end to end.

## Get an API key

Generate a free key (100 req/day) at <https://www.freightutils.com/api-docs>. Upgrade to Pro (50,000 req/month, £19) via <https://www.freightutils.com/pricing>.

Rate limits:

| Tier | Limit |
|------|-------|
| Free | 100 req/day |
| Pro | 50,000 req/month |

## Worked example A — calculate chargeable weight on each new shipment row

**Trigger** — Google Sheets: New Row in `Incoming Shipments` tab (columns: `length_cm`, `width_cm`, `height_cm`, `gross_weight_kg`).

**Action** — FreightUtils: *Calculate Chargeable Weight*. Map:
- Length (cm) → `{{length_cm}}`
- Width (cm) → `{{width_cm}}`
- Height (cm) → `{{height_cm}}`
- Gross Weight (kg) → `{{gross_weight_kg}}`

**Action** — Google Sheets: Update Row. Write `chargeable_weight_kg` and `volumetric_weight_kg` back to the same row.

## Worked example B — HS code → UK duty from an email

**Trigger** — Gmail: New Email matching `subject:"New import query"` with body line `SKU: <description>, Origin: <XX>, Value: £<n>`.

**Action** — Zapier AI Action or Formatter: extract `sku_description`, `origin_country`, `customs_value`.

**Action** — FreightUtils: *HS Code Lookup*. Query → `{{sku_description}}`. Returns a list of candidate HS codes.

**Filter** — only continue if the top match has `hs_code` populated.

**Action** — FreightUtils: *Calculate UK Import Duty*. Commodity Code → `{{hs_code}}`, Origin Country → `{{origin_country}}`, Customs Value → `{{customs_value}}`.

**Action** — Slack: Send Message. Template: `HS: {{hs_code}} · Duty: £{{duty_gbp}} · VAT: £{{vat_gbp}} · Total: £{{total_gbp}}`.

## Known Constraints

**Email by Zapier (free plan)** — Zapier's free-plan Email by Zapier action silently overrides the To: field and sends only to the account owner's email address regardless of input. This is a Zapier platform behaviour, not a FreightUtils issue. For arbitrary recipients use Gmail, Outlook, or SendGrid actions instead.

## Roadmap

- **v0.2.0** — public Zapier marketplace listing submission (after dogfooding + feedback)
- **v0.3.0** — custom dynamic dropdowns (e.g., live HS chapter picker)
- Later — triggers on FreightUtils events when those exist

## Links

- FreightUtils: <https://www.freightutils.com>
- API docs: <https://www.freightutils.com/api-docs>
- Pricing: <https://www.freightutils.com/pricing>
- Status: <https://www.freightutils.com/status>
- Changelog: <https://www.freightutils.com/changelog>
- Repo: <https://github.com/SoapyRED/zapier-freightutils>
- Issues: <https://github.com/SoapyRED/zapier-freightutils/issues>
- Sibling n8n package: <https://www.npmjs.com/package/n8n-nodes-freightutils>

## Licence

MIT — see [LICENSE.md](LICENSE.md).

Built by [Marius Cristoiu](https://www.linkedin.com/in/marius-cristoiu-a853812a2/), ADR-certified freight transport planner.
