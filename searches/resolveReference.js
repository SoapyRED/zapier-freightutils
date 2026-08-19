// Resolve any freight identifier — one opaque string in ("176", "UN1845",
// "NLRTM", "FOB", "MSKU1100810", "D/E"), typed + ranked + cited candidates
// out. Thirteen grammars all run; ambiguity is returned as multiple rows,
// never guessed. NOTE: /api/resolve is envelope-v1.1-native — this search
// returns the candidates array from inside the envelope; zero candidates is
// a valid empty result (HTTP 200), not an error.
const perform = async (z, bundle) => {
	const response = await z.request({
		url: 'https://www.freightutils.com/api/resolve',
		method: 'GET',
		params: { q: bundle.inputData.q },
	});
	return (response.data.result && response.data.result.candidates) || [];
};

module.exports = {
	key: 'resolveReference',
	noun: 'Resolved Identifier',
	display: {
		label: 'Resolve Freight Identifier',
		description: 'Hand it any freight identifier — UN number, AWB prefix, IATA/ICAO, UN/LOCODE, container number, HS code, Incoterm, tunnel code, ULD serial, ISO type — and get typed, ranked, cited candidates. Ambiguous identifiers return multiple rows.',
	},
	operation: {
		perform,
		inputFields: [
			{ key: 'q', label: 'Identifier', type: 'string', required: true, default: 'UN1845', helpText: 'One identifier, max 32 characters. Not free text — a single token like 176, UN1845, NLRTM, FOB, or MSKU1100810.' },
		],
		sample: {
			entity_type: 'dangerous_good',
			identifier_type: 'un_number',
			value_normalized: '1845',
			summary: 'UN 1845 Carbon dioxide, solid (Dry ice) — Class 9 — not subject to ADR (road)',
			verification_status: 'verified',
			verification_basis: 'record',
			rank_basis: 'dataset record hit · verification verified (record-level) · static prior adr #2 of 10 · tiebreak un_number/1845',
			canonical_url: '/adr/un/1845',
			api_url: '/api/adr?un=1845',
			citation: { text: 'UN 1845 Carbon dioxide, solid (Dry ice) — Class 9 — not subject to ADR (road), section 5.5.3 conditions apply, UNECE ADR 2025.' },
		},
		outputFields: [
			{ key: 'entity_type', label: 'Entity Type', type: 'string' },
			{ key: 'identifier_type', label: 'Identifier Type (which grammar matched)', type: 'string' },
			{ key: 'value_normalized', label: 'Normalized Value', type: 'string' },
			{ key: 'summary', label: 'Summary', type: 'string' },
			{ key: 'verification_status', label: 'Verification Status', type: 'string' },
			{ key: 'verification_basis', label: 'Verification Basis (record or dataset)', type: 'string' },
			{ key: 'rank_basis', label: 'Rank Basis (why it is ordered here)', type: 'string' },
			{ key: 'canonical_url', label: 'Canonical Page URL', type: 'string' },
			{ key: 'api_url', label: 'API URL', type: 'string' },
			{ key: 'citation__text', label: 'Citation', type: 'string' },
		],
	},
};
