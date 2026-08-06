const perform = async (z, bundle) => {
	const response = await z.request({
		url: 'https://www.freightutils.com/api/consignment',
		method: 'POST',
		body: {
			mode: bundle.inputData.mode,
			items: [
				{
					length: bundle.inputData.length,
					width: bundle.inputData.width,
					height: bundle.inputData.height,
					// /api/consignment input parser only recognises camelCase aliases on
					// item fields. Map snake_case (Zapier inputs) → camelCase (wire).
					grossWeight: bundle.inputData.gross_weight,
					quantity: bundle.inputData.quantity,
				},
			],
		},
	});
	return response.data;
};

module.exports = {
	key: 'consignment',
	noun: 'Consignment',
	display: {
		label: 'Calculate Consignment',
		description: 'Totals (CBM, weight, LDM, chargeable weight) for a single-line consignment.',
	},
	operation: {
		perform,
		inputFields: [
			{
				key: 'mode',
				label: 'Mode',
				type: 'string',
				required: true,
				default: 'air',
				choices: { air: 'Air', road: 'Road', sea: 'Sea' },
			},
			{ key: 'length', label: 'Length (cm)', type: 'number', required: true, default: '60' },
			{ key: 'width', label: 'Width (cm)', type: 'number', required: true, default: '40' },
			{ key: 'height', label: 'Height (cm)', type: 'number', required: true, default: '30' },
			{ key: 'gross_weight', label: 'Gross Weight (kg)', type: 'number', required: true, default: '25' },
			{ key: 'quantity', label: 'Quantity', type: 'number', required: true, default: '2' },
		],
		// SAMPLE AND OUTPUT FIELDS ARE COPIED FROM A REAL /api/consignment RESPONSE,
		// curled from production on 2026-08-06, not written from what the action ought
		// to return. Five fields declared here had never been returned by anything:
		//
		//   suggested_vehicle          — the engine emits NO vehicle suggestion at all.
		//                                A different tool (shipment_summary) does; this
		//                                one never has.
		//   billing_basis (top level)  — real, but it lives at totals.billing_basis.
		//   totals__chargeable_weight_air / _road / _sea
		//                              — the response carries ONE chargeable weight,
		//                                totals.chargeable_weight_kg, computed for the
		//                                mode you asked for. There is no per-mode trio.
		//
		// The sample also claimed totals.pallet_spaces and totals.item_count; the real
		// names are line_count and piece_count, and there is no pallet_spaces.
		//
		// Why this matters more than a wrong label: Zapier renders outputFields in the
		// step mapper, so every one of these was offered to users as something they
		// could map. Anyone who mapped one has a step that has silently produced an
		// empty value on every run since. Nothing about the request changes here — this
		// is a declaration fix, and the fields that were REAL keep their exact keys.
		sample: {
			schema_version: 'consignment.v1',
			mode: 'air',
			air_volumetric_divisor: 6000,
			totals: {
				cbm: 0.144,
				gross_weight_kg: 50,
				ldm: 0.2,
				volumetric_weight_kg: 24,
				revenue_tonnes: 0.144,
				chargeable_weight_kg: 50,
				line_count: 1,
				piece_count: 2,
				billing_basis: 'weight',
			},
		},
		outputFields: [
			{ key: 'mode', label: 'Mode' },
			{ key: 'schema_version', label: 'Schema Version' },
			{ key: 'air_volumetric_divisor', label: 'Air Volumetric Divisor', type: 'number' },
			{ key: 'totals__cbm', label: 'Total CBM', type: 'number' },
			{ key: 'totals__gross_weight_kg', label: 'Total Gross Weight (kg)', type: 'number' },
			{ key: 'totals__ldm', label: 'Total LDM', type: 'number' },
			{ key: 'totals__volumetric_weight_kg', label: 'Total Volumetric Weight (kg)', type: 'number' },
			{ key: 'totals__chargeable_weight_kg', label: 'Chargeable Weight (kg) — for the mode requested', type: 'number' },
			{ key: 'totals__revenue_tonnes', label: 'Revenue Tonnes', type: 'number' },
			{ key: 'totals__line_count', label: 'Line Count', type: 'number' },
			{ key: 'totals__piece_count', label: 'Piece Count', type: 'number' },
			{ key: 'totals__billing_basis', label: 'Billing Basis (weight or volume)' },
		],
	},
};
