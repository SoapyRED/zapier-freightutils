// Freight CO2e emissions per ISO 14083 / GLEC v3.2, from published open
// factors (DEFRA, EPA, ADEME). Distance-based method: mass × distance ×
// mode factor. Uses ACTUAL GROSS MASS, not chargeable/volumetric weight.
const perform = async (z, bundle) => {
	const response = await z.request({
		url: 'https://www.freightutils.com/api/emissions',
		method: 'GET',
		params: {
			mass: bundle.inputData.mass,
			mass_unit: bundle.inputData.mass_unit || 'kg',
			distance_km: bundle.inputData.distance_km,
			mode: bundle.inputData.mode,
			region: bundle.inputData.region || undefined,
			sub_mode: bundle.inputData.sub_mode || undefined,
			basis: bundle.inputData.basis || undefined,
		},
	});
	return response.data;
};

module.exports = {
	key: 'emissions',
	noun: 'Emissions Estimate',
	display: {
		label: 'Calculate Freight Emissions',
		description: 'Estimate freight CO2e emissions per ISO 14083 / GLEC v3.2 using published DEFRA, EPA and ADEME factors. Best-effort estimate, not a verified carbon report.',
	},
	operation: {
		perform,
		inputFields: [
			{ key: 'mass', label: 'Mass', type: 'number', required: true, default: '1000', helpText: 'Shipment mass in the chosen unit. Use actual gross mass, not chargeable weight.' },
			{ key: 'mass_unit', label: 'Mass Unit', type: 'string', choices: ['kg', 'tonnes'], default: 'kg', required: false },
			{ key: 'distance_km', label: 'Distance (km)', type: 'number', required: true, default: '500' },
			{ key: 'mode', label: 'Mode', type: 'string', choices: ['road', 'rail', 'air', 'sea', 'inland_waterway'], required: true, default: 'road' },
			{ key: 'region', label: 'Factor Region', type: 'string', choices: ['uk', 'us', 'fr'], required: false, default: 'uk', helpText: 'Which authority\'s factors to use — DEFRA (uk), EPA (us) or ADEME (fr). Regional factors legitimately differ.' },
			{ key: 'sub_mode', label: 'Sub-Mode', type: 'string', required: false, helpText: 'Optional vehicle/vessel refinement, e.g. a specific HGV class. Omit for the fleet-average factor.' },
			{ key: 'basis', label: 'Basis', type: 'string', choices: ['wtw', 'ttw'], required: false, helpText: 'Well-to-wheel (default) or tank-to-wheel.' },
		],
		sample: {
			available: true,
			tonne_km: 500,
			factor: { id: 'defra_hgv_avg', mode: 'road', authority: 'UK DEFRA / DESNZ — Greenhouse gas reporting: conversion factors', edition: '2026', region: 'uk', unit: 'kgCO2e/tonne-km', wtw: 0.12715, ttw: 0.10356 },
			emissions: { wtw_kgco2e: 63.575, ttw_kgco2e: 51.78, primary_kgco2e: 63.575, basis_used: 'wtw' },
			mass_basis: 'actual_gross_mass',
			empty_running: 'sector_average_included',
			methodology: 'ISO 14083:2023 / GLEC Framework v3.2',
			summary: '63.575 kgCO2e WTW for 1 t × 500 km by road (UK DEFRA / DESNZ — Greenhouse gas reporting: conversion factors 2026 fleet-average factor). Uses ACTUAL GROSS MASS, not chargeable/volumetric weight. Fleet-average empty running is already included — do not add a separate empty-return leg.',
		},
		outputFields: [
			{ key: 'available', label: 'Factor Available', type: 'boolean' },
			{ key: 'tonne_km', label: 'Tonne-Kilometres', type: 'number' },
			{ key: 'emissions__primary_kgco2e', label: 'Emissions (kgCO2e, primary basis)', type: 'number' },
			{ key: 'emissions__wtw_kgco2e', label: 'Emissions Well-to-Wheel (kgCO2e)', type: 'number' },
			{ key: 'emissions__ttw_kgco2e', label: 'Emissions Tank-to-Wheel (kgCO2e)', type: 'number' },
			{ key: 'emissions__basis_used', label: 'Basis Used', type: 'string' },
			{ key: 'factor__authority', label: 'Factor Authority', type: 'string' },
			{ key: 'factor__edition', label: 'Factor Edition', type: 'string' },
			{ key: 'factor__unit', label: 'Factor Unit', type: 'string' },
			{ key: 'mass_basis', label: 'Mass Basis', type: 'string' },
			{ key: 'methodology', label: 'Methodology', type: 'string' },
			{ key: 'summary', label: 'Summary', type: 'string' },
		],
	},
};
