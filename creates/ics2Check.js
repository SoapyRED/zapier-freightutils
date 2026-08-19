// Flag EU ICS2 unacceptable goods-description terms (stop-words) before an
// ENS filing. Reference check only — a clean result does NOT guarantee
// acceptance; the list is non-exhaustive and updated periodically.
const perform = async (z, bundle) => {
	const response = await z.request({
		url: 'https://www.freightutils.com/api/ics2-check',
		method: 'GET',
		params: {
			description: bundle.inputData.description,
		},
	});
	return response.data;
};

module.exports = {
	key: 'ics2Check',
	noun: 'ICS2 Check',
	display: {
		label: 'Check ICS2 Goods Description',
		description: 'Flag EU ICS2 stop-words in a goods description before filing an ENS. A flagged term will likely cause a rejection; clean does not guarantee acceptance.',
	},
	operation: {
		perform,
		inputFields: [
			{ key: 'description', label: 'Goods Description', type: 'string', required: true, default: 'used auto parts', helpText: 'The goods description exactly as it would appear on the entry summary declaration.' },
		],
		sample: {
			description: 'used auto parts',
			flagged: [
				{ term: 'Auto Parts', note: 'Listed stop-word found within the description. On its own this term is unacceptable; make sure the description is specific enough to identify the goods — replace generic terms with the actual product.' },
			],
			clean: false,
			caveat: 'The EU ICS2 stop-words list is non-exhaustive and updated periodically.',
		},
		outputFields: [
			{ key: 'clean', label: 'No Stop-Words Found', type: 'boolean' },
			{ key: 'flagged[]term', label: 'Flagged Term', type: 'string' },
			{ key: 'flagged[]note', label: 'Why Flagged', type: 'string' },
			{ key: 'caveat', label: 'Caveat', type: 'string' },
		],
	},
};
