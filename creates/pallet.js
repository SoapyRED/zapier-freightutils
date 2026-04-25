const perform = async (z, bundle) => {
	const response = await z.request({
		url: 'https://www.freightutils.com/api/pallet',
		method: 'GET',
		params: {
			pl: bundle.inputData.pl,
			pw: bundle.inputData.pw,
			pmh: bundle.inputData.pmh,
			bl: bundle.inputData.bl,
			bw: bundle.inputData.bw,
			bh: bundle.inputData.bh,
		},
	});
	return response.data;
};

module.exports = {
	key: 'pallet',
	noun: 'Pallet Fit',
	display: {
		label: 'Calculate Pallet Fitting',
		description: 'How many boxes of a given size fit on a pallet.',
	},
	operation: {
		perform,
		inputFields: [
			{ key: 'pl', label: 'Pallet Length (cm)', type: 'number', required: true, default: '120' },
			{ key: 'pw', label: 'Pallet Width (cm)', type: 'number', required: true, default: '80' },
			{ key: 'pmh', label: 'Pallet Max Height (cm)', type: 'number', required: true, default: '220' },
			{ key: 'bl', label: 'Box Length (cm)', type: 'number', required: true, default: '40' },
			{ key: 'bw', label: 'Box Width (cm)', type: 'number', required: true, default: '30' },
			{ key: 'bh', label: 'Box Height (cm)', type: 'number', required: true, default: '25' },
		],
		sample: {
			total_boxes: 64,
			layers: 4,
			boxes_per_layer: 16,
			limiting_factor: 'height',
		},
		outputFields: [
			{ key: 'total_boxes', label: 'Total Boxes', type: 'number' },
			{ key: 'layers', label: 'Layers', type: 'number' },
			{ key: 'boxes_per_layer', label: 'Boxes Per Layer', type: 'number' },
			{ key: 'limiting_factor', label: 'Limiting Factor' },
		],
	},
};
