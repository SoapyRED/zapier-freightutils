/**
 * Shipment Summary — composite Create action.
 *
 * Wraps POST /api/shipment/summary, the FreightUtils composite endpoint
 * that chains CBM + chargeable weight + LDM + ADR compliance + UK-duty
 * estimation into a single response. Replaces what otherwise needs 4–5
 * chained Zap steps with one action.
 *
 * Per-item fields use Zapier `list: true` so a single Zap step can
 * declare multiple line items (Length, Width, etc. all accept "Add
 * another value"). The perform function zips the per-field arrays
 * positionally into items[] before posting.
 *
 * Wire compatibility — the website /api/shipment/summary route accepts
 * both snake_case (canonical, v0.3.0+) and camelCase aliases. This
 * action sends snake_case directly. Response shape is camelCase nested
 * (totals.grossWeight, modeSpecific.chargeableWeightRoad, etc.) — the
 * sample below mirrors the live response verbatim.
 */

const perform = async (z, bundle) => {
	const i = bundle.inputData;

	// Zip per-field lists positionally into items[]. Length defines item
	// count; missing values default to undefined and the server's input
	// parser flags any required-field gap with a 400 + clear message.
	const lengths = arr(i.length);
	const widths = arr(i.width);
	const heights = arr(i.height);
	const weights = arr(i.weight);
	const quantities = arr(i.quantity);
	const stackables = arr(i.stackable);
	const descriptions = arr(i.description);
	const palletTypes = arr(i.pallet_type);
	const hsCodes = arr(i.hs_code);
	const unNumbers = arr(i.un_number);
	const customsValues = arr(i.customs_value);

	const itemCount = lengths.length;
	if (itemCount === 0) {
		throw new z.errors.Error('At least one item is required (Length, Width, Height, Weight, Quantity).', 'InvalidInput', 400);
	}

	const items = [];
	for (let idx = 0; idx < itemCount; idx++) {
		items.push({
			description: descriptions[idx] || undefined,
			length: Number(lengths[idx]),
			width: Number(widths[idx]),
			height: Number(heights[idx]),
			weight: Number(weights[idx]),
			quantity: Math.max(1, Math.round(Number(quantities[idx] || 1))),
			stackable: stackables[idx] === undefined ? undefined : Boolean(stackables[idx]),
			pallet_type: palletTypes[idx] || undefined,
			hs_code: hsCodes[idx] || undefined,
			un_number: unNumbers[idx] || undefined,
			customs_value: customsValues[idx] !== undefined && customsValues[idx] !== '' ? Number(customsValues[idx]) : undefined,
		});
	}

	const body = {
		mode: i.mode,
		items,
	};
	if (i.origin_country) body.origin = { country: String(i.origin_country) };
	if (i.destination_country) body.destination = { country: String(i.destination_country) };
	if (i.incoterm) body.incoterm = String(i.incoterm);
	if (i.freight_cost !== undefined && i.freight_cost !== '') body.freight_cost = Number(i.freight_cost);
	if (i.insurance_cost !== undefined && i.insurance_cost !== '') body.insurance_cost = Number(i.insurance_cost);

	const response = await z.request({
		url: 'https://www.freightutils.com/api/shipment/summary',
		method: 'POST',
		body,
	});
	return response.data;
};

// Normalise list-typed input — Zapier passes either a single value or an
// Array depending on UI state. Returns Array always; empty if missing.
function arr(v) {
	if (v === undefined || v === null || v === '') return [];
	return Array.isArray(v) ? v : [v];
}

module.exports = {
	key: 'shipmentSummary',
	noun: 'Shipment Summary',
	display: {
		label: 'Calculate Shipment Summary',
		description:
			'Composite calculation: CBM, chargeable weight, LDM, customs estimate, and DG flags for an entire shipment in one step. Replaces 4–5 chained Zap actions.',
	},
	operation: {
		perform,
		inputFields: [
			{
				key: 'mode',
				label: 'Transport Mode',
				type: 'string',
				required: true,
				default: 'road',
				choices: { road: 'Road', air: 'Air', sea: 'Sea' },
				helpText: 'Drives the chargeable-weight basis (1750 kg/LDM road · 167 kg/CBM air · 1000 kg/CBM sea).',
			},

			// ── Per-item line items (Zapier `list: true` collects N values) ──
			{
				key: 'description',
				label: 'Item Description',
				type: 'string',
				list: true,
				helpText: 'Optional label for each line item. Add one entry per item.',
			},
			{
				key: 'length',
				label: 'Length (cm)',
				type: 'number',
				required: true,
				list: true,
				default: '120',
				helpText: 'Length per item in cm. Add one entry per line item.',
			},
			{
				key: 'width',
				label: 'Width (cm)',
				type: 'number',
				required: true,
				list: true,
				default: '80',
			},
			{
				key: 'height',
				label: 'Height (cm)',
				type: 'number',
				required: true,
				list: true,
				default: '100',
			},
			{
				key: 'weight',
				label: 'Gross Weight (kg per item)',
				type: 'number',
				required: true,
				list: true,
				default: '250',
			},
			{
				key: 'quantity',
				label: 'Quantity',
				type: 'integer',
				required: true,
				list: true,
				default: '1',
			},
			{
				key: 'stackable',
				label: 'Stackable',
				type: 'boolean',
				list: true,
				helpText: 'Defaults to true if omitted. Affects pallet-fitting calculation.',
			},
			{
				key: 'pallet_type',
				label: 'Pallet Type',
				type: 'string',
				list: true,
				choices: { euro: 'Euro (1200×800)', uk: 'UK (1200×1000)', us: 'US (1219×1016)', custom: 'Custom', none: 'None' },
				helpText: 'Optional. Default none. Use "none" for non-pallet items.',
			},
			{
				key: 'hs_code',
				label: 'HS Code',
				type: 'string',
				list: true,
				helpText: '6–10 digit HS / commodity code. Required for UK-duty estimate to populate.',
			},
			{
				key: 'un_number',
				label: 'UN Number',
				type: 'string',
				list: true,
				// Default exercises the DG path so contract-check proves the
				// compliance block (verified live 2026-08-19: present whenever
				// any item carries un_number).
				default: '1203',
				helpText: 'Optional ADR UN number per item (e.g. 1203). Triggers DG compliance flags in the response.',
			},
			{
				key: 'customs_value',
				label: 'Customs Value (GBP per item)',
				type: 'number',
				list: true,
				helpText: 'Optional. Goods value per item in GBP. Used in CIF calculation when an HS code is present.',
			},

			// ── Top-level shipment fields ──────────────────────────────────
			{
				key: 'origin_country',
				label: 'Origin Country (ISO-2)',
				type: 'string',
				helpText: 'Two-letter country code, e.g. GB, CN, DE.',
			},
			{
				key: 'destination_country',
				label: 'Destination Country (ISO-2)',
				type: 'string',
				helpText: 'Two-letter country code, e.g. GB, US, FR.',
			},
			{
				key: 'incoterm',
				label: 'Incoterm',
				type: 'string',
				helpText: 'Optional Incoterms 2020 three-letter code (FOB / CIF / EXW / DAP / DDP / etc.).',
			},
			{
				key: 'freight_cost',
				label: 'Freight Cost (GBP)',
				type: 'number',
				helpText: 'Optional. Used in UK-duty CIF calculation.',
			},
			{
				key: 'insurance_cost',
				label: 'Insurance Cost (GBP)',
				type: 'number',
				helpText: 'Optional. Used in UK-duty CIF calculation.',
			},
		],

		// Sample mirrors the live response shape verbatim (camelCase nested,
		// matching what Zapier users actually see in the variable picker).
		// Captured 2026-04-29 from POST /api/shipment/summary with a 2-item
		// road shipment including a DG (UN 1203) item.
		sample: {
			mode: 'road',
			itemCount: 2,
			totals: {
				pieces: 5,
				grossWeight: 1025,
				volumeCBM: 3.91,
				chargeableWeight: 1575,
				billingBasis: 'volume',
			},
			modeSpecific: {
				loadingMetres: 0.9,
				palletSpaces: 2,
				trailerUtilisation: 6.62,
				suggestedVehicle: '3.5t Luton Van',
				chargeableWeightRoad: 1575,
			},
			compliance: {
				hasDangerousGoods: true,
				adrFlags: {
					unNumbers: ['1203'],
					totalPoints: 75,
					exemptionApplicable: true,
				},
			},
			customs: {
				hsCodesPresent: true,
				canEstimateUkDuty: false,
			},
			warnings: ['Dangerous goods detected — verify ADR compliance before transport'],
			disclaimer: 'Estimate only. Verify with your carrier, customs broker, or freight forwarder.',
			dataVersion: { adr: 'UNECE ADR 2025', hs: 'WCO HS 2022' },
		},

		outputFields: [
			{ key: 'mode', label: 'Mode', type: 'string' },
			{ key: 'itemCount', label: 'Item Count', type: 'integer' },

			{ key: 'totals__pieces', label: 'Total Pieces', type: 'integer' },
			{ key: 'totals__grossWeight', label: 'Total Gross Weight (kg)', type: 'number' },
			{ key: 'totals__volumeCBM', label: 'Total Volume (CBM)', type: 'number' },
			{ key: 'totals__chargeableWeight', label: 'Chargeable Weight (kg)', type: 'number' },
			{ key: 'totals__billingBasis', label: 'Billing Basis (weight | volume)', type: 'string' },

			{ key: 'modeSpecific__loadingMetres', label: 'Loading Metres (road)', type: 'number' },
			{ key: 'modeSpecific__palletSpaces', label: 'Pallet Spaces (road)', type: 'integer' },
			{ key: 'modeSpecific__trailerUtilisation', label: 'Trailer Utilisation % (road)', type: 'number' },
			{ key: 'modeSpecific__suggestedVehicle', label: 'Suggested Vehicle (road)', type: 'string' },
			{ key: 'modeSpecific__chargeableWeightRoad', label: 'Chargeable Weight — Road (kg)', type: 'number' },
			{ key: 'modeSpecific__volumetricWeight', label: 'Volumetric Weight (air, kg)', type: 'number' },
			{ key: 'modeSpecific__chargeableWeightAir', label: 'Chargeable Weight — Air (kg)', type: 'number' },
			{ key: 'modeSpecific__revenueTonnes', label: 'Revenue Tonnes (sea)', type: 'number' },
			{ key: 'modeSpecific__suggestedContainer', label: 'Suggested Container (sea)', type: 'string' },
			{ key: 'modeSpecific__containerCount', label: 'Container Count (sea)', type: 'integer' },
			{ key: 'modeSpecific__chargeableWeightSea', label: 'Chargeable Weight — Sea (kg)', type: 'number' },

			{ key: 'compliance__hasDangerousGoods', label: 'Has Dangerous Goods', type: 'boolean' },
			{ key: 'compliance__adrFlags__totalPoints', label: 'ADR Total Points', type: 'number' },
			{ key: 'compliance__adrFlags__exemptionApplicable', label: 'ADR 1.1.3.6 Exemption Applicable', type: 'boolean' },

			{ key: 'customs__hsCodesPresent', label: 'HS Codes Present', type: 'boolean' },
			{ key: 'customs__canEstimateUkDuty', label: 'Can Estimate UK Duty', type: 'boolean' },

			{ key: 'disclaimer', label: 'Disclaimer', type: 'string' },
		],
	},
};
