import type { INodeProperties } from 'n8n-workflow';

export const teamCreateOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['teamCreate'],
			},
		},
		options: [
			{
				name: 'Close Team Test Session',
				value: 'close_team_test_session',
				description: 'Close a game instance that is being used for team testing',
				action: 'Close team test session',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/legacy-develop/v2/teamtest/{{ $parameter["placeId"] }}',
						qs: {
							gameId: '={{ $parameter["gameId"] }}',
						},
					},
				},
			},
			{
				name: 'Get Active Session Members',
				value: 'get_active_session_members',
				description: 'List users in the active Team Create session',
				action: 'Get active team create session members',
				routing: {
					request: {
						method: 'GET',
						url: '=/legacy-develop/v1/places/{{ $parameter["placeId"] }}/teamcreate/active_session/members',
						qs: {
							limit: '={{ $parameter["team_create_pagination"].limit }}',
							cursor: '={{ $parameter["team_create_pagination"].cursor }}',
						},
					},
				},
			},
			{
				name: 'Get Many Team Create Settings',
				value: 'get_many_team_create_settings',
				description: 'Get Team Create settings for multiple universes',
				action: 'Get many team create settings',
				routing: {
					request: {
						method: 'GET',
						url: '=/legacy-develop/v1/universes/multiget/teamcreate',
						qs: {
							ids: '={{ $parameter["universeIds"].split(",").map(id => id.trim()).filter(Boolean) }}',
						},
					},
				},
			},
			{
				name: 'Get Team Create Settings',
				value: 'get_team_create_settings',
				description: 'Get Team Create settings for a universe',
				action: 'Get team create settings',
				routing: {
					request: {
						method: 'GET',
						url: '=/legacy-develop/v1/universes/{{ $parameter["universeId"] }}/teamcreate',
					},
				},
			},
			{
				name: 'Remove Team Create Membership',
				value: 'remove_team_create_membership',
				description: 'Remove a user from the Team Create permissions list',
				action: 'Remove team create membership',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/legacy-develop/v1/universes/{{ $parameter["universeId"] }}/teamcreate/memberships',
						body: {
							userId: '={{ $parameter["userId"] }}',
						},
					},
				},
			},
			{
				name: 'Update Team Create Settings',
				value: 'update_team_create_settings',
				description: 'Enable or disable Team Create for a universe',
				action: 'Update team create settings',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/legacy-develop/v1/universes/{{ $parameter["universeId"] }}/teamcreate',
						body: {
							isEnabled: '={{ $parameter["isEnabled"] }}',
						},
					},
				},
			},
		],
		default: 'get_team_create_settings',
	},
];

export const teamCreateFields: INodeProperties[] = [
	{
		displayName: 'Place ID',
		name: 'placeId',
		type: 'string',
		default: '',
		required: true,
		description: 'The place ID for Team Create or team testing',
		displayOptions: {
			show: {
				resource: ['teamCreate'],
				operation: ['close_team_test_session', 'get_active_session_members'],
			},
		},
	},
	{
		displayName: 'Game ID',
		name: 'gameId',
		type: 'string',
		default: '',
		required: true,
		description: 'The game instance GUID to close',
		displayOptions: {
			show: {
				resource: ['teamCreate'],
				operation: ['close_team_test_session'],
			},
		},
	},
	{
		displayName: 'Query Parameters',
		name: 'team_create_pagination',
		default: {},
		type: 'collection',
		description: "The request's query parameters",
		displayOptions: {
			show: {
				resource: ['teamCreate'],
				operation: ['get_active_session_members'],
			},
		},
		options: [
			{
				displayName: 'Cursor',
				name: 'cursor',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'The paging cursor for the previous or next page',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'options',
				options: [
					{
						name: '10',
						value: 10,
					},
					{
						name: '25',
						value: 25,
					},
					{
						name: '50',
						value: 50,
					},
					{
						name: '100',
						value: 100,
					},
				],
				default: 10,
				description: 'The number of results per request',
			},
		],
	},
	{
		displayName: 'Universe ID',
		name: 'universeId',
		type: 'string',
		default: '',
		required: true,
		description: 'The universe ID for Team Create settings',
		displayOptions: {
			show: {
				resource: ['teamCreate'],
				operation: [
					'get_team_create_settings',
					'update_team_create_settings',
					'remove_team_create_membership',
				],
			},
		},
	},
	{
		displayName: 'Enabled',
		name: 'isEnabled',
		type: 'boolean',
		default: true,
		required: true,
		description: 'Whether Team Create should be enabled for the universe',
		displayOptions: {
			show: {
				resource: ['teamCreate'],
				operation: ['update_team_create_settings'],
			},
		},
	},
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		default: '',
		required: true,
		description: 'The user ID to remove from the Team Create permissions list',
		displayOptions: {
			show: {
				resource: ['teamCreate'],
				operation: ['remove_team_create_membership'],
			},
		},
	},
	{
		displayName: 'Universe IDs',
		name: 'universeIds',
		type: 'string',
		default: '',
		required: true,
		description: 'Comma-separated universe IDs to fetch Team Create settings for',
		displayOptions: {
			show: {
				resource: ['teamCreate'],
				operation: ['get_many_team_create_settings'],
			},
		},
	},
];
