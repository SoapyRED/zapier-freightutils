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
			internal_volume_m3: 4.3,
			max_gross_kg: 1588,
			external_length_cm: 156,
			external_width_cm: 153,
			external_height_cm: 163,
		},
		outputFields: [
			{ key: 'code', label: 'Code' },
			{ key: 'name', label: 'Name' },
			{ key: 'internal_volume_m3', label: 'Internal Volume (m³)', type: 'number' },
			{ key: 'max_gross_kg', label: 'Max Gross Weight (kg)', type: 'number' },
		],
	},
};
