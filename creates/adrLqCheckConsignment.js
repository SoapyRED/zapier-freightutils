// A list field arrives as an array; a single mapped value (or a field default) can arrive as a
// plain value — read it as a one-item list instead of failing on it.
const toList = (v) => (Array.isArray(v) ? v : v === undefined || v === null || v === '' ? [] : [v]);

const perform = async (z, bundle) => {
	// Zapier line-item input arrives as parallel arrays. Re-zip into the
	// items[] array shape that POST /api/adr/lq-check expects.
	const unNumbers = toList(bundle.inputData.un_numbers);
	const quantities = toList(bundle.inputData.quantities);
	const units = toList(bundle.inputData.units);

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
				// A default that produces a real answer (contract-check covers this action through it).
				default: '1203',
				helpText:
					'1–4 digit UN numbers, one per item. Order must match Quantities + Units.',
			},
			{
				key: 'quantities',
				label: 'Quantities',
				type: 'number',
				required: true,
				list: true,
				default: '0.5',
				helpText: 'Quantity per inner packaging, per item. Order must match UN Numbers + Units.',
			},
			{
				key: 'units',
				label: 'Units',
				type: 'string',
				required: true,
				list: true,
				default: 'L',
				helpText: 'Unit per item: ml, L, g or kg. Order must match UN Numbers + Quantities.',
			},
		],
		// Production's answer to the defaults (POST /api/adr/lq-check, 2026-10-07): 0.5 L of petrol
		// per inner packaging against UN 1203's LQ limit of 1 L. The earlier sample carried an
		// overall_status ("fails") and a summary key ("failing") the endpoint never returns.
		sample: {
			mode: 'lq',
			overall_status: 'qualifies',
			items: [
				{
					un_number: '1203',
					variant_index: 0,
					substance: 'MOTOR SPIRIT or GASOLINE or PETROL',
					class: '3',
					packing_group: 'II',
					lq_limit: '1 L',
					lq_limit_value: 1,
					lq_limit_unit: 'L',
					eq_code: 'E2',
					quantity_entered: 0.5,
					unit_entered: 'L',
					status: 'within_limit',
					reason: '0.5 L is within the LQ limit of 1 L per inner packaging',
				},
			],
			summary: { total_items: 1, qualifying: 1, exceeding: 0, not_permitted: 0 },
		},
		// Nested keys use Zapier's double underscore. "summary.total_items" (a dot) and
		// "summary.failing" (a key the endpoint has never returned) were offered in the mapper and
		// produced empty values (2026-10-07, contract-check's first run over this action).
		outputFields: [
			{ key: 'overall_status', label: 'Overall Status (qualifies / does_not_qualify)' },
			{ key: 'mode', label: 'Mode (LQ or EQ)' },
			{ key: 'items[]un_number', label: 'Item UN Number' },
			{ key: 'items[]packing_group', label: 'Item Packing Group' },
			{ key: 'items[]status', label: 'Per-Item Status' },
			{ key: 'items[]reason', label: 'Per-Item Reason' },
			{ key: 'summary__total_items', label: 'Total Items', type: 'number' },
			{ key: 'summary__qualifying', label: 'Qualifying Items', type: 'number' },
			{ key: 'summary__exceeding', label: 'Items Over the Limit', type: 'number' },
			{ key: 'summary__not_permitted', label: 'Items Where LQ/EQ Is Not Permitted', type: 'number' },
		],
	},
};
