const perform = async (z, bundle) => {
	// Zapier line-item input arrives as parallel arrays. Re-zip into the
	// items[] array shape that POST /api/adr-calculator expects.
	const unNumbers = bundle.inputData.un_numbers || [];
	const quantities = bundle.inputData.quantities || [];

	if (unNumbers.length === 0) {
		throw new z.errors.HaltedError('Provide at least one UN number + quantity pair.');
	}
	if (unNumbers.length !== quantities.length) {
		throw new z.errors.HaltedError(
			`UN numbers (${unNumbers.length}) and quantities (${quantities.length}) must be the same length.`,
		);
	}

	const items = unNumbers.map((un, i) => ({
		un_number: String(un),
		quantity: Number(quantities[i]),
	}));

	const response = await z.request({
		url: 'https://www.freightutils.com/api/adr-calculator',
		method: 'POST',
		body: { items },
	});
	return response.data;
};

module.exports = {
	key: 'adrExemptionConsignment',
	noun: 'ADR Exemption (Consignment)',
	display: {
		label: 'Calculate ADR 1.1.3.6 Exemption (Multi-Item Consignment)',
		description:
			'Calculate aggregated transport-category points across multiple ADR substances against the 1000-point threshold.',
	},
	operation: {
		perform,
		inputFields: [
			{
				key: 'un_numbers',
				label: 'UN Numbers',
				type: 'string',
				required: true,
				list: true,
				helpText:
					'1–4 digit UN numbers, one per item. Order must match Quantities. Example: 1263, 3082',
			},
			{
				key: 'quantities',
				label: 'Quantities (kg or L)',
				type: 'number',
				required: true,
				list: true,
				helpText:
					'Total quantity per item, in kg or L. Order must match UN Numbers.',
			},
		],
		sample: {
			items: [
				{
					un_number: '1263',
					proper_shipping_name: 'PAINT',
					transport_category: '1',
					quantity: 125,
					multiplier: 50,
					points: 6250,
				},
				{
					un_number: '3082',
					proper_shipping_name: 'ENVIRONMENTALLY HAZARDOUS SUBSTANCE, LIQUID, N.O.S.',
					transport_category: '3',
					quantity: 1000,
					multiplier: 1,
					points: 1000,
				},
			],
			total_points: 7250,
			threshold: 1000,
			exempt: false,
			has_category_zero: false,
			has_quantity_exceedance: true,
			warnings: ['UN1263 (Category 1): 125 exceeds the 20 kg/L maximum for Transport Category 1'],
			message: 'Per-substance quantity limit exceeded — full ADR compliance required',
		},
		outputFields: [
			{ key: 'total_points', label: 'Total Transport-Category Points', type: 'number' },
			{ key: 'threshold', label: 'Exemption Threshold', type: 'number' },
			{ key: 'exempt', label: 'Exempt Under 1.1.3.6', type: 'boolean' },
			{ key: 'has_category_zero', label: 'Has Transport Category 0 Substance', type: 'boolean' },
			{ key: 'has_quantity_exceedance', label: 'Per-Substance Quantity Exceeded', type: 'boolean' },
			{ key: 'message', label: 'Status Message' },
			{ key: 'items[]un_number', label: 'Item UN Number' },
			{ key: 'items[]transport_category', label: 'Item Transport Category' },
			{ key: 'items[]points', label: 'Item Points', type: 'number' },
		],
	},
};
