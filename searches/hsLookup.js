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
		// Real reshaped row (phantom-field cleanup 2026-08-19): the perform maps
		// hscode → hs_code and passes description/level/parent/section through;
		// `chapter` and `heading` never existed on /api/hs.
		sample: {
			hs_code: '09',
			description: 'Coffee, tea, mate and spices',
			level: 2,
			parent: 'TOTAL',
			section: 'II',
		},
		outputFields: [
			{ key: 'hs_code', label: 'HS Code' },
			{ key: 'description', label: 'Description' },
			{ key: 'level', label: 'Level (2=chapter, 4=heading, 6=subheading)', type: 'integer' },
			{ key: 'parent', label: 'Parent Code' },
			{ key: 'section', label: 'Section' },
		],
	},
};
