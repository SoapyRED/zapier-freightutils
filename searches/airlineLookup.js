const perform = async (z, bundle) => {
	const response = await z.request({
		url: 'https://www.freightutils.com/api/airlines',
		method: 'GET',
		params: { prefix: bundle.inputData.prefix },
	});
	return response.data.results || [];
};

module.exports = {
	key: 'airlineLookup',
	noun: 'Airline',
	display: {
		label: 'Find Airline',
		description: 'Look up an airline by 3-digit AWB prefix (6,352 entries, 390 cargo carriers).',
	},
	operation: {
		perform,
		inputFields: [
			{
				key: 'prefix',
				label: 'AWB Prefix',
				type: 'string',
				required: true,
				default: '176',
				helpText: '3-digit IATA AWB prefix, e.g. 176 for Emirates SkyCargo',
			},
		],
		sample: {
			airline_name: 'Emirates SkyCargo',
			iata: 'EK',
			icao: 'UAE',
			awb_prefix: '176',
			country: 'United Arab Emirates',
			cargo: true,
		},
		outputFields: [
			{ key: 'airline_name', label: 'Airline Name' },
			{ key: 'iata', label: 'IATA Code' },
			{ key: 'icao', label: 'ICAO Code' },
			{ key: 'awb_prefix', label: 'AWB Prefix' },
			{ key: 'country', label: 'Country' },
			{ key: 'cargo', label: 'Cargo Carrier', type: 'boolean' },
		],
	},
};
