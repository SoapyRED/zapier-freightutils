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
		sample: {
			un_number: '1203',
			quantity: 200,
			transport_category: 2,
			multiplier: 3,
			total_points: 600,
			exempt: true,
			threshold: 1000,
		},
		outputFields: [
			{ key: 'total_points', label: 'Total Points', type: 'number' },
			{ key: 'exempt', label: 'Exempt Under 1.1.3.6', type: 'boolean' },
			{ key: 'transport_category', label: 'Transport Category', type: 'number' },
			{ key: 'multiplier', label: 'Multiplier', type: 'number' },
		],
	},
};
