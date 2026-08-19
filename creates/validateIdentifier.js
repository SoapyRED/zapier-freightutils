// Validate a freight identifier's check digit — container (ISO 6346),
// Air Waybill (IATA mod-7) or IMO number. A valid check digit means the
// identifier is WELL-FORMED, not that the container/shipment/vessel exists.
const perform = async (z, bundle) => {
	const response = await z.request({
		url: 'https://www.freightutils.com/api/validate',
		method: 'GET',
		params: {
			value: bundle.inputData.value,
			type: bundle.inputData.type,
		},
	});
	return response.data;
};

module.exports = {
	key: 'validateIdentifier',
	noun: 'Validation Result',
	display: {
		label: 'Validate Freight Identifier',
		description: 'Check a container number (ISO 6346), Air Waybill (mod-7) or IMO number check digit. A failed check digit is returned with valid false — never silently dropped.',
	},
	operation: {
		perform,
		inputFields: [
			{ key: 'value', label: 'Identifier', type: 'string', required: true, default: 'CSQU3054383', helpText: 'The identifier to validate, e.g. a container number MSKU1100810, an AWB 176-12345675, or an IMO number.' },
			{ key: 'type', label: 'Type', type: 'string', choices: ['container', 'awb', 'imo'], required: true, default: 'container' },
		],
		sample: {
			found: [
				{
					type: 'container',
					raw: 'CSQU3054383',
					normalised: 'CSQU3054383',
					valid: true,
					check_digit: { expected: 3, actual: 3 },
					details: { owner_prefix: 'CSQ', equipment_category: 'U', equipment_category_label: 'Freight container', serial: '305438' },
				},
			],
			disclaimer: 'A valid check digit means the identifier is well-formed, not that the container/shipment/vessel exists.',
		},
		outputFields: [
			{ key: 'found[]type', label: 'Identifier Type', type: 'string' },
			{ key: 'found[]normalised', label: 'Normalised Value', type: 'string' },
			{ key: 'found[]valid', label: 'Check Digit Valid', type: 'boolean' },
			{ key: 'found[]check_digit__expected', label: 'Expected Check Digit', type: 'integer' },
			{ key: 'found[]check_digit__actual', label: 'Actual Check Digit', type: 'integer' },
			{ key: 'disclaimer', label: 'Disclaimer', type: 'string' },
		],
	},
};
