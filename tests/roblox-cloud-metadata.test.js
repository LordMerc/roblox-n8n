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
const { RobloxLegacy } = require(path.join(root, 'nodes/Roblox/RobloxLegacy.node.ts'));

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
const legacyNode = new RobloxLegacy();

assert.equal(
	node.description.usableAsTool,
	true,
	'Roblox Cloud should register a separate tool node',
);
assert.equal(
	legacyNode.description.usableAsTool,
	true,
	'Roblox Legacy should register a separate tool node',
);

const userOperationParameter = node.description.properties.find(
	(parameter) =>
		parameter.name === 'operation' && parameter.displayOptions?.show?.resource?.includes('user'),
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

const resourceParameter = node.description.properties.find(
	(parameter) => parameter.name === 'resource',
);

assert.ok(resourceParameter, 'Resource parameter should exist');

const configResource = resourceParameter.options.find((resource) => resource.value === 'config');

assert.ok(configResource, 'Config resource should exist');

const teamCreateResource = resourceParameter.options.find(
	(resource) => resource.value === 'teamCreate',
);

assert.ok(teamCreateResource, 'Team Create resource should exist');

const storageResource = resourceParameter.options.find((resource) => resource.value === 'storage');

assert.ok(storageResource, 'Storage resource should exist');

const luauExecutionResource = resourceParameter.options.find(
	(resource) => resource.value === 'luauExecution',
);

assert.ok(luauExecutionResource, 'Luau Execution resource should exist');

const configOperationParameter = node.description.properties.find(
	(parameter) =>
		parameter.name === 'operation' && parameter.displayOptions?.show?.resource?.includes('config'),
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

const storageOperationParameter = node.description.properties.find(
	(parameter) =>
		parameter.name === 'operation' && parameter.displayOptions?.show?.resource?.includes('storage'),
);

assert.ok(storageOperationParameter, 'Storage operation parameter should exist');

const expectedStorageOperationMethods = {
	list_data_stores: 'GET',
	delete_data_store: 'DELETE',
	undelete_data_store: 'POST',
	snapshot_data_stores: 'POST',
	list_data_store_entries: 'GET',
	create_data_store_entry: 'POST',
	get_data_store_entry: 'GET',
	update_data_store_entry: 'PATCH',
	delete_data_store_entry: 'DELETE',
	increment_data_store_entry: 'POST',
	list_data_store_entry_revisions: 'GET',
	list_scoped_data_store_entries: 'GET',
	create_scoped_data_store_entry: 'POST',
	get_scoped_data_store_entry: 'GET',
	update_scoped_data_store_entry: 'PATCH',
	delete_scoped_data_store_entry: 'DELETE',
	increment_scoped_data_store_entry: 'POST',
	list_scoped_data_store_entry_revisions: 'GET',
	create_memory_store_queue_item: 'POST',
	read_memory_store_queue_items: 'GET',
	discard_memory_store_queue_items: 'POST',
	list_memory_store_sorted_map_items: 'GET',
	create_memory_store_sorted_map_item: 'POST',
	get_memory_store_sorted_map_item: 'GET',
	update_memory_store_sorted_map_item: 'PATCH',
	delete_memory_store_sorted_map_item: 'DELETE',
	flush_memory_store: 'POST',
	get_memory_store_flush_operation: 'GET',
	list_ordered_data_store_entries: 'GET',
	create_ordered_data_store_entry: 'POST',
	get_ordered_data_store_entry: 'GET',
	update_ordered_data_store_entry: 'PATCH',
	delete_ordered_data_store_entry: 'DELETE',
	increment_ordered_data_store_entry: 'POST',
};

const storageOperationsByValue = Object.fromEntries(
	storageOperationParameter.options.map((operation) => [operation.value, operation]),
);

for (const [operationValue, method] of Object.entries(expectedStorageOperationMethods)) {
	assert.ok(
		storageOperationsByValue[operationValue],
		`Storage operation ${operationValue} should exist`,
	);
	assert.equal(storageOperationsByValue[operationValue].routing.request.method, method);
}

const luauExecutionOperationParameter = node.description.properties.find(
	(parameter) =>
		parameter.name === 'operation' &&
		parameter.displayOptions?.show?.resource?.includes('luauExecution'),
);

assert.ok(luauExecutionOperationParameter, 'Luau Execution operation parameter should exist');

const expectedLuauExecutionOperationMethods = {
	create_session_task_binary_input: 'POST',
	create_session_task: 'POST',
	create_session_task_for_version: 'POST',
	get_session_task: 'GET',
	list_session_task_logs: 'GET',
};

const luauExecutionOperationsByValue = Object.fromEntries(
	luauExecutionOperationParameter.options.map((operation) => [operation.value, operation]),
);

for (const [operationValue, method] of Object.entries(expectedLuauExecutionOperationMethods)) {
	assert.ok(
		luauExecutionOperationsByValue[operationValue],
		`Luau Execution operation ${operationValue} should exist`,
	);
	assert.equal(luauExecutionOperationsByValue[operationValue].routing.request.method, method);
}

const luauExecutionTaskViewParameter = node.description.properties.find(
	(parameter) => parameter.name === 'luauExecutionTaskView',
);

assert.ok(luauExecutionTaskViewParameter, 'Luau Execution task view parameter should exist');
assert.deepEqual(
	luauExecutionTaskViewParameter.options.map((option) => option.value),
	['VIEW_UNSPECIFIED', 'BASIC', 'FULL'],
);

const luauExecutionTaskLogsQueryParameter = node.description.properties.find(
	(parameter) => parameter.name === 'luau_execution_task_logs_query',
);

assert.ok(
	luauExecutionTaskLogsQueryParameter,
	'Luau Execution task logs query parameter should exist',
);

const luauExecutionTaskLogsViewField = luauExecutionTaskLogsQueryParameter.options.find(
	(option) => option.name === 'view',
);

assert.ok(luauExecutionTaskLogsViewField, 'Luau Execution task logs view field should exist');
assert.deepEqual(
	luauExecutionTaskLogsViewField.options.map((option) => option.value),
	['VIEW_UNSPECIFIED', 'FLAT', 'STRUCTURED'],
);

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
assert.equal(
	closeTeamTestSessionOperation.routing.request.qs.gameId,
	'={{ $parameter["gameId"] }}',
);

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

const listDataStoresUrl = new Tournament().execute(
	storageOperationsByValue.list_data_stores.routing.request.url.slice(1),
	{
		$parameter: {
			universeId: '123456',
		},
	},
);

assert.equal(listDataStoresUrl, '/cloud/v2/universes/123456/data-stores');
assert.deepEqual(storageOperationsByValue.list_data_stores.routing.request.qs, {
	maxPageSize: '={{ $parameter["data_store_list_query"].maxPageSize }}',
	pageToken: '={{ $parameter["data_store_list_query"].pageToken }}',
	filter: '={{ $parameter["data_store_list_query"].filter }}',
	showDeleted: '={{ $parameter["data_store_list_query"].showDeleted }}',
});

const createDataStoreEntryUrl = new Tournament().execute(
	storageOperationsByValue.create_data_store_entry.routing.request.url.slice(1),
	{
		$parameter: {
			universeId: '123456',
			dataStoreId: 'PlayerData',
		},
	},
);

assert.equal(createDataStoreEntryUrl, '/cloud/v2/universes/123456/data-stores/PlayerData/entries');
assert.deepEqual(storageOperationsByValue.create_data_store_entry.routing.request.qs, {
	id: '={{ $parameter["data_store_create_query"].id }}',
});
assert.equal(
	storageOperationsByValue.create_data_store_entry.routing.request.body,
	'={{ JSON.parse($parameter["dataStoreEntryJson"] || "{}") }}',
);

const updateScopedDataStoreEntryUrl = new Tournament().execute(
	storageOperationsByValue.update_scoped_data_store_entry.routing.request.url.slice(1),
	{
		$parameter: {
			universeId: '123456',
			dataStoreId: 'PlayerData',
			scopeId: 'global',
			entryId: 'coins',
		},
	},
);

assert.equal(
	updateScopedDataStoreEntryUrl,
	'/cloud/v2/universes/123456/data-stores/PlayerData/scopes/global/entries/coins',
);
assert.deepEqual(storageOperationsByValue.update_scoped_data_store_entry.routing.request.qs, {
	allowMissing: '={{ $parameter["data_store_update_query"].allowMissing }}',
});

const readQueueItemsUrl = new Tournament().execute(
	storageOperationsByValue.read_memory_store_queue_items.routing.request.url.slice(1),
	{
		$parameter: {
			universeId: '123456',
			queueId: 'matchmaking',
		},
	},
);

assert.equal(
	readQueueItemsUrl,
	'/cloud/v2/universes/123456/memory-store/queues/matchmaking/items:read',
);
assert.deepEqual(storageOperationsByValue.read_memory_store_queue_items.routing.request.qs, {
	count: '={{ $parameter["memory_store_queue_read_query"].count }}',
	allOrNothing: '={{ $parameter["memory_store_queue_read_query"].allOrNothing }}',
	invisibilityWindow: '={{ $parameter["memory_store_queue_read_query"].invisibilityWindow }}',
});

const discardQueueItemsUrl = new Tournament().execute(
	storageOperationsByValue.discard_memory_store_queue_items.routing.request.url.slice(1),
	{
		$parameter: {
			universeId: '123456',
			queueId: 'matchmaking',
		},
	},
);

assert.equal(
	discardQueueItemsUrl,
	'/cloud/v2/universes/123456/memory-store/queues/matchmaking/items:discard',
);
assert.equal(
	storageOperationsByValue.discard_memory_store_queue_items.routing.request.body,
	'={{ JSON.parse($parameter["discardMemoryStoreQueueItemsJson"] || "{}") }}',
);

const updateSortedMapItemUrl = new Tournament().execute(
	storageOperationsByValue.update_memory_store_sorted_map_item.routing.request.url.slice(1),
	{
		$parameter: {
			universeId: '123456',
			sortedMapId: 'leaderboard',
			itemId: 'player-1',
		},
	},
);

assert.equal(
	updateSortedMapItemUrl,
	'/cloud/v2/universes/123456/memory-store/sorted-maps/leaderboard/items/player-1',
);
assert.deepEqual(storageOperationsByValue.update_memory_store_sorted_map_item.routing.request.qs, {
	allowMissing: '={{ $parameter["memory_store_sorted_map_update_query"].allowMissing }}',
});
assert.equal(
	storageOperationsByValue.update_memory_store_sorted_map_item.routing.request.body,
	'={{ JSON.parse($parameter["memoryStoreSortedMapItemJson"] || "{}") }}',
);

const flushMemoryStoreUrl = new Tournament().execute(
	storageOperationsByValue.flush_memory_store.routing.request.url.slice(1),
	{
		$parameter: {
			universeId: '123456',
		},
	},
);

assert.equal(flushMemoryStoreUrl, '/cloud/v2/universes/123456/memory-store:flush');
assert.deepEqual(storageOperationsByValue.flush_memory_store.routing.request.body, {});

const getMemoryStoreFlushOperationUrl = new Tournament().execute(
	storageOperationsByValue.get_memory_store_flush_operation.routing.request.url.slice(1),
	{
		$parameter: {
			universeId: '123456',
			operationId: 'flush-1',
		},
	},
);

assert.equal(
	getMemoryStoreFlushOperationUrl,
	'/cloud/v2/universes/123456/memory-store/operations/flush-1',
);

const incrementOrderedDataStoreEntryUrl = new Tournament().execute(
	storageOperationsByValue.increment_ordered_data_store_entry.routing.request.url.slice(1),
	{
		$parameter: {
			universeId: '123456',
			orderedDataStoreId: 'Wins',
			scopeId: 'global',
			entryId: 'player-1',
		},
	},
);

assert.equal(
	incrementOrderedDataStoreEntryUrl,
	'/cloud/v2/universes/123456/ordered-data-stores/Wins/scopes/global/entries/player-1:increment',
);
assert.equal(
	storageOperationsByValue.increment_ordered_data_store_entry.routing.request.body,
	'={{ JSON.parse($parameter["incrementOrderedDataStoreEntryJson"] || "{}") }}',
);

const createSessionTaskBinaryInputUrl = new Tournament().execute(
	luauExecutionOperationsByValue.create_session_task_binary_input.routing.request.url.slice(1),
	{
		$parameter: {
			universeId: '123456',
		},
	},
);

assert.equal(
	createSessionTaskBinaryInputUrl,
	'/cloud/v2/universes/123456/luau-execution-session-task-binary-inputs',
);
assert.deepEqual(luauExecutionOperationsByValue.create_session_task_binary_input.routing.request.body, {
	size: '={{ $parameter["binaryInputSize"] }}',
});

const createSessionTaskUrl = new Tournament().execute(
	luauExecutionOperationsByValue.create_session_task.routing.request.url.slice(1),
	{
		$parameter: {
			universeId: '123456',
			placeId: '98765',
		},
	},
);

assert.equal(
	createSessionTaskUrl,
	'/cloud/v2/universes/123456/places/98765/luau-execution-session-tasks',
);

const createSessionTaskBody = luauExecutionOperationsByValue.create_session_task.routing.request.body;

assert.equal(typeof createSessionTaskBody, 'string');
assert.ok(
	createSessionTaskBody.includes('script: $parameter["script"]'),
	'Create session task body should map script',
);
assert.ok(
	createSessionTaskBody.includes('enableBinaryOutput: $parameter["enableBinaryOutput"]'),
	'Create session task body should map enableBinaryOutput',
);
assert.ok(
	createSessionTaskBody.includes('timeout: $parameter["timeout"]'),
	'Create session task body should map timeout when provided',
);
assert.ok(
	createSessionTaskBody.includes('binaryInput: $parameter["binaryInput"]'),
	'Create session task body should map binaryInput when provided',
);

const createSessionTaskForVersionUrl = new Tournament().execute(
	luauExecutionOperationsByValue.create_session_task_for_version.routing.request.url.slice(1),
	{
		$parameter: {
			universeId: '123456',
			placeId: '98765',
			versionId: '42',
		},
	},
);

assert.equal(
	createSessionTaskForVersionUrl,
	'/cloud/v2/universes/123456/places/98765/versions/42/luau-execution-session-tasks',
);

const getSessionTaskUrl = new Tournament().execute(
	luauExecutionOperationsByValue.get_session_task.routing.request.url.slice(1),
	{
		$parameter: {
			universeId: '123456',
			placeId: '98765',
			versionId: '42',
			luauExecutionSessionId: 'session-1',
			taskId: 'task-1',
		},
	},
);

assert.equal(
	getSessionTaskUrl,
	'/cloud/v2/universes/123456/places/98765/versions/42/luau-execution-sessions/session-1/tasks/task-1',
);
assert.deepEqual(luauExecutionOperationsByValue.get_session_task.routing.request.qs, {
	view: '={{ $parameter["luauExecutionTaskView"] }}',
});

const listSessionTaskLogsUrl = new Tournament().execute(
	luauExecutionOperationsByValue.list_session_task_logs.routing.request.url.slice(1),
	{
		$parameter: {
			universeId: '123456',
			placeId: '98765',
			versionId: '42',
			luauExecutionSessionId: 'session-1',
			taskId: 'task-1',
		},
	},
);

assert.equal(
	listSessionTaskLogsUrl,
	'/cloud/v2/universes/123456/places/98765/versions/42/luau-execution-sessions/session-1/tasks/task-1/logs',
);
assert.deepEqual(luauExecutionOperationsByValue.list_session_task_logs.routing.request.qs, {
	maxPageSize: '={{ $parameter["luau_execution_task_logs_query"].maxPageSize }}',
	pageToken: '={{ $parameter["luau_execution_task_logs_query"].pageToken }}',
	view: '={{ $parameter["luau_execution_task_logs_query"].view }}',
});

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
assert.equal(composedGetTeamCreateSettingsRequest.headers['x-api-key'], '={{$credentials.apiKey}}');
assert.equal(composedGetTeamCreateSettingsRequest.headers.Accept, 'application/json');

const composedListDataStoresRequest = {
	...node.description.requestDefaults,
	...storageOperationsByValue.list_data_stores.routing.request,
	headers: {
		...node.description.requestDefaults.headers,
		...storageOperationsByValue.list_data_stores.routing.request.headers,
		...credentials.authenticate.properties.headers,
	},
};

assert.equal(composedListDataStoresRequest.baseURL, 'https://apis.roblox.com');
assert.equal(composedListDataStoresRequest.headers['x-api-key'], '={{$credentials.apiKey}}');
assert.equal(composedListDataStoresRequest.headers.Accept, 'application/json');

const composedListSessionTaskLogsRequest = {
	...node.description.requestDefaults,
	...luauExecutionOperationsByValue.list_session_task_logs.routing.request,
	headers: {
		...node.description.requestDefaults.headers,
		...luauExecutionOperationsByValue.list_session_task_logs.routing.request.headers,
		...credentials.authenticate.properties.headers,
	},
};

assert.equal(composedListSessionTaskLogsRequest.baseURL, 'https://apis.roblox.com');
assert.equal(
	composedListSessionTaskLogsRequest.headers['x-api-key'],
	'={{$credentials.apiKey}}',
);
assert.equal(composedListSessionTaskLogsRequest.headers.Accept, 'application/json');
