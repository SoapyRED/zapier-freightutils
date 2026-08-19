const perform = async (z, bundle) => {
	const response = await z.request({
		url: 'https://www.freightutils.com/api/adr-calculator',
		method: 'GET',
		params: {
			un: bundle.inputData.un,
			qty: bundle.inputData.qty,
		},
	});
	return response.data;
};

module.exports = {
	key: 'adrExemption',
	noun: 'ADR Exemption',
	display: {
		label: 'Calculate ADR 1.1.3.6 Exemption',
		description: 'Transport-category points against the 1000-point small-load threshold.',
	},
	operation: {
		perform,
		inputFields: [
			{
				key: 'un',
				label: 'UN Number',
				type: 'string',
				required: true,
				default: '1203',
				helpText: '1–4 digit UN number',
			},
			{
				key: 'qty',
				label: 'Quantity (kg or L)',
				type: 'number',
				required: true,
				default: '200',
				helpText: 'Amount of the substance on the vehicle',
			},
		],
		// Sample is the REAL /api/adr-calculator?un=1203&qty=200 response
		// (phantom-field cleanup 2026-08-19): the endpoint returns an items[]
		// array — the old single-substance sample shape never existed, and
		// transport_category / multiplier live on the items, not top-level.
		sample: {
			items: [
				{
					un_number: '1203',
					proper_shipping_name: 'MOTOR SPIRIT or GASOLINE or PETROL',
					class: '3',
					packing_group: 'II',
					variant_index: 0,
					transport_category: '2',
					quantity: 200,
					multiplier: 3,
					points: 600,
				},
			],
			total_points: 600,
			threshold: 1000,
			exempt: true,
			has_category_zero: false,
			has_quantity_exceedance: false,
			warnings: [],
			message: '1.1.3.6 exemption applies',
		},
		outputFields: [
			{ key: 'total_points', label: 'Total Points', type: 'number' },
			{ key: 'exempt', label: 'Exempt Under 1.1.3.6', type: 'boolean' },
			{ key: 'threshold', label: 'Threshold', type: 'number' },
			{ key: 'items[]transport_category', label: 'Item Transport Category' },
			{ key: 'items[]multiplier', label: 'Item Multiplier', type: 'number' },
			{ key: 'items[]points', label: 'Item Points', type: 'number' },
			// Scope verdicts (2026-08-19): Table A rows listed NOT SUBJECT TO ADR /
			// CARRIAGE PROHIBITED never enter the 1.1.3.6 math — the API states the
			// scope instead of a points verdict. Conditional: present only when the
			// load carries a scope-remark row (e.g. un=1845) — see contract-known-gaps.
			{ key: 'message', label: 'Verdict Message', type: 'string' },
			{ key: 'not_subject_to_adr', label: 'Not Subject To ADR (road)', type: 'boolean' },
			{ key: 'conditions_ref', label: 'Carriage Conditions Section (e.g. 5.5.3)', type: 'string' },
			{ key: 'carriage_prohibited', label: 'Carriage Prohibited (Table A)', type: 'boolean' },
		],
	},
};
