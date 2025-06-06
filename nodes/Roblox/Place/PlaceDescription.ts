import type { INodeProperties } from 'n8n-workflow';
export const placeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['place'],
			},
		},
		options: [
			{
				name: 'Get Place',
				value: 'get_place',
				description: 'Get details of a place',
				action: 'Get place',
				routing: {
					request: {
						method: 'GET',
						url: '=/cloud/v2/universes/{{ $parameter["universeId"] }}/places/{{ $parameter["placeId"] }}',
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
				name: 'Update Place',
				value: 'update_place',
				description: 'Update details of a place',
				action: 'Update place',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/cloud/v2/universes/{{ $parameter["universeId"] }}/places/{{ $parameter["placeId"] }}',
						qs: {
							updateMask: '={{ Object.keys($parameter["place_update_mask"] || {}).join(",") }}',
						},
						body: '={{ $parameter["place_update_mask"] }}',
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
		default: 'get_place',
	},
];

export const placeFields: INodeProperties[] = [
	{
		displayName: 'Universe ID',
		name: 'universeId',
		type: 'string',
		default: '',
		required: true,
		description: 'The Universe ID of the place',
		displayOptions: {
			show: {
				resource: ['place'],
				operation: [
					'get_place',
					'update_place',
					'get_user_restriction_universe',
					'get_user_restrictions_universe',
					'update_user_restriction_universe',
				],
			},
		},
	},
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		default: '',
		required: true,
		description: 'The User ID to retrieve or update restrictions for',
		displayOptions: {
			show: {
				resource: ['place'],
				operation: ['get_user_restriction_universe', 'update_user_restriction_universe'],
			},
		},
	},
	{
		displayName: 'Place ID',
		name: 'placeId',
		type: 'string',
		default: '',
		required: true,
		description: 'The Place ID to retrieve or update',
		displayOptions: {
			show: {
				resource: ['place'],
				operation: ['get_place', 'update_place'],
			},
		},
	},
	{
		displayName: 'Update Fields',
		name: 'restriction_update_mask',
		default: {},
		type: 'fixedCollection',
		displayOptions: {
			show: {
				resource: ['place'],
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
	{
		displayName: 'Update Fields',
		name: 'place_update_mask',
		default: {},
		type: 'collection',
		description: 'The fields to update in the place',
		displayOptions: {
			show: {
				resource: ['place'],
				operation: ['update_place'],
			},
		},
		options: [
			{
				displayName: 'Display Name',
				name: 'displayName',
				type: 'string',
				default: '',
				description: 'The display name of the place',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'The description of the place',
			},
			{
				displayName: 'Server Size',
				name: 'serverSize',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 150,
				},
				default: 10,
				description: 'The maximum number of players allowed in the place',
			},
		],
	},
];
