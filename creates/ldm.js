const perform = async (z, bundle) => {
	const response = await z.request({
		url: 'https://www.freightutils.com/api/ldm',
		method: 'GET',
		params: {
			pallet: bundle.inputData.pallet,
			qty: bundle.inputData.qty,
		},
	});
	return response.data;
};

module.exports = {
	key: 'ldm',
	noun: 'LDM',
	display: {
		label: 'Calculate LDM',
		description: 'Calculate loading metres from a pallet preset and quantity.',
	},
	operation: {
		perform,
		inputFields: [
			{
				key: 'pallet',
				label: 'Pallet Type',
				type: 'string',
				required: true,
				default: 'euro',
				choices: {
					euro: 'Euro (1200×800)',
					'uk-standard': 'UK Standard (1200×1000)',
					half: 'Half Pallet (800×600)',
					quarter: 'Quarter Pallet (600×400)',
				},
			},
			{ key: 'qty', label: 'Quantity', type: 'number', required: true, default: '10' },
		],
		sample: {
			ldm: 4,
			pallet_type: 'euro',
			quantity: 10,
			trailer_width_m: 2.4,
		},
		outputFields: [
			{ key: 'ldm', label: 'LDM', type: 'number' },
			{ key: 'pallet_type', label: 'Pallet Type' },
			{ key: 'quantity', label: 'Quantity', type: 'number' },
		],
	},
};
