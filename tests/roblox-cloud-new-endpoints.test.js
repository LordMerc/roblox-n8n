const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { Tournament } = require('@n8n/tournament');
const nacl = require('tweetnacl');
const { blake2b } = require('blakejs');

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
const { RobloxCloud } = require(path.join(root, 'nodes/Roblox/RobloxCloud.node.ts'));
const generic = require(path.join(root, 'nodes/Roblox/GenericFunctions.ts'));

const node = new RobloxCloud();
const properties = node.description.properties;

const evaluate = (expression, $parameter) =>
	new Tournament((error) => {
		throw error;
	}).execute(expression.slice(1), { JSON, Object, Array, String, $parameter });

const operationsFor = (resource) => {
	const parameter = properties.find(
		(property) =>
			property.name === 'operation' && property.displayOptions?.show?.resource?.includes(resource),
	);
	assert.ok(parameter, `${resource} operation parameter should exist`);
	return Object.fromEntries(parameter.options.map((option) => [option.value, option]));
};

const fieldsFor = (resource, operation) =>
	properties.filter((property) => {
		const show = property.displayOptions?.show;
		return (
			property.name !== 'operation' &&
			show?.resource?.includes(resource) &&
			(!show.operation || show.operation.includes(operation))
		);
	});

const resourceOptions = properties
	.find((property) => property.name === 'resource')
	.options.map((option) => option.value);

for (const resource of [
	'analytics',
	'asset',
	'developerProduct',
	'gamePass',
	'secret',
	'serverManagement',
]) {
	assert.ok(resourceOptions.includes(resource), `${resource} should be a selectable resource`);
}

const expectRoute = (resource, operation, method, parameters, expectedUrl) => {
	const option = operationsFor(resource)[operation];
	assert.ok(option, `${resource}.${operation} should exist`);
	assert.equal(option.routing.request.method, method, `${operation} method`);
	const url = option.routing.request.url;
	const resolved = url.startsWith('=') ? evaluate(url, parameters) : url;
	assert.equal(resolved, expectedUrl, `${operation} url`);

	for (const field of fieldsFor(resource, operation).filter((f) => f.required)) {
		assert.ok(field.name, `${operation} required field should have a name`);
	}
	return option;
};

// User
expectRoute(
	'user',
	'get_thumbnail_operation',
	'GET',
	{ userId: '1', operationId: 'abc' },
	'/cloud/v2/users/1/operations/abc',
);
const inventory = expectRoute(
	'user',
	'list_inventory_items',
	'GET',
	{ userId: '1' },
	'/cloud/v2/users/1/inventory-items',
);
assert.equal(
	evaluate(inventory.routing.request.qs.filter, {
		inventory_items_query: { filter: 'gamePassIds=5' },
	}),
	'gamePassIds=5',
);

// Developer products and game passes
const universe = { universeId: '42', productId: '7', gamePassId: '8' };
expectRoute(
	'developerProduct',
	'create_developer_product',
	'POST',
	universe,
	'/developer-products/v2/universes/42/developer-products',
);
expectRoute(
	'developerProduct',
	'list_developer_products',
	'GET',
	universe,
	'/developer-products/v2/universes/42/developer-products/creator',
);
expectRoute(
	'developerProduct',
	'get_developer_product',
	'GET',
	universe,
	'/developer-products/v2/universes/42/developer-products/7/creator',
);
expectRoute(
	'developerProduct',
	'update_developer_product',
	'PATCH',
	universe,
	'/developer-products/v2/universes/42/developer-products/7',
);
expectRoute(
	'gamePass',
	'create_game_pass',
	'POST',
	universe,
	'/game-passes/v1/universes/42/game-passes',
);
expectRoute(
	'gamePass',
	'list_game_passes',
	'GET',
	universe,
	'/game-passes/v1/universes/42/game-passes/creator',
);
expectRoute(
	'gamePass',
	'get_game_pass',
	'GET',
	universe,
	'/game-passes/v1/universes/42/game-passes/8/creator',
);
expectRoute(
	'gamePass',
	'update_game_pass',
	'PATCH',
	universe,
	'/game-passes/v1/universes/42/game-passes/8',
);

// Server management
const servers = { universeId: '42', placeId: '9', placeVersionNumber: '12', jobId: 'job-1' };
expectRoute(
	'serverManagement',
	'list_game_servers',
	'GET',
	servers,
	'/server-management/v1/universes/42/places/9/versions/12/game-servers',
);
expectRoute(
	'serverManagement',
	'list_game_server_logs',
	'GET',
	servers,
	'/server-management/v1/universes/42/places/9/versions/12/game-servers/job-1/logs',
);
expectRoute(
	'serverManagement',
	'get_game_server_filter_options',
	'GET',
	servers,
	'/server-management/v1/universes/42/places/9/game-servers:filter-options',
);
expectRoute(
	'serverManagement',
	'list_restarts',
	'GET',
	servers,
	'/server-management/v1/universes/42/restarts',
);
expectRoute(
	'serverManagement',
	'forecast_restart',
	'GET',
	servers,
	'/server-management/v1/universes/42/restarts:forecast',
);
const launchRestart = expectRoute(
	'serverManagement',
	'launch_restart',
	'POST',
	servers,
	'/server-management/v1/universes/42/restarts',
);
assert.deepEqual(evaluate(launchRestart.routing.request.body, { restart_options: {} }), {});
assert.deepEqual(
	evaluate(launchRestart.routing.request.body, {
		restart_options: {
			bleedOffDurationMinutes: 10,
			placesJson: '{"9": {"excludeCurrentVersion": true}}',
			attributesJson: '{}',
		},
	}),
	{ bleedOffDurationMinutes: 10, places: { 9: { excludeCurrentVersion: true } } },
);
assert.throws(() =>
	evaluate(launchRestart.routing.request.body, { restart_options: { placesJson: '[]' } }),
);

// Analytics
const analyticsBase = {
	universeId: '42',
	operationId: 'op-1',
	analyticsMetric: 'DailyActiveUsers',
	analyticsStartTime: '2026-10-01T00:00:00',
	analyticsEndTime: '2026-11-01T00:00:00Z',
	analyticsGranularity: 'OneDay',
	analyticsDimensions: 'Platform, Country',
	analytics_options: {
		breakdown: 'Platform',
		filterJson: '[{"dimension": "Platform", "operation": "In", "values": ["Desktop"]}]',
		limit: 5,
	},
};
const queryMetrics = expectRoute(
	'analytics',
	'query_metrics',
	'POST',
	analyticsBase,
	'/analytics-query-api/v1/universes/42/metrics',
);
assert.deepEqual(evaluate(queryMetrics.routing.request.body, analyticsBase), {
	metric: 'DailyActiveUsers',
	startTime: '2026-10-01T00:00:00Z',
	endTime: '2026-11-01T00:00:00Z',
	granularity: 'OneDay',
	breakdown: ['Platform'],
	filter: [{ dimension: 'Platform', operation: 'In', values: ['Desktop'] }],
	limit: 5,
});
const dimensionValues = expectRoute(
	'analytics',
	'query_dimension_values',
	'POST',
	analyticsBase,
	'/analytics-query-api/v1/universes/42/dimension-values',
);
assert.deepEqual(
	evaluate(dimensionValues.routing.request.body, {
		...analyticsBase,
		analyticsGranularity: '',
		analyticsStartTime: '2026-10-01T00:00:00+02:00',
		analytics_options: {},
	}),
	{
		metric: 'DailyActiveUsers',
		startTime: '2026-10-01T00:00:00+02:00',
		endTime: '2026-11-01T00:00:00Z',
		dimensions: ['Platform', 'Country'],
	},
);
expectRoute(
	'analytics',
	'get_metrics_operation',
	'GET',
	analyticsBase,
	'/analytics-query-api/v1/universes/42/operations/metrics/op-1',
);
expectRoute(
	'analytics',
	'get_dimension_values_operation',
	'GET',
	analyticsBase,
	'/analytics-query-api/v1/universes/42/operations/dimension-values/op-1',
);

// Secrets
const secretParams = { universeId: '42', secretId: 'discord' };
expectRoute('secret', 'list_secrets', 'GET', secretParams, '/cloud/v2/universes/42/secrets');
expectRoute('secret', 'create_secret', 'POST', secretParams, '/cloud/v2/universes/42/secrets');
expectRoute(
	'secret',
	'update_secret',
	'PATCH',
	secretParams,
	'/cloud/v2/universes/42/secrets/discord',
);
expectRoute(
	'secret',
	'delete_secret',
	'DELETE',
	secretParams,
	'/cloud/v2/universes/42/secrets/discord',
);
expectRoute(
	'secret',
	'get_public_key',
	'GET',
	secretParams,
	'/cloud/v2/universes/42/secrets/public-key',
);

// Assets
const assetParams = { assetId: '55', assetVersionNumber: '3', operationId: 'op', userId: '1' };
expectRoute('asset', 'create_asset', 'POST', assetParams, '/assets/v1/assets');
expectRoute('asset', 'get_asset', 'GET', assetParams, '/assets/v1/assets/55');
const updateAsset = expectRoute(
	'asset',
	'update_asset',
	'PATCH',
	assetParams,
	'/assets/v1/assets/55',
);
assert.equal(
	evaluate(updateAsset.routing.request.qs.updateMask, {
		assetUpdateJson: '{"displayName": "a", "description": "b"}',
	}),
	'displayName,description',
);
assert.equal(
	evaluate(updateAsset.routing.request.qs.updateMask, { assetUpdateJson: '{}' }),
	undefined,
);
expectRoute('asset', 'list_asset_versions', 'GET', assetParams, '/assets/v1/assets/55/versions');
expectRoute('asset', 'get_asset_version', 'GET', assetParams, '/assets/v1/assets/55/versions/3');
expectRoute(
	'asset',
	'rollback_asset_version',
	'POST',
	assetParams,
	'/assets/v1/assets/55/versions:rollback',
);
expectRoute('asset', 'archive_asset', 'POST', assetParams, '/assets/v1/assets/55:archive');
expectRoute('asset', 'restore_asset', 'POST', assetParams, '/assets/v1/assets/55:restore');
expectRoute('asset', 'get_asset_operation', 'GET', assetParams, '/assets/v1/operations/op');
expectRoute('asset', 'list_asset_quotas', 'GET', assetParams, '/cloud/v2/users/1/asset-quotas');

// Place publishing
const publishPlace = expectRoute(
	'place',
	'publish_place',
	'POST',
	{ universeId: '42', placeId: '9' },
	'/universes/v1/42/places/9/versions',
);
assert.equal(
	evaluate(publishPlace.routing.request.qs.versionType, { placeVersionType: 'Saved' }),
	'Saved',
);

// preSend hooks, run against a fake n8n execution context
const fakeContext = (parameters, binary = {}, httpResponse) => ({
	getNodeParameter: (name, fallback) =>
		Object.prototype.hasOwnProperty.call(parameters, name) ? parameters[name] : fallback,
	getNode: () => ({ name: 'Roblox Cloud' }),
	helpers: {
		assertBinaryData: (name) => {
			if (!binary[name]) throw new Error(`missing binary ${name}`);
			return binary[name];
		},
		getBinaryDataBuffer: async (name) => Buffer.from(binary[name].content),
		httpRequestWithAuthentication: async (credentialName, options) => {
			assert.equal(credentialName, 'robloxCloudApi');
			return httpResponse(options);
		},
	},
});

const parseMultipart = (requestOptions) => {
	const boundary = requestOptions.headers['Content-Type'].split('boundary=')[1];
	assert.ok(boundary, 'multipart boundary should be set');
	const text = requestOptions.body.toString('utf8');
	assert.ok(text.endsWith(`--${boundary}--\r\n`), 'multipart body should be terminated');
	return text
		.split(`--${boundary}`)
		.slice(1, -1)
		.map((chunk) => {
			const [head, ...rest] = chunk.replace(/^\r\n/, '').split('\r\n\r\n');
			const body = rest.join('\r\n\r\n').replace(/\r\n$/, '');
			return {
				name: /name="([^"]+)"/.exec(head)[1],
				fileName: /filename="([^"]+)"/.exec(head)?.[1],
				contentType: /Content-Type: (.+)/.exec(head)?.[1],
				body,
			};
		});
};

(async () => {
	const baseRequest = () => ({ headers: { 'Content-Type': 'application/json' }, json: true });

	// Create Asset
	const created = await generic.assetMultipartPreSend.call(
		fakeContext(
			{
				operation: 'create_asset',
				assetType: 'Decal',
				assetDisplayName: 'Logo',
				assetDescription: 'Our logo',
				assetCreatorType: 'group',
				assetCreatorId: '99',
				assetCreateOptions: { expectedPrice: 0 },
				binaryPropertyName: 'data',
				assetContentType: '',
			},
			{ data: { fileName: 'logo.png', mimeType: 'image/png', content: 'PNGDATA' } },
		),
		baseRequest(),
	);
	assert.equal(created.headers['Content-Type'].startsWith('multipart/form-data; boundary='), true);
	const createdParts = parseMultipart(created);
	assert.deepEqual(JSON.parse(createdParts[0].body), {
		assetType: 'Decal',
		displayName: 'Logo',
		description: 'Our logo',
		creationContext: { creator: { groupId: '99' }, expectedPrice: 0 },
	});
	assert.deepEqual(
		{ ...createdParts[1], body: createdParts[1].body },
		{ name: 'fileContent', fileName: 'logo.png', contentType: 'image/png', body: 'PNGDATA' },
	);

	// Update Asset, metadata only
	const updated = await generic.assetMultipartPreSend.call(
		fakeContext({
			operation: 'update_asset',
			assetId: '55',
			assetUpdateJson: '{"displayName": "New"}',
			assetUpdateContent: false,
		}),
		baseRequest(),
	);
	const updatedParts = parseMultipart(updated);
	assert.equal(updatedParts.length, 1);
	assert.deepEqual(JSON.parse(updatedParts[0].body), { displayName: 'New', assetId: '55' });

	// Rollback
	const rollback = await generic.assetRollbackPreSend.call(
		fakeContext({ assetId: '55', assetVersionNumber: '3' }),
		baseRequest(),
	);
	assert.deepEqual(parseMultipart(rollback), [
		{
			name: 'assetVersion',
			fileName: undefined,
			contentType: undefined,
			body: 'assets/55/versions/3',
		},
	]);

	// Developer product create with image
	const product = await generic.productMultipartPreSend.call(
		fakeContext(
			{
				operation: 'create_developer_product',
				productName: '100 Coins',
				productFields: { price: 25, isForSale: true, description: '', name: 'ignored' },
				productImageBinaryProperty: 'icon',
			},
			{ icon: { fileName: 'coins.png', mimeType: 'image/png', content: 'IMG' } },
		),
		baseRequest(),
	);
	assert.deepEqual(
		parseMultipart(product).map((part) => [part.name, part.body]),
		[
			['name', '100 Coins'],
			['price', '25'],
			['isForSale', 'true'],
			['imageFile', 'IMG'],
		],
	);

	await assert.rejects(
		generic.productMultipartPreSend.call(
			fakeContext({ operation: 'update_game_pass', productFields: {} }),
			baseRequest(),
		),
		/at least one field/,
	);

	// Place file
	const rbxl = await generic.placeFilePreSend.call(
		fakeContext(
			{ binaryPropertyName: 'data' },
			{ data: { fileName: 'Game.rbxl', mimeType: '', content: 'RBXL' } },
		),
		baseRequest(),
	);
	assert.equal(rbxl.headers['Content-Type'], 'application/octet-stream');
	assert.equal(rbxl.body.toString(), 'RBXL');
	const rbxlx = await generic.placeFilePreSend.call(
		fakeContext(
			{ binaryPropertyName: 'data' },
			{ data: { fileName: 'Game.RBXLX', mimeType: '', content: '<roblox/>' } },
		),
		baseRequest(),
	);
	assert.equal(rbxlx.headers['Content-Type'], 'application/xml');

	// Secrets: plaintext content is sealed with the universe public key
	const universeKeys = nacl.box.keyPair();
	const secretRequest = await generic.secretPreSend.call(
		fakeContext(
			{
				operation: 'create_secret',
				universeId: '42',
				secretId: 'discord',
				secretContentMode: 'plaintext',
				secretContent: 'super-secret-token',
				secretDomain: '*.discord.com',
			},
			{},
			(options) => {
				assert.equal(
					options.url,
					'https://apis.roblox.com/cloud/v2/universes/42/secrets/public-key',
				);
				return {
					id: 'public-key',
					secret: Buffer.from(universeKeys.publicKey).toString('base64'),
					key_id: 'key-7',
				};
			},
		),
		baseRequest(),
	);
	assert.equal(secretRequest.body.id, 'discord');
	assert.equal(secretRequest.body.key_id, 'key-7');
	assert.equal(secretRequest.body.domain, '*.discord.com');

	const sealed = new Uint8Array(Buffer.from(secretRequest.body.secret, 'base64'));
	const ephemeralPublicKey = sealed.slice(0, 32);
	const nonceInput = new Uint8Array(64);
	nonceInput.set(ephemeralPublicKey);
	nonceInput.set(universeKeys.publicKey, 32);
	const opened = nacl.box.open(
		sealed.slice(32),
		blake2b(nonceInput, undefined, 24),
		ephemeralPublicKey,
		universeKeys.secretKey,
	);
	assert.ok(opened, 'sealed secret should open with the universe secret key');
	assert.equal(Buffer.from(opened).toString('utf8'), 'super-secret-token');

	// Secrets: pre-encrypted content is passed through unchanged
	const passthrough = await generic.secretPreSend.call(
		fakeContext({
			operation: 'update_secret',
			universeId: '42',
			secretContentMode: 'encrypted',
			secretContent: 'QUJD',
			secretKeyId: 'key-1',
			secretDomain: '',
		}),
		baseRequest(),
	);
	assert.deepEqual(passthrough.body, { secret: 'QUJD', key_id: 'key-1' });

	console.log('New Open Cloud endpoint tests passed');
})().catch((error) => {
	console.error(error);
	process.exit(1);
});
