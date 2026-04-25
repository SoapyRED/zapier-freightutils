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
		sample: {
			mode: 'air',
			billing_basis: 'weight',
			suggested_vehicle: '3.5t Luton Van',
			totals: {
				cbm: 0.144,
				gross_weight_kg: 50,
				ldm: 0.1,
				chargeable_weight_air: 50,
				chargeable_weight_road: 175,
				chargeable_weight_sea: 144,
				revenue_tonnes: 0.144,
				pallet_spaces: 1,
				item_count: 1,
				piece_count: 2,
			},
		},
		outputFields: [
			{ key: 'mode', label: 'Mode' },
			{ key: 'billing_basis', label: 'Billing Basis' },
			{ key: 'suggested_vehicle', label: 'Suggested Vehicle' },
			{ key: 'totals__cbm', label: 'Total CBM', type: 'number' },
			{ key: 'totals__gross_weight_kg', label: 'Total Gross Weight (kg)', type: 'number' },
			{ key: 'totals__ldm', label: 'Total LDM', type: 'number' },
			{ key: 'totals__chargeable_weight_air', label: 'Chargeable Weight — Air (kg)', type: 'number' },
			{ key: 'totals__chargeable_weight_road', label: 'Chargeable Weight — Road (kg)', type: 'number' },
			{ key: 'totals__chargeable_weight_sea', label: 'Chargeable Weight — Sea (kg)', type: 'number' },
			{ key: 'totals__revenue_tonnes', label: 'Revenue Tonnes', type: 'number' },
		],
	},
};
