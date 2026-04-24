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
		sample: {
			length_cm: 120,
			width_cm: 80,
			height_cm: 100,
			gross_weight_kg: 500,
			volumetric_weight_kg: 160,
			chargeable_weight_kg: 500,
			billing_basis: 'actual',
		},
		outputFields: [
			{ key: 'chargeable_weight_kg', label: 'Chargeable Weight (kg)', type: 'number' },
			{ key: 'volumetric_weight_kg', label: 'Volumetric Weight (kg)', type: 'number' },
			{ key: 'billing_basis', label: 'Billing Basis' },
		],
	},
};
