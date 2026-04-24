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
			name: '40ft High Cube Container',
			internalLengthCm: 1203,
			internalWidthCm: 235,
			internalHeightCm: 269,
			internalVolumeM3: 76.2,
			maxGrossKg: 32500,
			tareWeightKg: 3940,
		},
		outputFields: [
			{ key: 'slug', label: 'Slug' },
			{ key: 'name', label: 'Name' },
			{ key: 'internalVolumeM3', label: 'Internal Volume (m³)', type: 'number' },
			{ key: 'maxGrossKg', label: 'Max Gross Weight (kg)', type: 'number' },
			{ key: 'tareWeightKg', label: 'Tare Weight (kg)', type: 'number' },
		],
	},
};
