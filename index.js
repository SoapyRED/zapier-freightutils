const { version: platformVersion } = require('zapier-platform-core');

const { authentication, beforeRequest, afterResponse } = require('./authentication');

// Creates (15)
const cbm = require('./creates/cbm');
const ldm = require('./creates/ldm');
const chargeableWeight = require('./creates/chargeableWeight');
const consignment = require('./creates/consignment');
const pallet = require('./creates/pallet');
const unitConvert = require('./creates/unitConvert');
const adrLqCheck = require('./creates/adrLqCheck');
const adrLqCheckConsignment = require('./creates/adrLqCheckConsignment');
const adrExemption = require('./creates/adrExemption');
const adrExemptionConsignment = require('./creates/adrExemptionConsignment');
const ukDuty = require('./creates/ukDuty');
const shipmentSummary = require('./creates/shipmentSummary');
const emissions = require('./creates/emissions');
const validateIdentifier = require('./creates/validateIdentifier');
const ics2Check = require('./creates/ics2Check');

// Searches (11)
const adrLookup = require('./searches/adrLookup');
const hsLookup = require('./searches/hsLookup');
const incotermsLookup = require('./searches/incotermsLookup');
const airlineLookup = require('./searches/airlineLookup');
const unlocodeLookup = require('./searches/unlocodeLookup');
const uldLookup = require('./searches/uldLookup');
const containerLookup = require('./searches/containerLookup');
const vehicleLookup = require('./searches/vehicleLookup');
const airportLookup = require('./searches/airportLookup');
const nearestAirport = require('./searches/nearestAirport');
const resolveReference = require('./searches/resolveReference');

module.exports = {
	version: require('./package.json').version,
	platformVersion,
	authentication,
	beforeRequest: [beforeRequest],
	afterResponse: [afterResponse],
	creates: {
		[cbm.key]: cbm,
		[ldm.key]: ldm,
		[chargeableWeight.key]: chargeableWeight,
		[consignment.key]: consignment,
		[pallet.key]: pallet,
		[unitConvert.key]: unitConvert,
		[adrLqCheck.key]: adrLqCheck,
		[adrLqCheckConsignment.key]: adrLqCheckConsignment,
		[adrExemption.key]: adrExemption,
		[adrExemptionConsignment.key]: adrExemptionConsignment,
		[ukDuty.key]: ukDuty,
		[shipmentSummary.key]: shipmentSummary,
		[emissions.key]: emissions,
		[validateIdentifier.key]: validateIdentifier,
		[ics2Check.key]: ics2Check,
	},
	searches: {
		[adrLookup.key]: adrLookup,
		[hsLookup.key]: hsLookup,
		[incotermsLookup.key]: incotermsLookup,
		[airlineLookup.key]: airlineLookup,
		[unlocodeLookup.key]: unlocodeLookup,
		[uldLookup.key]: uldLookup,
		[containerLookup.key]: containerLookup,
		[vehicleLookup.key]: vehicleLookup,
		[airportLookup.key]: airportLookup,
		[nearestAirport.key]: nearestAirport,
		[resolveReference.key]: resolveReference,
	},
	triggers: {},
};
