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

const getSubscriptionOperation = userOperationParameter.options.find(
	(operation) => operation.value === 'get_subscription',
);

assert.ok(getSubscriptionOperation, 'Get Subscription operation should exist');
assert.equal(getSubscriptionOperation.routing.request.method, 'GET');

const resourceParameter = node.description.properties.find((parameter) => parameter.name === 'resource');

assert.ok(resourceParameter, 'Resource parameter should exist');

const configResource = resourceParameter.options.find((resource) => resource.value === 'config');

assert.ok(configResource, 'Config resource should exist');

const teamCreateResource = resourceParameter.options.find(
	(resource) => resource.value === 'teamCreate',
);

assert.ok(teamCreateResource, 'Team Create resource should exist');

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

const teamCreateOperationParameter = node.description.properties.find(
	(parameter) =>
		parameter.name === 'operation' &&
		parameter.displayOptions?.show?.resource?.includes('teamCreate'),
);

assert.ok(teamCreateOperationParameter, 'Team Create operation parameter should exist');

const expectedTeamCreateOperationValues = [
	'close_team_test_session',
	'get_active_session_members',
	'get_team_create_settings',
	'update_team_create_settings',
	'remove_team_create_membership',
	'get_many_team_create_settings',
];

for (const operationValue of expectedTeamCreateOperationValues) {
	assert.ok(
		teamCreateOperationParameter.options.some((operation) => operation.value === operationValue),
		`Team Create operation ${operationValue} should exist`,
	);
}

const closeTeamTestSessionOperation = teamCreateOperationParameter.options.find(
	(operation) => operation.value === 'close_team_test_session',
);
const getActiveSessionMembersOperation = teamCreateOperationParameter.options.find(
	(operation) => operation.value === 'get_active_session_members',
);
const getTeamCreateSettingsOperation = teamCreateOperationParameter.options.find(
	(operation) => operation.value === 'get_team_create_settings',
);
const updateTeamCreateSettingsOperation = teamCreateOperationParameter.options.find(
	(operation) => operation.value === 'update_team_create_settings',
);
const removeTeamCreateMembershipOperation = teamCreateOperationParameter.options.find(
	(operation) => operation.value === 'remove_team_create_membership',
);
const getManyTeamCreateSettingsOperation = teamCreateOperationParameter.options.find(
	(operation) => operation.value === 'get_many_team_create_settings',
);

assert.equal(closeTeamTestSessionOperation.routing.request.method, 'DELETE');
assert.equal(getActiveSessionMembersOperation.routing.request.method, 'GET');
assert.equal(getTeamCreateSettingsOperation.routing.request.method, 'GET');
assert.equal(updateTeamCreateSettingsOperation.routing.request.method, 'PATCH');
assert.equal(removeTeamCreateMembershipOperation.routing.request.method, 'DELETE');
assert.equal(getManyTeamCreateSettingsOperation.routing.request.method, 'GET');

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

const getSubscriptionUrl = new Tournament().execute(
	getSubscriptionOperation.routing.request.url.slice(1),
	{
		$parameter: {
			universeId: '98765',
			subscriptionProductId: 'monthly-vip',
			subscriptionId: '35188269',
		},
	},
);

assert.equal(
	getSubscriptionUrl,
	'/cloud/v2/universes/98765/subscription-products/monthly-vip/subscriptions/35188269',
);
assert.equal(getSubscriptionOperation.routing.request.qs.view, '={{ $parameter["view"] }}');

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

const closeTeamTestSessionUrl = new Tournament().execute(
	closeTeamTestSessionOperation.routing.request.url.slice(1),
	{
		$parameter: {
			placeId: '12345',
		},
	},
);

assert.equal(closeTeamTestSessionUrl, '/legacy-develop/v2/teamtest/12345');
assert.equal(closeTeamTestSessionOperation.routing.request.qs.gameId, '={{ $parameter["gameId"] }}');

const activeSessionMembersUrl = new Tournament().execute(
	getActiveSessionMembersOperation.routing.request.url.slice(1),
	{
		$parameter: {
			placeId: '12345',
		},
	},
);

assert.equal(
	activeSessionMembersUrl,
	'/legacy-develop/v1/places/12345/teamcreate/active_session/members',
);
assert.equal(
	getActiveSessionMembersOperation.routing.request.qs.limit,
	'={{ $parameter["team_create_pagination"].limit }}',
);
assert.equal(
	getActiveSessionMembersOperation.routing.request.qs.cursor,
	'={{ $parameter["team_create_pagination"].cursor }}',
);

const getTeamCreateSettingsUrl = new Tournament().execute(
	getTeamCreateSettingsOperation.routing.request.url.slice(1),
	{
		$parameter: {
			universeId: '98765',
		},
	},
);

assert.equal(getTeamCreateSettingsUrl, '/legacy-develop/v1/universes/98765/teamcreate');

const updateTeamCreateSettingsUrl = new Tournament().execute(
	updateTeamCreateSettingsOperation.routing.request.url.slice(1),
	{
		$parameter: {
			universeId: '98765',
		},
	},
);

assert.equal(updateTeamCreateSettingsUrl, '/legacy-develop/v1/universes/98765/teamcreate');
assert.deepEqual(updateTeamCreateSettingsOperation.routing.request.body, {
	isEnabled: '={{ $parameter["isEnabled"] }}',
});

const removeTeamCreateMembershipUrl = new Tournament().execute(
	removeTeamCreateMembershipOperation.routing.request.url.slice(1),
	{
		$parameter: {
			universeId: '98765',
		},
	},
);

assert.equal(
	removeTeamCreateMembershipUrl,
	'/legacy-develop/v1/universes/98765/teamcreate/memberships',
);
assert.deepEqual(removeTeamCreateMembershipOperation.routing.request.body, {
	userId: '={{ $parameter["userId"] }}',
});

assert.equal(
	getManyTeamCreateSettingsOperation.routing.request.url,
	'=/legacy-develop/v1/universes/multiget/teamcreate',
);
assert.equal(
	getManyTeamCreateSettingsOperation.routing.request.qs.ids,
	'={{ $parameter["universeIds"].split(",").map(id => id.trim()).filter(Boolean) }}',
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

const composedGetTeamCreateSettingsRequest = {
	...node.description.requestDefaults,
	...getTeamCreateSettingsOperation.routing.request,
	headers: {
		...node.description.requestDefaults.headers,
		...getTeamCreateSettingsOperation.routing.request.headers,
		...credentials.authenticate.properties.headers,
	},
};

assert.equal(composedGetTeamCreateSettingsRequest.baseURL, 'https://apis.roblox.com');
assert.equal(
	composedGetTeamCreateSettingsRequest.headers['x-api-key'],
	'={{$credentials.apiKey}}',
);
assert.equal(composedGetTeamCreateSettingsRequest.headers.Accept, 'application/json');
