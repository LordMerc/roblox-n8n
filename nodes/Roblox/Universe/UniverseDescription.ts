import type { INodeProperties } from 'n8n-workflow';

export const universeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['universe'],
			},
		},
		options: [
			{
				name: 'Generate Speech Asset',
				value: 'generate_speech_asset',
				description: 'Generate a speech asset for a universe',
				action: 'Generate speech asset',
				routing: {
					request: {
						method: 'POST',
						url: '=/cloud/v2/universes/{{ $parameter["universeId"] }}:generateSpeechAsset',
						headers: {
							'x-api-key': '={{ $credentials.apiKey }}',
						},
						body: {
							text: '={{ $parameter["speechText"] }}',
							speechStyle: `={{ Object.fromEntries(
								Object.entries($parameter["speechStyleFields"].fields || {})
									.filter(([_, v]) => v !== "" && v !== null && v !== undefined)
							) }}`,
						},
					},
				},
			},
			{
				name: 'Get Universe',
				value: 'get_universe',
				description: 'Get details of a universe',
				action: 'Get universe',
				routing: {
					request: {
						method: 'GET',
						url: '=/cloud/v2/universes/{{ $parameter["universeId"] }}',
						headers: {
							'x-api-key': '={{ $credentials.apiKey }}',
						},
					},
				},
			},
			{
				name: 'Get User Restriction Universe',
				value: 'get_user_restriction_universe',
				description: 'Get a user restriction for a universe',
				action: 'Get universe user restriction',
				routing: {
					request: {
						method: 'GET',
						url: '=/cloud/v2/universes/{{ $parameter["universeId"] }}/user-restrictions/{{ $parameter["userId"] }}',
						headers: {
							'x-api-key': '={{ $credentials.apiKey }}',
						},
					},
				},
			},
			{
				name: 'Get User Restrictions Universe',
				value: 'get_user_restrictions_universe',
				description: 'Get many user restrictions for a universe',
				action: 'Get many universe user restrictions',
				routing: {
					request: {
						method: 'GET',
						url: '=/cloud/v2/universes/{{ $parameter["universeId"] }}/user-restrictions',
						headers: {
							'x-api-key': '={{ $credentials.apiKey }}',
						},
					},
				},
			},
			{
				name: 'List User Restriction Logs',
				value: 'list_user_restriction_logs',
				description: 'Publish a message to a universe live servers',
				action: 'List user restriction logs',
				routing: {
					request: {
						method: 'GET',
						url: '=/cloud/v2/universes/{{ $parameter["universeId"] }}/user-restrictions:listLogs',
						qs: {
							maxPageSize: '={{ $parameter["maxPageSize"] || 100 }}',
							pageToken: '={{ $parameter["pageToken"] || "" }}',
						},
						headers: {
							'x-api-key': '={{ $credentials.apiKey }}',
						},
					},
				},
			},
			{
				name: 'Publish Universe Message',
				value: 'publish_universe_message',
				description: 'Publish a message to a universe live servers',
				action: 'Publish universe message',
				routing: {
					request: {
						method: 'POST',
						url: '=/cloud/v2/universes/{{ $parameter["universeId"] }}:publishMessage',
						body: {
							topic: '={{ $parameter["topic"] }}',
							message: '={{ $parameter["message"] }}',
						},
						headers: {
							'x-api-key': '={{ $credentials.apiKey }}',
						},
					},
				},
			},
			{
				name: 'Restart Universe Servers',
				value: 'restart_universe_servers',
				description: 'Restart the servers of a universe',
				action: 'Restart universe servers',
				routing: {
					request: {
						method: 'POST',
						url: '=/cloud/v2/universes/{{ $parameter["universeId"] }}:restartServers',
						body: {},
						headers: {
							'x-api-key': '={{ $credentials.apiKey }}',
						},
					},
				},
			},
			{
				name: 'Update User Restriction Universe',
				value: 'update_user_restriction_universe',
				description: 'Update a user restriction for a universe',
				action: 'Update universe user restriction',
				routing: {
					request: {
						method: 'PATCH',
						//url: 'https://postman-echo.com/patch', // Placeholder URL, replace with actual endpoint
						url: '=/cloud/v2/universes/{{ $parameter["universeId"] }}/user-restrictions/{{ $parameter["userId"] }}',
						qs: {
							updateMask: `={{
								($parameter["restriction_update_mask"]?.fields || [])
									.flatMap(item => Object.keys(item))
									.filter(k => $parameter["restriction_update_mask"].fields[0][k] !== undefined)
									.map(k => \`game_join_restriction.\${k}\`)
									.join(',')
							}}`,

							'idempotencyKey.key': '={{ Math.random().toString(36).slice(2, 10) }}',
							'idempotencyKey.firstSent': '={{ new Date().toISOString() }}',
						},
						body: {
							gameJoinRestriction: `={{ Object.fromEntries(
								Object.entries($parameter["restriction_update_mask"].fields || {})
									.filter(([_, v]) => v !== "" && v !== null && v !== undefined)
							) }}`,
						},

						headers: {
							'x-api-key': '={{ $credentials.apiKey }}',
							'Content-Type': 'application/json',
						},
					},
				},
			},
		],
		default: 'get_universe',
	},
];

export const universeFields: INodeProperties[] = [
	{
		displayName: 'Universe ID',
		name: 'universeId',
		type: 'string',
		default: '',
		required: true,
		description: 'The Universe ID of the place',
		displayOptions: {
			show: {
				resource: ['universe'],
				operation: [
					'get_universe',
					'publish_universe_message',
					'restart_universe_servers',
					'update_user_restriction_universe',
					'get_user_restrictions_universe',
					'get_user_restriction_universe',
					'list_user_restriction_logs',
					'generate_speech_asset',
				],
			},
		},
	},
	{
		displayName: 'Topic',
		name: 'topic',
		type: 'string',
		default: '',
		required: true,
		description: 'The topic to publish the message to',
		displayOptions: {
			show: {
				resource: ['universe'],
				operation: ['publish_universe_message'],
			},
		},
	},
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		default: '',
		required: true,
		description: 'The message to publish to the universe',
		displayOptions: {
			show: {
				resource: ['universe'],
				operation: ['publish_universe_message'],
			},
		},
	},
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		default: '',
		required: true,
		description: 'The User ID to retrieve or update restriction',
		displayOptions: {
			show: {
				resource: ['universe'],
				operation: ['get_user_restriction_universe', 'update_user_restriction_universe'],
			},
		},
	},
	{
		displayName: 'Query Parameters',
		name: 'arguments_list_user_restriction_logs',
		default: {},
		type: 'collection',
		description: "The request's query parameters",
		displayOptions: {
			show: {
				resource: ['universe'],
				operation: ['list_user_restriction_logs'],
			},
		},
		options: [
			{
				displayName: 'Page Token',
				name: 'pageToken',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'Token for pagination',
			},
			{
				displayName: 'Max Page Size',
				name: 'maxPageSize',
				type: 'number',
				default: 1,
				description: 'Maximum number of results per page',
			},
		],
	},
	{
		displayName: 'Speech Text',
		name: 'speechText',
		type: 'string',
		default: '',
		required: true,
		description: 'The text to generate the speech asset from',
		displayOptions: {
			show: {
				resource: ['universe'],
				operation: ['generate_speech_asset'],
			},
		},
	},
	{
		displayName: 'Speech Asset Styles',
		name: 'speechStyleFields',
		default: {},
		type: 'fixedCollection',
		displayOptions: {
			show: {
				resource: ['universe'],
				operation: ['generate_speech_asset'],
			},
		},
		required: true,
		options: [
			{
				name: 'fields',
				displayName: 'Speech Asset Style Fields',
				values: [
					{
						displayName: 'Pitch',
						name: 'pitch',
						type: 'number',
						default: 1,
						required: true,
						description: 'The pitch of the speech asset',
					},
					{
						displayName: 'Speed',
						name: 'speed',
						type: 'number',
						default: 1,
						required: true,
						description: 'The speed of the speech asset',
					},
					{
						displayName: 'Voice ID',
						name: 'voiceId',
						type: 'string',
						default: '',
						required: true,
						description: 'Whether the user restriction is active',
					},
				],
			},
		],
	},
	{
		displayName: 'Update Fields',
		name: 'restriction_update_mask',
		default: {},
		type: 'fixedCollection',
		displayOptions: {
			show: {
				resource: ['universe'],
				operation: ['update_user_restriction_universe'],
			},
		},
		required: true,
		options: [
			{
				name: 'fields',
				displayName: 'Game Join Restriction Fields',
				values: [
					{
						displayName: 'Active',
						name: 'active',
						type: 'boolean',
						default: true,
						required: true,
						description: 'Whether the user restriction is active',
					},
					{
						displayName: 'Display Reason',
						name: 'displayReason',
						type: 'string',
						default: '',
						required: true,
						description: 'The public reason for the user restriction',
					},
					{
						displayName: 'Duration',
						name: 'duration',
						type: 'string',
						placeholder: '3s',
						default: '',
						required: true,
						description: 'The duration of the user restriction (e.g., "3s", "1h", "2d")',
					},
					{
						displayName: 'Exclude Alt Accounts',
						name: 'excludeAltAccounts',
						type: 'boolean',
						default: true,
						required: true,
						description: 'Whether to exclude alternate accounts from the restriction',
					},
					{
						displayName: 'Private Reason',
						name: 'privateReason',
						type: 'string',
						default: '',
						required: true,
						description: 'The private reason for the user restriction',
					},
				],
			},
		],
	},
];
