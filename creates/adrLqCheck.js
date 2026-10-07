const perform = async (z, bundle) => {
	const response = await z.request({
		url: 'https://www.freightutils.com/api/adr/lq-check',
		method: 'POST',
		body: {
			mode: bundle.inputData.mode,
			items: [
				{
					un_number: bundle.inputData.un_number,
					quantity: bundle.inputData.quantity,
					unit: bundle.inputData.unit,
				},
			],
		},
	});
	return response.data;
};

module.exports = {
	key: 'adrLqCheck',
	noun: 'ADR LQ/EQ Check',
	display: {
		label: 'Check ADR LQ/EQ Eligibility',
		description: 'Limited Quantity / Excepted Quantity eligibility for a single ADR substance.',
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
			{ key: 'un_number', label: 'UN Number', type: 'string', required: true, default: '1203' },
			{ key: 'quantity', label: 'Quantity', type: 'number', required: true, default: '0.5' },
			{
				key: 'unit',
				label: 'Unit',
				type: 'string',
				required: true,
				default: 'L',
				choices: { L: 'Litres', kg: 'Kilograms' },
			},
		],
		// Production's answer to the defaults (POST /api/adr/lq-check, 2026-10-07). The earlier sample
		// carried quantity / unit (the response says quantity_entered / unit_entered), a status the
		// endpoint never returns ("qualifies" is the overall status; an item is "within_limit") and a
		// numeric lq_limit (it is text, "1 L"; the number is lq_limit_value).
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
		outputFields: [
			{ key: 'overall_status', label: 'Overall Status (qualifies / does_not_qualify)' },
			{ key: 'items[]un_number', label: 'UN Number' },
			{ key: 'items[]status', label: 'Per-Item Status' },
			{ key: 'items[]lq_limit', label: 'LQ/EQ Limit (text, e.g. 1 L)' },
			{ key: 'items[]lq_limit_value', label: 'LQ/EQ Limit (number)', type: 'number' },
		],
	},
};
