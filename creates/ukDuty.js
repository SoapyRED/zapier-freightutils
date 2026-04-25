const perform = async (z, bundle) => {
	const response = await z.request({
		url: 'https://www.freightutils.com/api/duty',
		method: 'POST',
		body: {
			commodity_code: bundle.inputData.commodity_code,
			origin_country: bundle.inputData.origin_country,
			customs_value: bundle.inputData.customs_value,
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
				key: 'commodity_code',
				label: 'Commodity Code',
				type: 'string',
				required: true,
				default: '0901110000',
				helpText: '10-digit HS commodity code',
			},
			{
				key: 'origin_country',
				label: 'Origin Country (ISO Alpha-2)',
				type: 'string',
				required: true,
				default: 'BR',
				helpText: 'Two-letter country code, e.g. BR, CN, US',
			},
			{
				key: 'customs_value',
				label: 'Customs Value (GBP)',
				type: 'number',
				required: true,
				default: '5000',
			},
		],
		sample: {
			commodity_code: '0901110000',
			commodity_description: 'Not decaffeinated',
			origin_country: 'BR',
			origin_country_name: 'Brazil',
			cif_value: 5000,
			duty_rate: '0.0%',
			duty_rate_percent: 0,
			duty_amount: 0,
			vat_rate: '0.0%',
			vat_rate_percent: 0,
			vat_amount: 0,
			total_import_taxes: 0,
			total_landed_cost: 5000,
			source: 'GOV.UK Trade Tariff API',
		},
		outputFields: [
			{ key: 'commodity_code', label: 'Commodity Code' },
			{ key: 'commodity_description', label: 'Commodity Description' },
			{ key: 'origin_country', label: 'Origin Country' },
			{ key: 'origin_country_name', label: 'Origin Country Name' },
			{ key: 'cif_value', label: 'CIF Value (GBP)', type: 'number' },
			{ key: 'duty_rate', label: 'Duty Rate' },
			{ key: 'duty_rate_percent', label: 'Duty Rate (%)', type: 'number' },
			{ key: 'duty_amount', label: 'Duty (GBP)', type: 'number' },
			{ key: 'vat_rate', label: 'VAT Rate' },
			{ key: 'vat_rate_percent', label: 'VAT Rate (%)', type: 'number' },
			{ key: 'vat_amount', label: 'VAT (GBP)', type: 'number' },
			{ key: 'total_import_taxes', label: 'Total Import Taxes (GBP)', type: 'number' },
			{ key: 'total_landed_cost', label: 'Total Landed Cost (GBP)', type: 'number' },
		],
	},
};
