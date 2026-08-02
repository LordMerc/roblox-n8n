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
const { RobloxCloud: CompiledRobloxCloud } = require(
	path.join(root, 'dist/nodes/Roblox/RobloxCloud.node.js'),
);

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
const compiledNode = new CompiledRobloxCloud();

assert.deepEqual(
	compiledNode.description,
	node.description,
	'Compiled Roblox Cloud node metadata should match the TypeScript source',
);

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

const notificationResource = resourceParameter.options.find(
	(resource) => resource.value === 'notification',
);

assert.ok(notificationResource, 'Notification resource should exist');

const notificationOperationParameter = node.description.properties.find(
	(parameter) =>
		parameter.name === 'operation' &&
		parameter.displayOptions?.show?.resource?.includes('notification'),
);

assert.ok(notificationOperationParameter, 'Notification operation parameter should exist');

const createUserNotificationOperation = notificationOperationParameter.options.find(
	(operation) => operation.value === 'create_user_notification',
);

assert.ok(createUserNotificationOperation, 'Create User Notification operation should exist');
assert.equal(createUserNotificationOperation.routing.request.method, 'POST');
assert.equal(
	createUserNotificationOperation.routing.request.url,
	'=/cloud/v2/users/{{ $parameter["userId"] }}/notifications',
);

const notificationField = (name) =>
	node.description.properties.find(
		(parameter) =>
			parameter.name === name &&
			parameter.displayOptions?.show?.resource?.includes('notification') &&
			parameter.displayOptions?.show?.operation?.includes('create_user_notification'),
	);

for (const fieldName of ['userId', 'universeId', 'notificationMessageId']) {
	const field = notificationField(fieldName);
	assert.ok(field, `Notification field ${fieldName} should exist`);
	assert.equal(field.required, true, `Notification field ${fieldName} should be required`);
}

for (const fieldName of [
	'notificationParametersJson',
	'notificationLaunchData',
	'notificationAnalyticsCategory',
]) {
	const field = notificationField(fieldName);
	assert.ok(field, `Notification field ${fieldName} should exist`);
	assert.notEqual(field.required, true, `Notification field ${fieldName} should be optional`);
}

const notificationParametersJsonField = notificationField('notificationParametersJson');

assert.equal(notificationParametersJsonField.type, 'json');
assert.equal(notificationParametersJsonField.default, '{}');

const createUserNotificationBody = createUserNotificationOperation.routing.request.body;

const executeExpression = (expression, $parameter) =>
	new Tournament((error) => {
		throw error;
	}).execute(expression.slice(1), {
		JSON,
		Object,
		Array,
		$parameter,
	});

const assertRejectsNonObjectJson = (expression, parameterName, baseParameters) => {
	for (const [inputName, value] of [
		['JSON array', '[]'],
		['array', []],
		['JSON scalar string', '"value"'],
		['scalar string', 'value'],
		['JSON scalar number', '42'],
		['scalar number', 42],
		['JSON null', 'null'],
		['null', null],
		['malformed JSON', '{'],
	]) {
		assert.throws(
			() => executeExpression(expression, { ...baseParameters, [parameterName]: value }),
			undefined,
			`${parameterName} should reject ${inputName}`,
		);
	}
};

assert.equal(typeof createUserNotificationBody, 'string');
for (const bodyField of ['MOMENT', 'messageId', 'source', 'universe', 'joinExperience', 'analyticsData']) {
	assert.ok(
		createUserNotificationBody.includes(bodyField),
		`Create User Notification body should map ${bodyField}`,
	);
}

const notificationBodyWithoutOptionalValues = executeExpression(createUserNotificationBody, {
	universeId: '123456',
	notificationMessageId: 'welcome-message',
	notificationParametersJson: '{}',
	notificationLaunchData: '',
	notificationAnalyticsCategory: '',
});

assert.deepEqual(notificationBodyWithoutOptionalValues, {
	source: {
		universe: 'universes/123456',
	},
	payload: {
		type: 'MOMENT',
		messageId: 'welcome-message',
	},
});

const notificationBodyWithOptionalValues = executeExpression(createUserNotificationBody, {
	universeId: '123456',
	notificationMessageId: 'welcome-message',
	notificationParametersJson:
		'{"playerName":{"stringValue":"Ada"},"score":{"int64Value":"42"}}',
	notificationLaunchData: 'destination=inventory',
	notificationAnalyticsCategory: 'onboarding',
});

assert.deepEqual(notificationBodyWithOptionalValues, {
	source: {
		universe: 'universes/123456',
	},
	payload: {
		type: 'MOMENT',
		messageId: 'welcome-message',
		parameters: {
			playerName: {
				stringValue: 'Ada',
			},
			score: {
				int64Value: '42',
			},
		},
		joinExperience: {
			launchData: 'destination=inventory',
		},
		analyticsData: {
			category: 'onboarding',
		},
	},
});

for (const fieldName of ['joinExperience', 'analyticsData']) {
	assert.ok(
		Object.hasOwn(notificationBodyWithOptionalValues.payload, fieldName),
		`Create User Notification should put ${fieldName} inside payload`,
	);
	assert.equal(
		Object.hasOwn(notificationBodyWithOptionalValues, fieldName),
		false,
		`Create User Notification should not put ${fieldName} at the request root`,
	);
}

assert.deepEqual(
	executeExpression(createUserNotificationBody, {
		universeId: '123456',
		notificationMessageId: 'welcome-message',
		notificationParametersJson: {
			playerName: {
				stringValue: 'Ada',
			},
		},
		notificationLaunchData: '',
		notificationAnalyticsCategory: '',
	}),
	{
		source: {
			universe: 'universes/123456',
		},
		payload: {
			type: 'MOMENT',
			messageId: 'welcome-message',
			parameters: {
				playerName: {
					stringValue: 'Ada',
				},
			},
		},
	},
);

assertRejectsNonObjectJson(createUserNotificationBody, 'notificationParametersJson', {
	universeId: '123456',
	notificationMessageId: 'welcome-message',
	notificationLaunchData: '',
	notificationAnalyticsCategory: '',
});

const universeOperationParameter = node.description.properties.find(
	(parameter) =>
		parameter.name === 'operation' && parameter.displayOptions?.show?.resource?.includes('universe'),
);

assert.ok(universeOperationParameter, 'Universe operation parameter should exist');

const expectedBansAndBlocksOperationMethods = {
	get_place_user_restriction: 'GET',
	get_user_restriction_universe: 'GET',
	get_user_restrictions_universe: 'GET',
	list_place_user_restrictions: 'GET',
	list_user_restriction_logs: 'GET',
	update_universe: 'PATCH',
	update_place_user_restriction: 'PATCH',
	update_user_restriction_universe: 'PATCH',
};

const universeOperationsByValue = Object.fromEntries(
	universeOperationParameter.options.map((operation) => [operation.value, operation]),
);

for (const [operationValue, method] of Object.entries(expectedBansAndBlocksOperationMethods)) {
	assert.ok(
		universeOperationsByValue[operationValue],
		`Universe Bans and Blocks operation ${operationValue} should exist`,
	);
	assert.equal(universeOperationsByValue[operationValue].routing.request.method, method);
}

const updateUniverseOperation = universeOperationsByValue.update_universe;

assert.equal(
	updateUniverseOperation.routing.request.url,
	'=/cloud/v2/universes/{{ $parameter["universeId"] }}',
);
assert.deepEqual(updateUniverseOperation.routing.request.qs, {
	updateMask: '={{ $parameter["universeUpdateMask"] }}',
});
const updateUniverseBody = updateUniverseOperation.routing.request.body;

assert.equal(typeof updateUniverseBody, 'string');
assert.ok(
	updateUniverseBody.includes('universeUpdateJson'),
	'Update Universe body should map universeUpdateJson',
);
assert.deepEqual(
	executeExpression(updateUniverseBody, {
		universeUpdateJson: '{"name":"Updated Universe"}',
	}),
	{ name: 'Updated Universe' },
);
assert.deepEqual(
	executeExpression(updateUniverseBody, {
		universeUpdateJson: { name: 'Updated Universe' },
	}),
	{ name: 'Updated Universe' },
);
assertRejectsNonObjectJson(updateUniverseBody, 'universeUpdateJson', {});

const universeIdParameter = node.description.properties.find(
	(parameter) => parameter.name === 'universeId' && parameter.displayOptions?.show?.resource?.includes('universe'),
);

assert.ok(universeIdParameter, 'Universe ID field should exist');
assert.ok(
	universeIdParameter.displayOptions.show.operation.includes('update_universe'),
	'Universe ID field should display for Update Universe',
);

const updateUniverseFieldsByName = {};

for (const fieldName of ['universeUpdateMask', 'universeUpdateJson']) {
	const field = node.description.properties.find(
		(parameter) =>
			parameter.name === fieldName &&
			parameter.displayOptions?.show?.resource?.includes('universe') &&
			parameter.displayOptions?.show?.operation?.includes('update_universe'),
	);

	assert.ok(field, `Update Universe field ${fieldName} should exist`);
	assert.equal(field.required, true, `Update Universe field ${fieldName} should be required`);
	updateUniverseFieldsByName[fieldName] = field;
}

assert.equal(updateUniverseFieldsByName.universeUpdateMask.type, 'string');
assert.equal(updateUniverseFieldsByName.universeUpdateJson.type, 'json');

const userRestrictionsQueryParameter = node.description.properties.find(
	(parameter) => parameter.name === 'user_restrictions_query',
);

assert.ok(userRestrictionsQueryParameter, 'User restrictions query parameter should exist');

const userRestrictionUpdateFieldsParameter = node.description.properties.find(
	(parameter) => parameter.name === 'user_restriction_game_join_restriction',
);

assert.ok(
	userRestrictionUpdateFieldsParameter,
	'User restriction game join restriction fields should exist',
);

for (const fieldName of [
	'active',
	'displayReason',
	'duration',
	'excludeAltAccounts',
	'privateReason',
	'startTime',
]) {
	assert.ok(
		userRestrictionUpdateFieldsParameter.options.some((option) => option.name === fieldName),
		`User restriction update field ${fieldName} should exist`,
	);
}

const groupOperationParameter = node.description.properties.find(
	(parameter) =>
		parameter.name === 'operation' && parameter.displayOptions?.show?.resource?.includes('group'),
);

assert.ok(groupOperationParameter, 'Group operation parameter should exist');

const expectedGroupOperationMethods = {
	accept_join_request: 'POST',
	assign_member_role: 'POST',
	decline_join_request: 'POST',
	get_audit_log: 'GET',
	get_group: 'GET',
	get_group_policies: 'POST',
	get_join_requests: 'GET',
	get_manageable_groups: 'GET',
	get_memberships: 'GET',
	get_pending_groups: 'GET',
	get_role: 'GET',
	get_roles: 'GET',
	get_settings: 'GET',
	list_forum_categories: 'GET',
	list_forum_comments: 'GET',
	list_forum_posts: 'GET',
	unassign_member_role: 'POST',
	update_description: 'PATCH',
	update_member_role: 'PATCH',
	update_notification_preference: 'PATCH',
	update_settings: 'PATCH',
};

const groupOperationsByValue = Object.fromEntries(
	groupOperationParameter.options.map((operation) => [operation.value, operation]),
);

for (const [operationValue, method] of Object.entries(expectedGroupOperationMethods)) {
	assert.ok(groupOperationsByValue[operationValue], `Group operation ${operationValue} should exist`);
	assert.equal(groupOperationsByValue[operationValue].routing.request.method, method);
}

assert.ok(!groupOperationsByValue.get_shout, 'Group shout read operation should be sunset');
assert.ok(!groupOperationsByValue.update_group_shout, 'Group shout update operation should be sunset');
assert.ok(!groupOperationsByValue.ban_user, 'Group ban operation should be removed');
assert.ok(!groupOperationsByValue.unban_user, 'Group unban operation should be removed');

const groupUserIdParameter = node.description.properties.find(
	(parameter) => parameter.name === 'userId' && parameter.displayOptions?.show?.resource?.includes('group'),
);

assert.equal(groupUserIdParameter, undefined, 'Group-only User ID field should be removed');

const groupForumPostsQueryParameter = node.description.properties.find(
	(parameter) => parameter.name === 'group_forum_posts_query',
);

assert.ok(groupForumPostsQueryParameter, 'Group forum posts query parameter should exist');

const groupForumPostsViewField = groupForumPostsQueryParameter.options.find(
	(option) => option.name === 'view',
);

assert.ok(groupForumPostsViewField, 'Group forum posts view field should exist');
assert.deepEqual(
	groupForumPostsViewField.options.map((option) => option.value),
	['VIEW_UNSPECIFIED', 'FULL', 'FULL_WITH_FIRST_COMMENT'],
);

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

const listUniverseUserRestrictionsUrl = new Tournament().execute(
	universeOperationsByValue.get_user_restrictions_universe.routing.request.url.slice(1),
	{
		$parameter: {
			universeId: '123456',
		},
	},
);

assert.equal(
	listUniverseUserRestrictionsUrl,
	'/cloud/v2/universes/123456/user-restrictions',
);
assert.deepEqual(
	universeOperationsByValue.get_user_restrictions_universe.routing.request.qs,
	{
		maxPageSize: '={{ $parameter["user_restrictions_query"].maxPageSize }}',
		pageToken: '={{ $parameter["user_restrictions_query"].pageToken }}',
	},
);

const getUniverseUserRestrictionUrl = new Tournament().execute(
	universeOperationsByValue.get_user_restriction_universe.routing.request.url.slice(1),
	{
		$parameter: {
			universeId: '123456',
			userRestrictionId: '35188269',
		},
	},
);

assert.equal(
	getUniverseUserRestrictionUrl,
	'/cloud/v2/universes/123456/user-restrictions/35188269',
);

const updateUniverseUserRestrictionUrl = new Tournament().execute(
	universeOperationsByValue.update_user_restriction_universe.routing.request.url.slice(1),
	{
		$parameter: {
			universeId: '123456',
			userRestrictionId: '35188269',
		},
	},
);

assert.equal(
	updateUniverseUserRestrictionUrl,
	'/cloud/v2/universes/123456/user-restrictions/35188269',
);
assert.deepEqual(
	universeOperationsByValue.update_user_restriction_universe.routing.request.qs,
	{
		updateMask: '={{ $parameter["userRestrictionUpdateMask"] }}',
		'idempotencyKey.key': '={{ $parameter["idempotencyKeyKey"] }}',
		'idempotencyKey.firstSent': '={{ $parameter["idempotencyKeyFirstSent"] }}',
	},
);

const updateUniverseUserRestrictionBody =
	universeOperationsByValue.update_user_restriction_universe.routing.request.body;

assert.equal(typeof updateUniverseUserRestrictionBody, 'string');
for (const bodyField of [
	'gameJoinRestriction',
	'active',
	'displayReason',
	'duration',
	'excludeAltAccounts',
	'privateReason',
	'startTime',
]) {
	assert.ok(
		updateUniverseUserRestrictionBody.includes(bodyField),
		`Update user restriction body should map ${bodyField}`,
	);
}

const listPlaceUserRestrictionsUrl = new Tournament().execute(
	universeOperationsByValue.list_place_user_restrictions.routing.request.url.slice(1),
	{
		$parameter: {
			universeId: '123456',
			placeId: '98765',
		},
	},
);

assert.equal(
	listPlaceUserRestrictionsUrl,
	'/cloud/v2/universes/123456/places/98765/user-restrictions',
);
assert.deepEqual(universeOperationsByValue.list_place_user_restrictions.routing.request.qs, {
	maxPageSize: '={{ $parameter["user_restrictions_query"].maxPageSize }}',
	pageToken: '={{ $parameter["user_restrictions_query"].pageToken }}',
});

const getPlaceUserRestrictionUrl = new Tournament().execute(
	universeOperationsByValue.get_place_user_restriction.routing.request.url.slice(1),
	{
		$parameter: {
			universeId: '123456',
			placeId: '98765',
			userRestrictionId: '35188269',
		},
	},
);

assert.equal(
	getPlaceUserRestrictionUrl,
	'/cloud/v2/universes/123456/places/98765/user-restrictions/35188269',
);

const updatePlaceUserRestrictionUrl = new Tournament().execute(
	universeOperationsByValue.update_place_user_restriction.routing.request.url.slice(1),
	{
		$parameter: {
			universeId: '123456',
			placeId: '98765',
			userRestrictionId: '35188269',
		},
	},
);

assert.equal(
	updatePlaceUserRestrictionUrl,
	'/cloud/v2/universes/123456/places/98765/user-restrictions/35188269',
);
assert.deepEqual(universeOperationsByValue.update_place_user_restriction.routing.request.qs, {
	updateMask: '={{ $parameter["userRestrictionUpdateMask"] }}',
	'idempotencyKey.key': '={{ $parameter["idempotencyKeyKey"] }}',
	'idempotencyKey.firstSent': '={{ $parameter["idempotencyKeyFirstSent"] }}',
});
assert.equal(
	universeOperationsByValue.update_place_user_restriction.routing.request.body,
	updateUniverseUserRestrictionBody,
);

const listUserRestrictionLogsUrl = new Tournament().execute(
	universeOperationsByValue.list_user_restriction_logs.routing.request.url.slice(1),
	{
		$parameter: {
			universeId: '123456',
		},
	},
);

assert.equal(
	listUserRestrictionLogsUrl,
	'/cloud/v2/universes/123456/user-restrictions:listLogs',
);
assert.deepEqual(universeOperationsByValue.list_user_restriction_logs.routing.request.qs, {
	maxPageSize: '={{ $parameter["arguments_list_user_restriction_logs"].maxPageSize }}',
	pageToken: '={{ $parameter["arguments_list_user_restriction_logs"].pageToken }}',
	filter: '={{ $parameter["arguments_list_user_restriction_logs"].filter }}',
});

const listForumCategoriesUrl = new Tournament().execute(
	groupOperationsByValue.list_forum_categories.routing.request.url.slice(1),
	{
		$parameter: {
			groupId: '12345',
		},
	},
);

assert.equal(listForumCategoriesUrl, '/cloud/v2/groups/12345/forum-categories');
assert.deepEqual(groupOperationsByValue.list_forum_categories.routing.request.qs, {
	maxPageSize: '={{ $parameter["group_forum_categories_query"].maxPageSize }}',
	pageToken: '={{ $parameter["group_forum_categories_query"].pageToken }}',
	filter: '={{ $parameter["group_forum_categories_query"].filter }}',
});

const listForumPostsUrl = new Tournament().execute(
	groupOperationsByValue.list_forum_posts.routing.request.url.slice(1),
	{
		$parameter: {
			groupId: '12345',
			forumCategoryId: 'category-1',
		},
	},
);

assert.equal(
	listForumPostsUrl,
	'/cloud/v2/groups/12345/forum-categories/category-1/posts',
);
assert.deepEqual(groupOperationsByValue.list_forum_posts.routing.request.qs, {
	maxPageSize: '={{ $parameter["group_forum_posts_query"].maxPageSize }}',
	pageToken: '={{ $parameter["group_forum_posts_query"].pageToken }}',
	filter: '={{ $parameter["group_forum_posts_query"].filter }}',
	view: '={{ $parameter["group_forum_posts_query"].view }}',
});

const listForumCommentsUrl = new Tournament().execute(
	groupOperationsByValue.list_forum_comments.routing.request.url.slice(1),
	{
		$parameter: {
			groupId: '12345',
			forumCategoryId: 'category-1',
			postId: 'post-1',
		},
	},
);

assert.equal(
	listForumCommentsUrl,
	'/cloud/v2/groups/12345/forum-categories/category-1/posts/post-1/comments',
);
assert.deepEqual(groupOperationsByValue.list_forum_comments.routing.request.qs, {
	maxPageSize: '={{ $parameter["group_forum_comments_query"].maxPageSize }}',
	pageToken: '={{ $parameter["group_forum_comments_query"].pageToken }}',
	filter: '={{ $parameter["group_forum_comments_query"].filter }}',
});

const listJoinRequestsUrl = new Tournament().execute(
	groupOperationsByValue.get_join_requests.routing.request.url.slice(1),
	{
		$parameter: {
			groupId: '12345',
		},
	},
);

assert.equal(listJoinRequestsUrl, '/cloud/v2/groups/12345/join-requests');
assert.deepEqual(groupOperationsByValue.get_join_requests.routing.request.qs, {
	maxPageSize: '={{ $parameter["group_join_requests_query"].maxPageSize }}',
	pageToken: '={{ $parameter["group_join_requests_query"].pageToken }}',
	filter: '={{ $parameter["group_join_requests_query"].filter }}',
});
assert.deepEqual(groupOperationsByValue.accept_join_request.routing.request.body, {});
assert.deepEqual(groupOperationsByValue.decline_join_request.routing.request.body, {});

const updateMemberRoleUrl = new Tournament().execute(
	groupOperationsByValue.update_member_role.routing.request.url.slice(1),
	{
		$parameter: {
			groupId: '12345',
			membershipId: 'membership-1',
		},
	},
);

assert.equal(updateMemberRoleUrl, '/cloud/v2/groups/12345/memberships/membership-1');
assert.deepEqual(groupOperationsByValue.update_member_role.routing.request.body, {
	role: '=groups/{{ $parameter["groupId"] }}/roles/{{ $parameter["roleId"] }}',
});

const assignMemberRoleUrl = new Tournament().execute(
	groupOperationsByValue.assign_member_role.routing.request.url.slice(1),
	{
		$parameter: {
			groupId: '12345',
			membershipId: 'membership-1',
		},
	},
);

assert.equal(
	assignMemberRoleUrl,
	'/cloud/v2/groups/12345/memberships/membership-1:assignRole',
);
assert.deepEqual(groupOperationsByValue.assign_member_role.routing.request.body, {
	role: '=groups/{{ $parameter["groupId"] }}/roles/{{ $parameter["roleId"] }}',
});

const unassignMemberRoleUrl = new Tournament().execute(
	groupOperationsByValue.unassign_member_role.routing.request.url.slice(1),
	{
		$parameter: {
			groupId: '12345',
			membershipId: 'membership-1',
		},
	},
);

assert.equal(
	unassignMemberRoleUrl,
	'/cloud/v2/groups/12345/memberships/membership-1:unassignRole',
);
assert.deepEqual(groupOperationsByValue.unassign_member_role.routing.request.body, {
	role: '=groups/{{ $parameter["groupId"] }}/roles/{{ $parameter["roleId"] }}',
});

assert.deepEqual(groupOperationsByValue.get_roles.routing.request.qs, {
	maxPageSize: '={{ $parameter["group_roles_query"].maxPageSize }}',
	pageToken: '={{ $parameter["group_roles_query"].pageToken }}',
});

const groupAuditLogUrl = new Tournament().execute(
	groupOperationsByValue.get_audit_log.routing.request.url.slice(1),
	{
		$parameter: {
			groupId: '12345',
		},
	},
);

assert.equal(groupAuditLogUrl, '/legacy-groups/v1/groups/12345/audit-log');
assert.deepEqual(groupOperationsByValue.get_audit_log.routing.request.qs, {
	actionType: '={{ $parameter["group_audit_log_query"].actionType }}',
	userId: '={{ $parameter["group_audit_log_query"].userId }}',
	limit: '={{ $parameter["group_audit_log_query"].limit }}',
	cursor: '={{ $parameter["group_audit_log_query"].cursor }}',
	sortOrder: '={{ $parameter["group_audit_log_query"].sortOrder }}',
});

const updateDescriptionUrl = new Tournament().execute(
	groupOperationsByValue.update_description.routing.request.url.slice(1),
	{
		$parameter: {
			groupId: '12345',
		},
	},
);

assert.equal(updateDescriptionUrl, '/legacy-groups/v1/groups/12345/description');
assert.deepEqual(groupOperationsByValue.update_description.routing.request.body, {
	description: '={{ $parameter["description"] }}',
});

const getSettingsUrl = new Tournament().execute(
	groupOperationsByValue.get_settings.routing.request.url.slice(1),
	{
		$parameter: {
			groupId: '12345',
		},
	},
);

assert.equal(getSettingsUrl, '/legacy-groups/v1/groups/12345/settings');
assert.deepEqual(groupOperationsByValue.update_settings.routing.request.body, {
	isApprovalRequired: '={{ $parameter["group_settings_update"].isApprovalRequired }}',
	areEnemiesAllowed: '={{ $parameter["group_settings_update"].areEnemiesAllowed }}',
	areGroupFundsVisible: '={{ $parameter["group_settings_update"].areGroupFundsVisible }}',
	areGroupGamesVisible: '={{ $parameter["group_settings_update"].areGroupGamesVisible }}',
	verificationLevel: '={{ $parameter["group_settings_update"].verificationLevel }}',
	accountTenureRequirement:
		'={{ $parameter["group_settings_update"].accountTenureRequirement }}',
	slowmode: '={{ $parameter["group_settings_update"].slowmode }}',
	isMemberListVisibleToPublic:
		'={{ $parameter["group_settings_update"].isMemberListVisibleToPublic }}',
});

assert.deepEqual(groupOperationsByValue.update_notification_preference.routing.request.body, {
	notificationsEnabled:
		'={{ $parameter["group_notification_preference"].notificationsEnabled }}',
	type: '={{ $parameter["group_notification_preference"].type }}',
});

assert.deepEqual(groupOperationsByValue.get_group_policies.routing.request.body, {
	groupIds:
		'={{ $parameter["groupPolicyGroupIds"].split(",").map(id => id.trim()).filter(Boolean).map(id => Number(id)) }}',
});

assert.equal(
	groupOperationsByValue.get_group_policies.routing.request.url,
	'=/legacy-groups/v1/groups/policies',
);
assert.equal(
	groupOperationsByValue.get_manageable_groups.routing.request.url,
	'=/legacy-develop/v1/user/groups/canmanage',
);
assert.equal(
	groupOperationsByValue.get_pending_groups.routing.request.url,
	'=/legacy-groups/v1/user/groups/pending',
);

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

const composedListForumPostsRequest = {
	...node.description.requestDefaults,
	...groupOperationsByValue.list_forum_posts.routing.request,
	headers: {
		...node.description.requestDefaults.headers,
		...groupOperationsByValue.list_forum_posts.routing.request.headers,
		...credentials.authenticate.properties.headers,
	},
};

assert.equal(composedListForumPostsRequest.baseURL, 'https://apis.roblox.com');
assert.equal(composedListForumPostsRequest.headers['x-api-key'], '={{$credentials.apiKey}}');
assert.equal(composedListForumPostsRequest.headers.Accept, 'application/json');

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
