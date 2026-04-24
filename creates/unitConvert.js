const perform = async (z, bundle) => {
	const response = await z.request({
		url: 'https://www.freightutils.com/api/convert',
		method: 'GET',
		params: {
			value: bundle.inputData.value,
			from: bundle.inputData.from,
			to: bundle.inputData.to,
		},
	});
	return response.data;
};

module.exports = {
	key: 'unitConvert',
	noun: 'Unit Conversion',
	display: {
		label: 'Convert Units',
		description: 'Convert between freight units (kg↔lbs, m↔ft, m3↔ft3, L↔gal, etc.).',
	},
	operation: {
		perform,
		inputFields: [
			{ key: 'value', label: 'Value', type: 'number', required: true, default: '100' },
			{
				key: 'from',
				label: 'From Unit',
				type: 'string',
				required: true,
				default: 'kg',
				helpText: 'Unit code: kg, lbs, g, oz, m, ft, cm, in, m3, ft3, l, gal-us, gal-uk',
			},
			{
				key: 'to',
				label: 'To Unit',
				type: 'string',
				required: true,
				default: 'lbs',
				helpText: 'Target unit — must be the same dimension as From (mass, length, volume)',
			},
		],
		sample: {
			from: { value: 100, unit: 'kg' },
			result: { value: 220.46, unit: 'lbs' },
		},
		outputFields: [
			{ key: 'result__value', label: 'Converted Value', type: 'number' },
			{ key: 'result__unit', label: 'Target Unit' },
		],
	},
};
