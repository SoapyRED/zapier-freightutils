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
		sample: {
			overall_status: 'qualifies',
			items: [
				{
					un_number: '1203',
					quantity: 0.5,
					unit: 'L',
					status: 'qualifies',
					lq_limit: 1,
				},
			],
		},
		outputFields: [
			{ key: 'overall_status', label: 'Overall Status' },
			{ key: 'items[]un_number', label: 'UN Number' },
			{ key: 'items[]status', label: 'Per-Item Status' },
			{ key: 'items[]lq_limit', label: 'LQ/EQ Limit', type: 'number' },
		],
	},
};
