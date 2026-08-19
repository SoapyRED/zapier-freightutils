const perform = async (z, bundle) => {
	const response = await z.request({
		url: 'https://www.freightutils.com/api/adr',
		method: 'GET',
		params: { un: bundle.inputData.un },
	});
	return response.data.results || [];
};

module.exports = {
	key: 'adrLookup',
	noun: 'ADR Entry',
	display: {
		label: 'Find ADR Entry',
		description: 'Look up an ADR 2025 dangerous-goods entry by UN number.',
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
				helpText: '1–4 digit UN number, e.g. 1203 for petrol',
			},
		],
		// Real /api/adr row shape (phantom-field cleanup 2026-08-19): the tunnel
		// field is tunnel_restriction_code, stored WITH parentheses.
		sample: {
			un_number: '1203',
			proper_shipping_name: 'MOTOR SPIRIT or GASOLINE or PETROL',
			class: '3',
			packing_group: 'II',
			transport_category: '2',
			tunnel_restriction_code: '(D/E)',
			limited_quantity: '1 L',
			excepted_quantity: 'E2',
		},
		outputFields: [
			{ key: 'un_number', label: 'UN Number' },
			{ key: 'proper_shipping_name', label: 'Proper Shipping Name' },
			{ key: 'class', label: 'Class' },
			{ key: 'packing_group', label: 'Packing Group' },
			{ key: 'transport_category', label: 'Transport Category' },
			{ key: 'tunnel_restriction_code', label: 'Tunnel Restriction Code' },
			{ key: 'limited_quantity', label: 'Limited Quantity' },
			{ key: 'excepted_quantity', label: 'Excepted Quantity' },
			// Sparse Table A scope flags (28 rows, 2026-08-19): present only when
			// the entry is NOT SUBJECT TO ADR / CARRIAGE PROHIBITED — conditional,
			// see contract-known-gaps.
			{ key: 'not_subject_to_adr', label: 'Not Subject To ADR (road)', type: 'boolean' },
			{ key: 'conditions_ref', label: 'Carriage Conditions Section (e.g. 5.5.3)' },
			{ key: 'carriage_prohibited', label: 'Carriage Prohibited (Table A)', type: 'boolean' },
		],
	},
};
