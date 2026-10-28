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
			packing_instructions: 'P001 IBC02 R001',
			special_packing_provisions: 'BB2',
			mixed_packing_provisions: 'MP19',
			portable_tank_instructions: 'T4',
			portable_tank_special_provisions: 'TP1',
			tank_code: 'LGBF',
			tank_special_provisions: 'TU9',
			vehicle_for_tank_carriage: 'FL',
			carriage_packages: null,
			carriage_bulk: null,
			carriage_loading_unloading_handling: null,
			carriage_operation: 'S2 S20',
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
			// Table A columns (8)–(14) and (16)–(19), served since 2026-10-28: codes, null when empty.
			{ key: 'packing_instructions', label: 'Packing Instructions (Table A col 8)' },
			{ key: 'special_packing_provisions', label: 'Special Packing Provisions (col 9a)' },
			{ key: 'mixed_packing_provisions', label: 'Mixed Packing Provisions (col 9b)' },
			{ key: 'portable_tank_instructions', label: 'Portable Tank Instructions (col 10)' },
			{ key: 'portable_tank_special_provisions', label: 'Portable Tank Special Provisions (col 11)' },
			{ key: 'tank_code', label: 'ADR Tank Code (col 12)' },
			{ key: 'tank_special_provisions', label: 'ADR Tank Special Provisions (col 13)' },
			{ key: 'vehicle_for_tank_carriage', label: 'Vehicle for Tank Carriage (col 14)' },
			{ key: 'carriage_packages', label: 'Carriage Special Provisions: Packages (col 16)' },
			{ key: 'carriage_bulk', label: 'Carriage Special Provisions: Bulk (col 17)' },
			{ key: 'carriage_loading_unloading_handling', label: 'Carriage Special Provisions: Loading, Unloading and Handling (col 18)' },
			{ key: 'carriage_operation', label: 'Carriage Special Provisions: Operation (col 19)' },
			// Sparse Table A scope flags (28 rows, 2026-08-19): present only when
			// the entry is NOT SUBJECT TO ADR / CARRIAGE PROHIBITED — conditional,
			// see contract-known-gaps.
			{ key: 'not_subject_to_adr', label: 'Not Subject To ADR (road)', type: 'boolean' },
			{ key: 'conditions_ref', label: 'Carriage Conditions Section (e.g. 5.5.3)' },
			{ key: 'carriage_prohibited', label: 'Carriage Prohibited (Table A)', type: 'boolean' },
		],
	},
};
