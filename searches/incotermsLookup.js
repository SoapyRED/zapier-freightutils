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
		sample: {
			code: 'FOB',
			name: 'Free on Board',
			mode: 'sea',
			risk_transfer: 'When goods cross ship rail at port of shipment',
			cost_transfer: 'At port of shipment',
			insurance: 'Buyer',
		},
		outputFields: [
			{ key: 'code', label: 'Code' },
			{ key: 'name', label: 'Name' },
			{ key: 'mode', label: 'Transport Mode' },
			{ key: 'risk_transfer', label: 'Risk Transfer' },
			{ key: 'cost_transfer', label: 'Cost Transfer' },
		],
	},
};
