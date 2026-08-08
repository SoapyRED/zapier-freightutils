/**
 * FreightUtils API authentication.
 *
 * Custom auth: users paste an API key generated at
 * https://www.freightutils.com/api-docs. Every outbound request has
 * `X-API-Key` injected via beforeRequest. Auth is verified by hitting
 * /api/auth/whoami — returns 200 with {authenticated, tier, key_prefix}
 * for valid keys; 401 with {error: "unauthenticated", ...} otherwise.
 */

const handleErrors = (response, z) => {
	if (response.status === 401 || response.status === 403) {
		throw new z.errors.Error(
			'Invalid API key. Check the value or generate a new one at https://www.freightutils.com/api-docs.',
			'AuthenticationError',
			response.status,
		);
	}
	if (response.status === 429) {
		throw new z.errors.Error(
			'Rate limit exceeded. Free tier: 100 req/day. Upgrade to Pro at https://www.freightutils.com/pricing.',
			'RateLimitError',
			429,
		);
	}
	return response;
};

const authentication = {
	type: 'custom',

	test: {
		url: 'https://www.freightutils.com/api/auth/whoami',
		method: 'GET',
	},

	fields: [
		{
			key: 'apiKey',
			label: 'API Key',
			required: true,
			type: 'password',
			helpText:
				'Generate a free key (100 req/day) at [https://www.freightutils.com/api-docs](https://www.freightutils.com/api-docs). Upgrade to Pro (50,000 req/month, £19) on the [Pricing page](https://www.freightutils.com/pricing).',
		},
	],

	connectionLabel: 'FreightUtils Account',
};

// Versioned User-Agent, read from package.json rather than typed here.
//
// WHY IT MOVES WITH THE VERSION: the server attributes traffic per wrapper from
// this prefix (lib/observability/surface.ts in the freighttools repo). A
// hardcoded string would keep reporting the version it was written at, so the
// day a release changed behaviour the numbers would still say the old one — and
// the whole point of the header is to tell releases apart. Read once at module
// load; require() is cached, so this is not per-request work.
const { name: PKG_NAME, version: PKG_VERSION } = require('./package.json');
const USER_AGENT = `${PKG_NAME}/${PKG_VERSION}`;

const beforeRequest = (request, z, bundle) => {
	request.headers = request.headers || {};
	if (bundle.authData && bundle.authData.apiKey) {
		request.headers['X-API-Key'] = bundle.authData.apiKey;
	}
	// Set unconditionally: this is the ONLY outbound hook in the app, so every
	// call to every action and search carries it. Zapier's platform may also
	// send its own UA at a lower layer — the server keeps those apart as
	// `zapier` vs `zapier-platform`, and a split that drifts toward the latter
	// is how we would learn this hook had stopped firing.
	request.headers['User-Agent'] = USER_AGENT;
	return request;
};

const afterResponse = (response, z, bundle) => handleErrors(response, z);

module.exports = {
	authentication,
	beforeRequest,
	afterResponse,
};
