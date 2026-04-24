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
					grossWeight: bundle.inputData.grossWeight,
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
			{ key: 'grossWeight', label: 'Gross Weight (kg)', type: 'number', required: true, default: '25' },
			{ key: 'quantity', label: 'Quantity', type: 'number', required: true, default: '2' },
		],
		sample: {
			mode: 'air',
			totals: {
				cbm: 0.144,
				weight_kg: 50,
				ldm: 0.1,
				chargeable_weight_kg: 50,
			},
		},
		outputFields: [
			{ key: 'mode', label: 'Mode' },
			{ key: 'totals__cbm', label: 'Total CBM', type: 'number' },
			{ key: 'totals__weight_kg', label: 'Total Weight (kg)', type: 'number' },
			{ key: 'totals__chargeable_weight_kg', label: 'Total Chargeable Weight (kg)', type: 'number' },
		],
	},
};
