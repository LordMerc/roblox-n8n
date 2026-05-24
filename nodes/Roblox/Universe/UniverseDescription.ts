import type { INodeProperties } from 'n8n-workflow';

const USER_RESTRICTION_BODY = `={{ {
	gameJoinRestriction: Object.fromEntries(
		Object.entries({
			active: $parameter["user_restriction_game_join_restriction"].active,
			displayReason: $parameter["user_restriction_game_join_restriction"].displayReason,
			duration: $parameter["user_restriction_game_join_restriction"].duration,
			excludeAltAccounts: $parameter["user_restriction_game_join_restriction"].excludeAltAccounts,
			privateReason: $parameter["user_restriction_game_join_restriction"].privateReason,
			startTime: $parameter["user_restriction_game_join_restriction"].startTime,
		}).filter(([_, value]) => value !== "" && value !== null && value !== undefined)
	)
} }}`;

const USER_RESTRICTION_UPDATE_QS = {
	updateMask: '={{ $parameter["userRestrictionUpdateMask"] }}',
	'idempotencyKey.key': '={{ $parameter["idempotencyKeyKey"] }}',
	'idempotencyKey.firstSent': '={{ $parameter["idempotencyKeyFirstSent"] }}',
};

const USER_RESTRICTIONS_LIST_QS = {
	maxPageSize: '={{ $parameter["user_restrictions_query"].maxPageSize }}',
	pageToken: '={{ $parameter["user_restrictions_query"].pageToken }}',
};

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
				name: 'Get Place User Restriction',
				value: 'get_place_user_restriction',
				description: 'Get a user restriction for a place',
				action: 'Get place user restriction',
				routing: {
					request: {
						method: 'GET',
						url: '=/cloud/v2/universes/{{ $parameter["universeId"] }}/places/{{ $parameter["placeId"] }}/user-restrictions/{{ $parameter["userRestrictionId"] }}',
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
					},
				},
			},
			{
				name: 'Get Universe User Restriction',
				value: 'get_user_restriction_universe',
				description: 'Get a user restriction for a universe',
				action: 'Get universe user restriction',
				routing: {
					request: {
						method: 'GET',
						url: '=/cloud/v2/universes/{{ $parameter["universeId"] }}/user-restrictions/{{ $parameter["userRestrictionId"] }}',
					},
				},
			},
			{
				name: 'List Place User Restrictions',
				value: 'list_place_user_restrictions',
				description: 'List user restrictions for a place',
				action: 'List place user restrictions',
				routing: {
					request: {
						method: 'GET',
						url: '=/cloud/v2/universes/{{ $parameter["universeId"] }}/places/{{ $parameter["placeId"] }}/user-restrictions',
						qs: USER_RESTRICTIONS_LIST_QS,
					},
				},
			},
			{
				name: 'List Universe User Restriction Logs',
				value: 'list_user_restriction_logs',
				description: 'List user restriction changes within a universe',
				action: 'List universe user restriction logs',
				routing: {
					request: {
						method: 'GET',
						url: '=/cloud/v2/universes/{{ $parameter["universeId"] }}/user-restrictions:listLogs',
						qs: {
							maxPageSize:
								'={{ $parameter["arguments_list_user_restriction_logs"].maxPageSize }}',
							pageToken:
								'={{ $parameter["arguments_list_user_restriction_logs"].pageToken }}',
							filter: '={{ $parameter["arguments_list_user_restriction_logs"].filter }}',
						},
					},
				},
			},
			{
				name: 'List Universe User Restrictions',
				value: 'get_user_restrictions_universe',
				description: 'List user restrictions for a universe',
				action: 'List universe user restrictions',
				routing: {
					request: {
						method: 'GET',
						url: '=/cloud/v2/universes/{{ $parameter["universeId"] }}/user-restrictions',
						qs: USER_RESTRICTIONS_LIST_QS,
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
					},
				},
			},
			{
				name: 'Update Place User Restriction',
				value: 'update_place_user_restriction',
				description: 'Update a user restriction for a place',
				action: 'Update place user restriction',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/cloud/v2/universes/{{ $parameter["universeId"] }}/places/{{ $parameter["placeId"] }}/user-restrictions/{{ $parameter["userRestrictionId"] }}',
						qs: USER_RESTRICTION_UPDATE_QS,
						body: USER_RESTRICTION_BODY,
					},
				},
			},
			{
				name: 'Update Universe User Restriction',
				value: 'update_user_restriction_universe',
				description: 'Update a user restriction for a universe',
				action: 'Update universe user restriction',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/cloud/v2/universes/{{ $parameter["universeId"] }}/user-restrictions/{{ $parameter["userRestrictionId"] }}',
						qs: USER_RESTRICTION_UPDATE_QS,
						body: USER_RESTRICTION_BODY,
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
		displayOptions: {
			show: {
				resource: ['universe'],
				operation: [
					'generate_speech_asset',
					'get_place_user_restriction',
					'get_universe',
					'get_user_restriction_universe',
					'get_user_restrictions_universe',
					'list_place_user_restrictions',
					'list_user_restriction_logs',
					'publish_universe_message',
					'restart_universe_servers',
					'update_place_user_restriction',
					'update_user_restriction_universe',
				],
			},
		},
	},
	{
		displayName: 'Place ID',
		name: 'placeId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['universe'],
				operation: [
					'get_place_user_restriction',
					'list_place_user_restrictions',
					'update_place_user_restriction',
				],
			},
		},
	},
	{
		displayName: 'User Restriction ID',
		name: 'userRestrictionId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['universe'],
				operation: [
					'get_place_user_restriction',
					'get_user_restriction_universe',
					'update_place_user_restriction',
					'update_user_restriction_universe',
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
		displayName: 'Query Parameters',
		name: 'user_restrictions_query',
		default: {},
		type: 'collection',
		description: "The request's query parameters",
		displayOptions: {
			show: {
				resource: ['universe'],
				operation: ['get_user_restrictions_universe', 'list_place_user_restrictions'],
			},
		},
		options: [
			{
				displayName: 'Max Page Size',
				name: 'maxPageSize',
				type: 'number',
				default: 10,
				description: 'Maximum number of user restrictions to return, up to 100',
			},
			{
				displayName: 'Page Token',
				name: 'pageToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description: 'Token for pagination',
			},
		],
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
				displayName: 'Filter',
				name: 'filter',
				type: 'string',
				default: '',
				description:
					'Optional CEL filter expression, for example user == "users/123" && place == "places/456"',
			},
			{
				displayName: 'Max Page Size',
				name: 'maxPageSize',
				type: 'number',
				default: 10,
				description: 'Maximum number of user restriction logs to return, up to 100',
			},
			{
				displayName: 'Page Token',
				name: 'pageToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description: 'Token for pagination',
			},
		],
	},
	{
		displayName: 'Idempotency Key',
		name: 'idempotencyKeyKey',
		type: 'string',
		default: '',
		description: 'Unique key to use for idempotency',
		displayOptions: {
			show: {
				resource: ['universe'],
				operation: ['update_place_user_restriction', 'update_user_restriction_universe'],
			},
		},
	},
	{
		displayName: 'Idempotency Key First Sent',
		name: 'idempotencyKeyFirstSent',
		type: 'string',
		default: '',
		description: 'ISO timestamp at which the first idempotent request was sent',
		displayOptions: {
			show: {
				resource: ['universe'],
				operation: ['update_place_user_restriction', 'update_user_restriction_universe'],
			},
		},
	},
	{
		displayName: 'Update Mask',
		name: 'userRestrictionUpdateMask',
		type: 'string',
		default: 'game_join_restriction',
		description:
			'Fields to update. Use game_join_restriction; nested game_join_restriction fields are not supported by Roblox.',
		displayOptions: {
			show: {
				resource: ['universe'],
				operation: ['update_place_user_restriction', 'update_user_restriction_universe'],
			},
		},
	},
	{
		displayName: 'Update Fields',
		name: 'user_restriction_game_join_restriction',
		default: {},
		type: 'collection',
		description: 'The game join restriction fields to update',
		displayOptions: {
			show: {
				resource: ['universe'],
				operation: ['update_place_user_restriction', 'update_user_restriction_universe'],
			},
		},
		options: [
			{
				displayName: 'Active',
				name: 'active',
				type: 'boolean',
				default: true,
				description: 'Whether the user restriction is active',
			},
			{
				displayName: 'Display Reason',
				name: 'displayReason',
				type: 'string',
				default: '',
				description: 'The public reason displayed to the user',
			},
			{
				displayName: 'Duration',
				name: 'duration',
				type: 'string',
				default: '',
				placeholder: '3600s',
				description:
					'Duration of the restriction. Omit for permanent restrictions. Valid range is 1s to 315576000000s.',
			},
			{
				displayName: 'Exclude Alt Accounts',
				name: 'excludeAltAccounts',
				type: 'boolean',
				default: false,
				description: 'Whether to avoid propagating the restriction to alternate accounts',
			},
			{
				displayName: 'Private Reason',
				name: 'privateReason',
				type: 'string',
				default: '',
				description: 'The private reason for the user restriction',
			},
			{
				displayName: 'Start Time',
				name: 'startTime',
				type: 'string',
				default: '',
				description: 'Restriction start time as an RFC 3339 timestamp',
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
						description: 'The voice ID of the speech asset',
					},
				],
			},
		],
	},
];
