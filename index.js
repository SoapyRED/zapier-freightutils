const { version: platformVersion } = require('zapier-platform-core');

const { authentication, beforeRequest, afterResponse } = require('./authentication');

// Creates (9)
const cbm = require('./creates/cbm');
const ldm = require('./creates/ldm');
const chargeableWeight = require('./creates/chargeableWeight');
const consignment = require('./creates/consignment');
const pallet = require('./creates/pallet');
const unitConvert = require('./creates/unitConvert');
const adrLqCheck = require('./creates/adrLqCheck');
const adrExemption = require('./creates/adrExemption');
const ukDuty = require('./creates/ukDuty');

// Searches (8)
const adrLookup = require('./searches/adrLookup');
const hsLookup = require('./searches/hsLookup');
const incotermsLookup = require('./searches/incotermsLookup');
const airlineLookup = require('./searches/airlineLookup');
const unlocodeLookup = require('./searches/unlocodeLookup');
const uldLookup = require('./searches/uldLookup');
const containerLookup = require('./searches/containerLookup');
const vehicleLookup = require('./searches/vehicleLookup');

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
		[adrExemption.key]: adrExemption,
		[ukDuty.key]: ukDuty,
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
	},
	triggers: {},
};
