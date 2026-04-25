const perform = async (z, bundle) => {
	const response = await z.request({
		url: 'https://www.freightutils.com/api/vehicles',
		method: 'GET',
		params: { category: bundle.inputData.category },
	});
	return response.data.results || [];
};

module.exports = {
	key: 'vehicleLookup',
	noun: 'Vehicle',
	display: {
		label: 'Find Road-Freight Vehicle',
		description: 'Look up a road-freight vehicle / trailer type.',
	},
	operation: {
		perform,
		inputFields: [
			{
				key: 'category',
				label: 'Category',
				type: 'string',
				required: true,
				default: 'van',
				choices: {
					van: 'Van',
					rigid: 'Rigid',
					articulated: 'Articulated',
					trailer: 'Trailer',
				},
			},
		],
		sample: {
			slug: 'luton-van',
			name: 'Luton Van 3.5T',
			category: 'van',
			region: 'EU',
			internal_dimensions: { length: 4100, width: 2100, height: 2100 },
			door_dimensions: { width: 2000, height: 2000 },
			max_payload: 1000,
			gross_vehicle_weight: 3500,
			euro_pallets: 5,
			uk_pallets: null,
			us_pallets: null,
		},
		outputFields: [
			{ key: 'slug', label: 'Slug' },
			{ key: 'name', label: 'Name' },
			{ key: 'category', label: 'Category' },
			{ key: 'region', label: 'Region' },
			{ key: 'max_payload', label: 'Max Payload (kg)', type: 'number' },
			{ key: 'gross_vehicle_weight', label: 'Gross Vehicle Weight (kg)', type: 'number' },
			{ key: 'euro_pallets', label: 'Euro Pallets', type: 'number' },
		],
	},
};
