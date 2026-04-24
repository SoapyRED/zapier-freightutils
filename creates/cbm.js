const perform = async (z, bundle) => {
	const response = await z.request({
		url: 'https://www.freightutils.com/api/cbm',
		method: 'GET',
		params: {
			l: bundle.inputData.l,
			w: bundle.inputData.w,
			h: bundle.inputData.h,
		},
	});
	return response.data;
};

module.exports = {
	key: 'cbm',
	noun: 'CBM',
	display: {
		label: 'Calculate CBM',
		description: 'Calculate cubic metres from item dimensions.',
	},
	operation: {
		perform,
		inputFields: [
			{ key: 'l', label: 'Length (cm)', type: 'number', required: true, default: '120' },
			{ key: 'w', label: 'Width (cm)', type: 'number', required: true, default: '80' },
			{ key: 'h', label: 'Height (cm)', type: 'number', required: true, default: '100' },
		],
		sample: {
			length_cm: 120,
			width_cm: 80,
			height_cm: 100,
			total_cbm: 0.96,
			cubic_feet: 33.9,
			revenue_tonnes: 1,
		},
		outputFields: [
			{ key: 'total_cbm', label: 'Total CBM', type: 'number' },
			{ key: 'cubic_feet', label: 'Cubic Feet', type: 'number' },
			{ key: 'revenue_tonnes', label: 'Revenue Tonnes', type: 'number' },
		],
	},
};
