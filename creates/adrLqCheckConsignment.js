const perform = async (z, bundle) => {
	// Zapier line-item input arrives as parallel arrays. Re-zip into the
	// items[] array shape that POST /api/adr/lq-check expects.
	const unNumbers = bundle.inputData.un_numbers || [];
	const quantities = bundle.inputData.quantities || [];
	const units = bundle.inputData.units || [];

	if (unNumbers.length === 0) {
		throw new z.errors.HaltedError('Provide at least one item.');
	}
	if (unNumbers.length !== quantities.length || unNumbers.length !== units.length) {
		throw new z.errors.HaltedError(
			`UN numbers (${unNumbers.length}), quantities (${quantities.length}), and units (${units.length}) must be the same length.`,
		);
	}

	const items = unNumbers.map((un, i) => ({
		un_number: String(un),
		quantity: Number(quantities[i]),
		unit: String(units[i]),
	}));

	const response = await z.request({
		url: 'https://www.freightutils.com/api/adr/lq-check',
		method: 'POST',
		body: { mode: bundle.inputData.mode, items },
	});
	return response.data;
};

module.exports = {
	key: 'adrLqCheckConsignment',
	noun: 'ADR LQ/EQ Check (Consignment)',
	display: {
		label: 'Check ADR LQ/EQ Eligibility (Multi-Item Consignment)',
		description:
			'Limited Quantity / Excepted Quantity eligibility for a multi-item ADR consignment in one call.',
	},
	operation: {
		perform,
		inputFields: [
			{
				key: 'mode',
				label: 'Mode',
				type: 'string',
				required: true,
				default: 'lq',
				choices: { lq: 'Limited Quantity (LQ)', eq: 'Excepted Quantity (EQ)' },
			},
			{
				key: 'un_numbers',
				label: 'UN Numbers',
				type: 'string',
				required: true,
				list: true,
				helpText:
					'1–4 digit UN numbers, one per item. Order must match Quantities + Units.',
			},
			{
				key: 'quantities',
				label: 'Quantities',
				type: 'number',
				required: true,
				list: true,
				helpText: 'Quantity per item. Order must match UN Numbers + Units.',
			},
			{
				key: 'units',
				label: 'Units',
				type: 'string',
				required: true,
				list: true,
				helpText: 'Unit per item: L or kg. Order must match UN Numbers + Quantities.',
			},
		],
		sample: {
			mode: 'lq',
			overall_status: 'fails',
			items: [
				{
					un_number: '1263',
					substance: 'PAINT',
					packing_group: 'I',
					lq_limit: '500 ml',
					quantity_entered: 125,
					unit_entered: 'L',
					status: 'exceeds_limit',
					reason: '125 L exceeds the LQ limit of 500 ml per inner packaging',
				},
			],
			summary: { total_items: 1, qualifying: 0, failing: 1 },
		},
		outputFields: [
			{ key: 'overall_status', label: 'Overall Status' },
			{ key: 'mode', label: 'Mode (LQ or EQ)' },
			{ key: 'items[]un_number', label: 'Item UN Number' },
			{ key: 'items[]packing_group', label: 'Item Packing Group' },
			{ key: 'items[]status', label: 'Per-Item Status' },
			{ key: 'items[]reason', label: 'Per-Item Reason' },
			{ key: 'summary.total_items', label: 'Total Items', type: 'number' },
			{ key: 'summary.qualifying', label: 'Qualifying Items', type: 'number' },
			{ key: 'summary.failing', label: 'Failing Items', type: 'number' },
		],
	},
};
