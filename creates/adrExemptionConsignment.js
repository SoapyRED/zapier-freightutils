// A list field arrives as an array; a single mapped value (or a field default) can arrive as a
// plain value — read it as a one-item list instead of failing on it.
const toList = (v) => (Array.isArray(v) ? v : v === undefined || v === null || v === '' ? [] : [v]);

const perform = async (z, bundle) => {
	// Zapier line-item input arrives as parallel arrays. Re-zip into the
	// items[] array shape that POST /api/adr-calculator expects.
	const unNumbers = toList(bundle.inputData.un_numbers);
	const quantities = toList(bundle.inputData.quantities);

	if (unNumbers.length === 0) {
		throw new z.errors.HaltedError('Provide at least one UN number + quantity pair.');
	}
	if (unNumbers.length !== quantities.length) {
		throw new z.errors.HaltedError(
			`UN numbers (${unNumbers.length}) and quantities (${quantities.length}) must be the same length.`,
		);
	}

	const items = unNumbers.map((un, i) => ({
		un_number: String(un),
		quantity: Number(quantities[i]),
	}));

	const response = await z.request({
		url: 'https://www.freightutils.com/api/adr-calculator',
		method: 'POST',
		body: { items },
	});
	return response.data;
};

module.exports = {
	key: 'adrExemptionConsignment',
	noun: 'ADR Exemption (Consignment)',
	display: {
		label: 'Calculate ADR 1.1.3.6 Exemption (Multi-Item Consignment)',
		description:
			'Calculate aggregated transport-category points across multiple ADR substances against the 1000-point threshold.',
	},
	operation: {
		perform,
		inputFields: [
			{
				key: 'un_numbers',
				label: 'UN Numbers',
				type: 'string',
				required: true,
				list: true,
				// A default that produces a real answer (contract-check covers this action through it):
				// UN 1203 has one ADR Table A row. A UN with several rows (e.g. 1263) is withheld with
				// candidates until a packing group is known.
				default: '1203',
				helpText:
					'1–4 digit UN numbers, one per item. Order must match Quantities. Example: 1203, 1845',
			},
			{
				key: 'quantities',
				label: 'Quantities (kg or L)',
				type: 'number',
				required: true,
				list: true,
				default: '200',
				helpText:
					'Total quantity per item, in kg or L. Order must match UN Numbers.',
			},
		],
		// Production's answer to the defaults (POST /api/adr-calculator, 2026-10-07): 200 L of petrol,
		// transport category 2 (×3) = 600 points ≤ 1000. The earlier sample showed UN 1263 as one
		// category 1 row at 6,250 points; the endpoint withholds a bare UN 1263 (several rows).
		sample: {
			items: [
				{
					un_number: '1203',
					state: 'COUNTED',
					proper_shipping_name: 'MOTOR SPIRIT or GASOLINE or PETROL',
					class: '3',
					packing_group: 'II',
					variant_index: 0,
					transport_category: '2',
					quantity: 200,
					multiplier: 3,
					points: 600,
				},
			],
			total_points: 600,
			threshold: 1000,
			exempt: true,
			has_category_zero: false,
			has_quantity_exceedance: false,
			warnings: [],
			message: '1.1.3.6 exemption applies',
		},
		outputFields: [
			{ key: 'total_points', label: 'Total Transport-Category Points', type: 'number' },
			{ key: 'threshold', label: 'Exemption Threshold', type: 'number' },
			{ key: 'exempt', label: 'Exempt Under 1.1.3.6', type: 'boolean' },
			{ key: 'has_category_zero', label: 'Has Transport Category 0 Substance', type: 'boolean' },
			{ key: 'has_quantity_exceedance', label: 'Per-Substance Quantity Exceeded', type: 'boolean' },
			{ key: 'message', label: 'Status Message' },
			{ key: 'items[]un_number', label: 'Item UN Number' },
			{ key: 'items[]transport_category', label: 'Item Transport Category' },
			{ key: 'items[]points', label: 'Item Points', type: 'number' },
			// Scope verdicts (2026-08-19): same POST path as adrExemption — Table A
			// rows listed NOT SUBJECT TO ADR / CARRIAGE PROHIBITED never enter the
			// points math. Conditional: present only when the load carries a
			// scope-remark row — see contract-known-gaps.
			{ key: 'not_subject_to_adr', label: 'Not Subject To ADR (road)', type: 'boolean' },
			{ key: 'conditions_ref', label: 'Carriage Conditions Section (e.g. 5.5.3)', type: 'string' },
			{ key: 'carriage_prohibited', label: 'Carriage Prohibited (Table A)', type: 'boolean' },
		],
	},
};
