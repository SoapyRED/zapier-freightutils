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
		sample: {
			un_number: '1203',
			proper_shipping_name: 'MOTOR SPIRIT or GASOLINE or PETROL',
			class: '3',
			packing_group: 'II',
			transport_category: 2,
			tunnel_code: 'D/E',
		},
		outputFields: [
			{ key: 'un_number', label: 'UN Number' },
			{ key: 'proper_shipping_name', label: 'Proper Shipping Name' },
			{ key: 'class', label: 'Class' },
			{ key: 'packing_group', label: 'Packing Group' },
			{ key: 'transport_category', label: 'Transport Category', type: 'number' },
			{ key: 'tunnel_code', label: 'Tunnel Code' },
		],
	},
};
