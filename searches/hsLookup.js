const perform = async (z, bundle) => {
	const response = await z.request({
		url: 'https://www.freightutils.com/api/hs',
		method: 'GET',
		params: { q: bundle.inputData.q },
	});
	return response.data.results || [];
};

module.exports = {
	key: 'hsLookup',
	noun: 'HS Code',
	display: {
		label: 'Find HS Code',
		description: 'Search WCO HS 2022 codes by free-text product description.',
	},
	operation: {
		perform,
		inputFields: [
			{
				key: 'q',
				label: 'Search Query',
				type: 'string',
				required: true,
				default: 'coffee',
				helpText: 'Product name, material, or partial code',
			},
		],
		sample: {
			commodity_code: '0901110000',
			description: 'Coffee, not roasted, not decaffeinated',
			section: 'IV',
			chapter: '09',
			heading: '0901',
		},
		outputFields: [
			{ key: 'commodity_code', label: 'Commodity Code' },
			{ key: 'description', label: 'Description' },
			{ key: 'section', label: 'Section' },
			{ key: 'chapter', label: 'Chapter' },
			{ key: 'heading', label: 'Heading' },
		],
	},
};
