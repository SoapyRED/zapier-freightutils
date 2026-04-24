const perform = async (z, bundle) => {
	const response = await z.request({
		url: 'https://www.freightutils.com/api/duty',
		method: 'POST',
		body: {
			commodityCode: bundle.inputData.commodityCode,
			originCountry: bundle.inputData.originCountry,
			customsValue: bundle.inputData.customsValue,
		},
	});
	return response.data;
};

module.exports = {
	key: 'ukDuty',
	noun: 'UK Duty',
	display: {
		label: 'Calculate UK Import Duty',
		description: 'UK duty + VAT for a commodity code using live GOV.UK Trade Tariff data.',
	},
	operation: {
		perform,
		inputFields: [
			{
				key: 'commodityCode',
				label: 'Commodity Code',
				type: 'string',
				required: true,
				default: '0901110000',
				helpText: '10-digit HS commodity code',
			},
			{
				key: 'originCountry',
				label: 'Origin Country (ISO Alpha-2)',
				type: 'string',
				required: true,
				default: 'BR',
				helpText: 'Two-letter country code, e.g. BR, CN, US',
			},
			{
				key: 'customsValue',
				label: 'Customs Value (GBP)',
				type: 'number',
				required: true,
				default: '5000',
			},
		],
		sample: {
			commodityCode: '0901110000',
			originCountry: 'BR',
			customsValue: 5000,
			duty_rate_percent: 0,
			duty_gbp: 0,
			vat_rate_percent: 20,
			vat_gbp: 1000,
			total_gbp: 1000,
			preferential: false,
		},
		outputFields: [
			{ key: 'commodityCode', label: 'Commodity Code' },
			{ key: 'duty_rate_percent', label: 'Duty Rate (%)', type: 'number' },
			{ key: 'duty_gbp', label: 'Duty (GBP)', type: 'number' },
			{ key: 'vat_gbp', label: 'VAT (GBP)', type: 'number' },
			{ key: 'total_gbp', label: 'Total Duty + VAT (GBP)', type: 'number' },
			{ key: 'preferential', label: 'Preferential Rate', type: 'boolean' },
		],
	},
};
