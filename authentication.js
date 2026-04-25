/**
 * FreightUtils API authentication.
 *
 * Custom auth: users paste an API key generated at
 * https://www.freightutils.com/api-docs. Every outbound request has
 * `X-API-Key` injected via beforeRequest. Auth is verified by hitting
 * /api/health — returns 200 for valid, 401 for invalid.
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
		url: 'https://www.freightutils.com/api/health',
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

const beforeRequest = (request, z, bundle) => {
	request.headers = request.headers || {};
	if (bundle.authData && bundle.authData.apiKey) {
		request.headers['X-API-Key'] = bundle.authData.apiKey;
	}
	return request;
};

const afterResponse = (response, z, bundle) => handleErrors(response, z);

module.exports = {
	authentication,
	beforeRequest,
	afterResponse,
};
