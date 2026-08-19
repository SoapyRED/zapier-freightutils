const perform = async (z, bundle) => {
	const response = await z.request({
		url: 'https://www.freightutils.com/api/chargeable-weight',
		method: 'GET',
		params: {
			l: bundle.inputData.l,
			w: bundle.inputData.w,
			h: bundle.inputData.h,
			gw: bundle.inputData.gw,
		},
	});
	return response.data;
};

module.exports = {
	key: 'chargeableWeight',
	noun: 'Chargeable Weight',
	display: {
		label: 'Calculate Chargeable Weight',
		description: 'Air or sea chargeable weight from dimensions + gross weight.',
	},
	operation: {
		perform,
		inputFields: [
			{ key: 'l', label: 'Length (cm)', type: 'number', required: true, default: '120' },
			{ key: 'w', label: 'Width (cm)', type: 'number', required: true, default: '80' },
			{ key: 'h', label: 'Height (cm)', type: 'number', required: true, default: '100' },
			{ key: 'gw', label: 'Gross Weight (kg)', type: 'number', required: true, default: '500' },
		],
		// Sample + outputFields mirror the real /api/chargeable-weight response
		// (phantom-field cleanup 2026-08-19): the basis field is `basis`, not
		// `billing_basis`; echoed inputs live under meta__inputs__*.
		sample: {
			chargeable_weight_kg: 500,
			basis: 'actual',
			gross_weight_kg: 500,
			volumetric_weight_kg: 160,
			cbm: 0.96,
			factor: 6000,
			meta: { inputs: { length_cm: 120, width_cm: 80, height_cm: 100, gross_weight_kg: 500 } },
		},
		outputFields: [
			{ key: 'chargeable_weight_kg', label: 'Chargeable Weight (kg)', type: 'number' },
			{ key: 'volumetric_weight_kg', label: 'Volumetric Weight (kg)', type: 'number' },
			{ key: 'basis', label: 'Billing Basis' },
		],
	},
};
