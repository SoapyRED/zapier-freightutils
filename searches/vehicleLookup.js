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
			slug: 'standard-curtainsider',
			name: 'Standard Curtainsider',
			category: 'articulated',
			length_m: 13.6,
			width_m: 2.45,
			height_m: 2.7,
			max_payload_kg: 24000,
			pallet_capacity_euro: 33,
		},
		outputFields: [
			{ key: 'slug', label: 'Slug' },
			{ key: 'name', label: 'Name' },
			{ key: 'category', label: 'Category' },
			{ key: 'length_m', label: 'Length (m)', type: 'number' },
			{ key: 'max_payload_kg', label: 'Max Payload (kg)', type: 'number' },
			{ key: 'pallet_capacity_euro', label: 'Euro Pallet Capacity', type: 'number' },
		],
	},
};
