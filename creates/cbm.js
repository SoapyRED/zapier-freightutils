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
		// Sample + outputFields mirror the real /api/cbm response (phantom-field
		// cleanup 2026-08-19): revenue_tonnes never existed on this endpoint
		// (it lives on /api/consignment), and the echoed inputs are under
		// meta__inputs__*, not top-level.
		sample: {
			cbm_per_piece: 0.96,
			total_cbm: 0.96,
			total_volume_m3: 0.96,
			cubic_feet: 33.9021,
			litres: 960,
			cubic_inches: 58582.8,
			pieces: 1,
			meta: { inputs: { length_cm: 120, width_cm: 80, height_cm: 100, pieces: 1 } },
		},
		outputFields: [
			{ key: 'total_cbm', label: 'Total CBM', type: 'number' },
			{ key: 'cubic_feet', label: 'Cubic Feet', type: 'number' },
			{ key: 'litres', label: 'Litres', type: 'number' },
			{ key: 'cbm_per_piece', label: 'CBM Per Piece', type: 'number' },
		],
	},
};
