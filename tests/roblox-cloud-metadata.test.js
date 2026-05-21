const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { Tournament } = require('@n8n/tournament');

require.extensions['.ts'] = (module, filename) => {
	const source = fs.readFileSync(filename, 'utf8');
	const { outputText } = ts.transpileModule(source, {
		compilerOptions: {
			esModuleInterop: true,
			module: ts.ModuleKind.CommonJS,
			target: ts.ScriptTarget.ES2019,
		},
		fileName: filename,
	});

	module._compile(outputText, filename);
};

const root = path.resolve(__dirname, '..');
const { RobloxCloudApi } = require(path.join(root, 'credentials/RobloxCloudApi.credentials.ts'));
const { RobloxCloud } = require(path.join(root, 'nodes/Roblox/RobloxCloud.node.ts'));

const credentials = new RobloxCloudApi();

assert.deepEqual(credentials.authenticate, {
	type: 'generic',
	properties: {
		headers: {
			'x-api-key': '={{$credentials.apiKey}}',
		},
	},
});

const node = new RobloxCloud();

const userOperationParameter = node.description.properties.find(
	(parameter) =>
		parameter.name === 'operation' &&
		parameter.displayOptions?.show?.resource?.includes('user'),
);

assert.ok(userOperationParameter, 'User operation parameter should exist');

const getUserOperation = userOperationParameter.options.find(
	(operation) => operation.value === 'get_user',
);

assert.ok(getUserOperation, 'Get User operation should exist');
assert.equal(getUserOperation.routing.request.method, 'GET');

const thumbnailOperation = userOperationParameter.options.find(
	(operation) => operation.value === 'generate_thumbnail',
);

assert.ok(thumbnailOperation, 'Generate User Thumbnail operation should exist');
assert.equal(thumbnailOperation.routing.request.method, 'GET');

const routedUrl = new Tournament().execute(getUserOperation.routing.request.url.slice(1), {
	$parameter: {
		userId: '123',
	},
});

assert.equal(routedUrl, '/cloud/v2/users/123');

const routedUrlFromInputJson = new Tournament().execute(
	getUserOperation.routing.request.url.slice(1),
	{
		$parameter: {
			userId: '',
		},
		$json: {
			userId: '35188269',
		},
	},
);

assert.equal(routedUrlFromInputJson, '/cloud/v2/users/35188269');

const routedUrlFromToolQuery = new Tournament().execute(
	getUserOperation.routing.request.url.slice(1),
	{
		$parameter: {
			userId: '',
		},
		$json: {
			query: {
				userId: '1',
			},
		},
	},
);

assert.equal(routedUrlFromToolQuery, '/cloud/v2/users/1');

const thumbnailUrlFromInputJson = new Tournament().execute(
	thumbnailOperation.routing.request.url.slice(1),
	{
		$parameter: {
			userId: '',
		},
		$json: {
			userId: '35188269',
		},
	},
);

assert.equal(thumbnailUrlFromInputJson, '/cloud/v2/users/35188269:generateThumbnail');

const thumbnailUrlFromToolQuery = new Tournament().execute(
	thumbnailOperation.routing.request.url.slice(1),
	{
		$parameter: {
			userId: '',
		},
		$json: {
			query: {
				userId: '1',
			},
		},
	},
);

assert.equal(thumbnailUrlFromToolQuery, '/cloud/v2/users/1:generateThumbnail');

const composedGetUserRequest = {
	...node.description.requestDefaults,
	...getUserOperation.routing.request,
	headers: {
		...node.description.requestDefaults.headers,
		...getUserOperation.routing.request.headers,
		...credentials.authenticate.properties.headers,
	},
};

assert.equal(composedGetUserRequest.baseURL, 'https://apis.roblox.com');
assert.equal(composedGetUserRequest.headers['x-api-key'], '={{$credentials.apiKey}}');
assert.equal(composedGetUserRequest.headers.Accept, 'application/json');
