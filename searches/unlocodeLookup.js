const perform = async (z, bundle) => {
	const response = await z.request({
		url: 'https://www.freightutils.com/api/unlocode',
		method: 'GET',
		params: { q: bundle.inputData.q },
	});
	return response.data.results || [];
};

module.exports = {
	key: 'unlocodeLookup',
	noun: 'UN/LOCODE',
	display: {
		label: 'Find UN/LOCODE Location',
		description: 'Search UNECE UN/LOCODE 2024-2 (116,000+ transport locations).',
	},
	operation: {
		perform,
		inputFields: [
			{
				key: 'q',
				label: 'Search Query',
				type: 'string',
				required: true,
				default: 'rotterdam',
				helpText: 'Location name, partial code, or country-subdivision',
			},
		],
		sample: {
			locode: 'NLRTM',
			name: 'Rotterdam',
			country: 'NL',
			subdivision: 'ZH',
			function: 'port',
		},
		outputFields: [
			{ key: 'locode', label: 'LOCODE' },
			{ key: 'name', label: 'Location Name' },
			{ key: 'country', label: 'Country (ISO Alpha-2)' },
			{ key: 'subdivision', label: 'Subdivision' },
			{ key: 'function', label: 'Function' },
		],
	},
};
