// Nearest airports to a latitude/longitude by great-circle distance.
// Coordinates are input only — never stored or logged by the API.
const perform = async (z, bundle) => {
	const response = await z.request({
		url: 'https://www.freightutils.com/api/nearest-airport',
		method: 'GET',
		params: {
			lat: bundle.inputData.lat,
			lon: bundle.inputData.lon,
			radius_km: bundle.inputData.radius_km || undefined,
			max_results: bundle.inputData.max_results || undefined,
			type: bundle.inputData.type || undefined,
		},
	});
	return response.data.results || [];
};

module.exports = {
	key: 'nearestAirport',
	noun: 'Nearest Airport',
	display: {
		label: 'Find Nearest Airport',
		description: 'Find the airports nearest to a latitude/longitude, sorted by great-circle distance. Reference data only — not for navigation.',
	},
	operation: {
		perform,
		inputFields: [
			{ key: 'lat', label: 'Latitude', type: 'number', required: true, default: '51.47', helpText: 'Decimal degrees, -90 to 90.' },
			{ key: 'lon', label: 'Longitude', type: 'number', required: true, default: '-0.46', helpText: 'Decimal degrees, -180 to 180.' },
			{ key: 'radius_km', label: 'Max Distance (km)', type: 'number', required: false },
			{ key: 'max_results', label: 'Max Results', type: 'integer', required: false, default: '3', helpText: '1-50, default 10.' },
			{ key: 'type', label: 'Airport Type', type: 'string', choices: ['large_airport', 'medium_airport', 'small_airport'], required: false, default: 'large_airport' },
		],
		sample: {
			ident: 'EGLL',
			iata_code: 'LHR',
			name: 'London Heathrow Airport',
			type: 'large_airport',
			municipality: 'London',
			country_name: 'United Kingdom',
			latitude: 51.470748,
			longitude: -0.459909,
			distance_km: 0.1,
		},
		outputFields: [
			{ key: 'ident', label: 'ICAO / Ident', type: 'string' },
			{ key: 'iata_code', label: 'IATA Code', type: 'string' },
			{ key: 'name', label: 'Airport Name', type: 'string' },
			{ key: 'type', label: 'Airport Type', type: 'string' },
			{ key: 'distance_km', label: 'Distance (km)', type: 'number' },
			{ key: 'country_name', label: 'Country', type: 'string' },
		],
	},
};
