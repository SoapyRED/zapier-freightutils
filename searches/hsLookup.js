const perform = async (z, bundle) => {
	const response = await z.request({
		url: 'https://www.freightutils.com/api/hs',
		method: 'GET',
		params: { q: bundle.inputData.q },
	});
	const results = response.data.results || [];
	return results.map((r) => {
		const { hscode, ...rest } = r;
		return { hs_code: hscode, ...rest };
	});
};

module.exports = {
	key: 'hsLookup',
	noun: 'HS Code',
	display: {
		label: 'HS Code Lookup',
		description: 'Looks up WCO HS 2022 codes by free-text product description.',
	},
	operation: {
		perform,
		inputFields: [
			{
				key: 'q',
				label: 'HS Code or Keyword',
				type: 'string',
				required: true,
				default: 'coffee',
				helpText:
					'Enter a numeric HS code (e.g. 8517) or a keyword (e.g. telephones). Both patterns work.',
			},
		],
		sample: {
			hs_code: '0901110000',
			description: 'Coffee, not roasted, not decaffeinated',
			section: 'IV',
			chapter: '09',
			heading: '0901',
		},
		outputFields: [
			{ key: 'hs_code', label: 'HS Code' },
			{ key: 'description', label: 'Description' },
			{ key: 'section', label: 'Section' },
			{ key: 'chapter', label: 'Chapter' },
			{ key: 'heading', label: 'Heading' },
		],
	},
};
