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
			code: 'NLRTM',
			country: 'NL',
			location_code: 'RTM',
			name: 'Rotterdam',
			name_ascii: 'Rotterdam',
			subdivision: 'ZH',
			functions: ['port', 'rail', 'road', 'airport', 'postal'],
			status: 'AF',
			coordinates: { lat: 51.92, lon: 4.5 },
			iata_code: null,
		},
		outputFields: [
			{ key: 'code', label: 'UN/LOCODE' },
			{ key: 'country', label: 'Country (ISO Alpha-2)' },
			{ key: 'location_code', label: 'Location Code' },
			{ key: 'name', label: 'Location Name' },
			{ key: 'name_ascii', label: 'Location Name (ASCII)' },
			{ key: 'subdivision', label: 'Subdivision' },
			{ key: 'iata_code', label: 'IATA Code' },
		],
	},
};
