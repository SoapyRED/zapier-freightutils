const perform = async (z, bundle) => {
	const response = await z.request({
		url: 'https://www.freightutils.com/api/ldm',
		method: 'GET',
		params: {
			pallet: bundle.inputData.pallet,
			qty: bundle.inputData.qty,
		},
	});
	return response.data;
};

module.exports = {
	key: 'ldm',
	noun: 'LDM',
	display: {
		label: 'Calculate LDM',
		description: 'Calculate loading metres from a pallet preset and quantity.',
	},
	operation: {
		perform,
		inputFields: [
			{
				key: 'pallet',
				label: 'Pallet Type',
				type: 'string',
				required: true,
				default: 'euro',
				choices: {
					euro: 'Euro (1200×800)',
					'uk-standard': 'UK Standard (1200×1000)',
					half: 'Half Pallet (800×600)',
					quarter: 'Quarter Pallet (600×400)',
				},
			},
			{ key: 'qty', label: 'Quantity', type: 'number', required: true, default: '10' },
		],
		// Sample + outputFields mirror the real /api/ldm response (phantom-field
		// cleanup 2026-08-19): pallet_type / quantity / trailer_width_m were
		// never returned — the echoed inputs live under meta__inputs__*.
		sample: {
			ldm: 4,
			vehicle: { name: '13.6m Artic Trailer', length_m: 13.6, max_payload_kg: 24000 },
			utilisation_percent: 29.41,
			pallet_spaces: { used: 10, available: 33 },
			fits: true,
			meta: { inputs: { length_mm: 1200, width_mm: 800, qty: 10 } },
		},
		outputFields: [
			{ key: 'ldm', label: 'LDM', type: 'number' },
			{ key: 'fits', label: 'Fits On Vehicle', type: 'boolean' },
			{ key: 'utilisation_percent', label: 'Vehicle Utilisation (%)', type: 'number' },
			{ key: 'pallet_spaces__used', label: 'Pallet Spaces Used', type: 'number' },
			{ key: 'pallet_spaces__available', label: 'Pallet Spaces Available', type: 'number' },
		],
	},
};
