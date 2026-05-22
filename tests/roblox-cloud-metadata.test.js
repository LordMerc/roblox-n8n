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

const resourceParameter = node.description.properties.find((parameter) => parameter.name === 'resource');

assert.ok(resourceParameter, 'Resource parameter should exist');

const configResource = resourceParameter.options.find((resource) => resource.value === 'config');

assert.ok(configResource, 'Config resource should exist');

const configOperationParameter = node.description.properties.find(
	(parameter) =>
		parameter.name === 'operation' &&
		parameter.displayOptions?.show?.resource?.includes('config'),
);

assert.ok(configOperationParameter, 'Config operation parameter should exist');

const expectedConfigOperationValues = [
	'get_config_values',
	'get_config_full',
	'get_config_draft',
	'update_config_draft',
	'reset_config_draft',
	'overwrite_config_draft',
	'publish_config_draft',
	'list_config_revisions',
	'restore_config_revision',
];

for (const operationValue of expectedConfigOperationValues) {
	assert.ok(
		configOperationParameter.options.some((operation) => operation.value === operationValue),
		`Config operation ${operationValue} should exist`,
	);
}

const getConfigValuesOperation = configOperationParameter.options.find(
	(operation) => operation.value === 'get_config_values',
);
const overwriteConfigDraftOperation = configOperationParameter.options.find(
	(operation) => operation.value === 'overwrite_config_draft',
);
const publishConfigDraftOperation = configOperationParameter.options.find(
	(operation) => operation.value === 'publish_config_draft',
);
const restoreConfigRevisionOperation = configOperationParameter.options.find(
	(operation) => operation.value === 'restore_config_revision',
);

assert.equal(getConfigValuesOperation.routing.request.method, 'GET');
assert.equal(overwriteConfigDraftOperation.routing.request.method, 'PUT');
assert.equal(publishConfigDraftOperation.routing.request.method, 'POST');
assert.equal(restoreConfigRevisionOperation.routing.request.method, 'POST');

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


const configValuesUrl = new Tournament().execute(
	getConfigValuesOperation.routing.request.url.slice(1),
	{
		$parameter: {
			universeId: '123456',
			repository: 'InExperienceConfig',
		},
	},
);

assert.equal(
	configValuesUrl,
	'/creator-configs-public-api/v1/configs/universes/123456/repositories/InExperienceConfig',
);

const overwriteConfigDraftUrl = new Tournament().execute(
	overwriteConfigDraftOperation.routing.request.url.slice(1),
	{
		$parameter: {
			universeId: '123456',
			repository: 'InExperienceConfig',
		},
	},
);

assert.equal(
	overwriteConfigDraftUrl,
	'/creator-configs-public-api/v1/configs/universes/123456/repositories/InExperienceConfig/draft:overwrite',
);

const publishConfigDraftUrl = new Tournament().execute(
	publishConfigDraftOperation.routing.request.url.slice(1),
	{
		$parameter: {
			universeId: '123456',
			repository: 'InExperienceConfig',
		},
	},
);

assert.equal(
	publishConfigDraftUrl,
	'/creator-configs-public-api/v1/configs/universes/123456/repositories/InExperienceConfig/publish',
);

const restoreConfigRevisionUrl = new Tournament().execute(
	restoreConfigRevisionOperation.routing.request.url.slice(1),
	{
		$parameter: {
			universeId: '123456',
			repository: 'InExperienceConfig',
			revisionId: '987',
		},
	},
);

assert.equal(
	restoreConfigRevisionUrl,
	'/creator-configs-public-api/v1/configs/universes/123456/repositories/InExperienceConfig/revisions/987/restore',
);
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

const composedGetConfigValuesRequest = {
	...node.description.requestDefaults,
	...getConfigValuesOperation.routing.request,
	headers: {
		...node.description.requestDefaults.headers,
		...getConfigValuesOperation.routing.request.headers,
		...credentials.authenticate.properties.headers,
	},
};

assert.equal(composedGetConfigValuesRequest.baseURL, 'https://apis.roblox.com');
assert.equal(composedGetConfigValuesRequest.headers['x-api-key'], '={{$credentials.apiKey}}');
assert.equal(composedGetConfigValuesRequest.headers.Accept, 'application/json');
