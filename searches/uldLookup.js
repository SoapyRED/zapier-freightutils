const perform = async (z, bundle) => {
	const response = await z.request({
		url: 'https://www.freightutils.com/api/uld',
		method: 'GET',
		params: { type: bundle.inputData.type },
	});
	const result = response.data && response.data.result;
	return result ? [result] : [];
};

module.exports = {
	key: 'uldLookup',
	noun: 'ULD',
	display: {
		label: 'Find ULD (Unit Load Device)',
		description: 'Look up an air-freight ULD spec by type code (AKE, PMC, PLA, etc.).',
	},
	operation: {
		perform,
		inputFields: [
			{
				key: 'type',
				label: 'ULD Type',
				type: 'string',
				required: true,
				default: 'AKE',
				helpText: 'ULD type code, e.g. AKE (LD3), PMC, PLA',
			},
		],
		sample: {
			code: 'AKE',
			name: 'LD3',
			slug: 'ake-ld3',
			category: 'container',
			deck_position: 'lower',
			external_dimensions: { length: 156, width: 153, height: 163 },
			internal_dimensions: { length: 150, width: 147, height: 155 },
			door_dimensions: { width: 147, height: 152 },
			max_gross_weight: 1588,
			tare_weight: 83,
			usable_volume: 4.3,
			compatible_aircraft: ['B777', 'B767', 'A330', 'A350'],
		},
		outputFields: [
			{ key: 'code', label: 'IATA Code' },
			{ key: 'name', label: 'Name' },
			{ key: 'slug', label: 'Slug' },
			{ key: 'category', label: 'Category' },
			{ key: 'deck_position', label: 'Deck Position' },
			{ key: 'max_gross_weight', label: 'Max Gross Weight (kg)', type: 'number' },
			{ key: 'tare_weight', label: 'Tare Weight (kg)', type: 'number' },
			{ key: 'usable_volume', label: 'Usable Volume (m³)', type: 'number' },
		],
	},
};
