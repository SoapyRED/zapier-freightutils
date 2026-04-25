const perform = async (z, bundle) => {
	const response = await z.request({
		url: 'https://www.freightutils.com/api/containers',
		method: 'GET',
		params: { type: bundle.inputData.type },
	});
	return response.data ? [response.data] : [];
};

module.exports = {
	key: 'containerLookup',
	noun: 'Container',
	display: {
		label: 'Find Sea-Freight Container',
		description: 'Look up ISO container dimensions and capacity by slug.',
	},
	operation: {
		perform,
		inputFields: [
			{
				key: 'type',
				label: 'Container Type',
				type: 'string',
				required: true,
				default: '40ft-high-cube',
				helpText: 'Slug, e.g. 20ft-standard, 40ft-standard, 40ft-high-cube, 20ft-reefer',
			},
		],
		sample: {
			slug: '40ft-high-cube',
			name: '40ft High Cube',
			internal_length_cm: 1203,
			internal_width_cm: 234,
			internal_height_cm: 269,
			capacity_cbm: 76.3,
			external_length_cm: 1219,
			external_width_cm: 244,
			external_height_cm: 290,
			door_width_cm: 234,
			door_height_cm: 259,
			tare_weight_kg: 3940,
			max_gross_kg: 30480,
			max_payload_kg: 26540,
			euro_pallets: '23–24',
			gma_pallets: '20',
		},
		outputFields: [
			{ key: 'slug', label: 'Slug' },
			{ key: 'name', label: 'Name' },
			{ key: 'internal_length_cm', label: 'Internal Length (cm)', type: 'number' },
			{ key: 'internal_width_cm', label: 'Internal Width (cm)', type: 'number' },
			{ key: 'internal_height_cm', label: 'Internal Height (cm)', type: 'number' },
			{ key: 'capacity_cbm', label: 'Capacity (CBM)', type: 'number' },
			{ key: 'max_gross_kg', label: 'Max Gross Weight (kg)', type: 'number' },
			{ key: 'max_payload_kg', label: 'Max Payload (kg)', type: 'number' },
			{ key: 'tare_weight_kg', label: 'Tare Weight (kg)', type: 'number' },
		],
	},
};
