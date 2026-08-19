// Airport lookup by IATA code, ICAO code, or name/city search — 85,555
// airports from OurAirports (public domain).
const perform = async (z, bundle) => {
	const params = {};
	if (bundle.inputData.iata) params.iata = bundle.inputData.iata;
	if (bundle.inputData.icao) params.icao = bundle.inputData.icao;
	if (bundle.inputData.q) params.q = bundle.inputData.q;
	if (!Object.keys(params).length) {
		throw new z.errors.HaltedError('Provide an IATA code, an ICAO code, or a name/city search term.');
	}
	const response = await z.request({
		url: 'https://www.freightutils.com/api/airports',
		method: 'GET',
		params,
	});
	return response.data.results || [];
};

module.exports = {
	key: 'airportLookup',
	noun: 'Airport',
	display: {
		label: 'Find Airport',
		description: 'Look up an airport by IATA code, ICAO code, or name/city search. 85,555 airports from OurAirports open data.',
	},
	operation: {
		perform,
		inputFields: [
			{ key: 'iata', label: 'IATA Code', type: 'string', required: false, default: 'LHR', helpText: '3-letter IATA code, e.g. LHR. Provide one of IATA, ICAO, or search term.' },
			{ key: 'icao', label: 'ICAO Code', type: 'string', required: false, helpText: '4-letter ICAO code, e.g. EGLL.' },
			{ key: 'q', label: 'Name or City', type: 'string', required: false, helpText: 'Search by airport name or city, e.g. heathrow.' },
		],
		sample: {
			ident: 'EGLL',
			iata_code: 'LHR',
			name: 'London Heathrow Airport',
			type: 'large_airport',
			municipality: 'London',
			region: 'England',
			country: 'GB',
			country_name: 'United Kingdom',
			latitude: 51.470748,
			longitude: -0.459909,
			elevation_ft: 83,
		},
		outputFields: [
			{ key: 'ident', label: 'ICAO / Ident', type: 'string' },
			{ key: 'iata_code', label: 'IATA Code', type: 'string' },
			{ key: 'name', label: 'Airport Name', type: 'string' },
			{ key: 'type', label: 'Airport Type', type: 'string' },
			{ key: 'municipality', label: 'City', type: 'string' },
			{ key: 'country_name', label: 'Country', type: 'string' },
			{ key: 'latitude', label: 'Latitude', type: 'number' },
			{ key: 'longitude', label: 'Longitude', type: 'number' },
		],
	},
};
