const perform = async (z, bundle) => {
	const response = await z.request({
		url: 'https://www.freightutils.com/api/incoterms',
		method: 'GET',
		params: { code: bundle.inputData.code },
	});
	return response.data ? [response.data] : [];
};

module.exports = {
	key: 'incotermsLookup',
	noun: 'Incoterm',
	display: {
		label: 'Find Incoterm',
		description: 'Look up an INCOTERMS 2020 definition by 3-letter code.',
	},
	operation: {
		perform,
		inputFields: [
			{
				key: 'code',
				label: 'Incoterm Code',
				type: 'string',
				required: true,
				default: 'FOB',
				choices: {
					EXW: 'EXW — Ex Works',
					FCA: 'FCA — Free Carrier',
					CPT: 'CPT — Carriage Paid To',
					CIP: 'CIP — Carriage and Insurance Paid To',
					DAP: 'DAP — Delivered at Place',
					DPU: 'DPU — Delivered at Place Unloaded',
					DDP: 'DDP — Delivered Duty Paid',
					FAS: 'FAS — Free Alongside Ship',
					FOB: 'FOB — Free on Board',
					CFR: 'CFR — Cost and Freight',
					CIF: 'CIF — Cost, Insurance, Freight',
				},
			},
		],
		// Real /api/incoterms shape (phantom-field cleanup 2026-08-19): the
		// mode field is `category` (any_mode / sea_only), not `mode`.
		sample: {
			code: 'FOB',
			name: 'Free on Board',
			category: 'sea_only',
			summary: 'Seller delivers goods on board the vessel at port of shipment. One of the most commonly used terms.',
			risk_transfer: 'When goods are on board the vessel at the port of shipment',
			insurance: 'No obligation for either party',
		},
		outputFields: [
			{ key: 'code', label: 'Code' },
			{ key: 'name', label: 'Name' },
			{ key: 'category', label: 'Category (any_mode / sea_only)' },
			{ key: 'summary', label: 'Summary' },
			{ key: 'risk_transfer', label: 'Risk Transfer' },
			{ key: 'insurance', label: 'Insurance' },
		],
	},
};
