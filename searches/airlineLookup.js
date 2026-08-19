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
		description: 'Look up an airline by 3-digit AWB prefix (6,357 entries).',
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
		// Real /api/airlines row shape (phantom-field cleanup 2026-08-19):
		// iata_code / icao_code / has_cargo, and awb_prefix is an ARRAY.
		sample: {
			slug: 'emirates',
			airline_name: 'Emirates',
			iata_code: 'EK',
			icao_code: 'UAE',
			awb_prefix: ['176'],
			callsign: 'EMIRATES',
			country: 'United Arab Emirates',
			has_cargo: true,
		},
		outputFields: [
			{ key: 'airline_name', label: 'Airline Name' },
			{ key: 'iata_code', label: 'IATA Code' },
			{ key: 'icao_code', label: 'ICAO Code' },
			{ key: 'awb_prefix', label: 'AWB Prefixes' },
			{ key: 'callsign', label: 'Callsign' },
			{ key: 'country', label: 'Country' },
			{ key: 'has_cargo', label: 'Cargo Carrier', type: 'boolean' },
		],
	},
};
