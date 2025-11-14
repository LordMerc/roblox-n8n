import type { INodeProperties } from 'n8n-workflow';

export const legacyUserOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['legacy_User'],
			},
		},
		options: [
			{
				name: 'Get Username History',
				value: 'get_username_history',
				description: 'Get the username history of a user',
				action: 'Get username history',
				routing: {
					request: {
						method: 'GET',
						url: '=https://users.roblox.com/v1/users/{{ $parameter["userId"] }}/username-history',
						qs: {
							limit: '={{ $parameter["arguments_username_history"].limit }}',
							cursor: '={{ $parameter["arguments_username_history"].cursor }}',
							sortOrder: '={{ $parameter["arguments_username_history"].sortOrder }}',
						},
					},
				},
			},
			{
				name: 'Get Usernames From User IDs',
				value: 'get_usernames_from_user_ids',
				action: 'Get usernames from user ids',
				routing: {
					request: {
						method: 'POST',
						url: '=https://users.roblox.com/v1/users',
						body: {
							userIds:
								'={{ ($parameter["arguments_user_names_from_user_ids"].userNamesFromUserIdsTable.userIds || "")' +
								'.split(",")' +
								'.map(id => parseInt(id.trim(), 10))' +
								'.filter(n => Number.isFinite(n)) }}',
							excludeBannedUsers:
								'={{ $parameter["arguments_user_names_from_user_ids"].userNamesFromUserIdsTable.excludeBannedUsers }}',
						},
						headers: {
							'Content-Type': 'application/json',
						},
					},
				},
			},
		],
		default: 'get_username_history',
	},
];

export const legacyUserFields: INodeProperties[] = [
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		default: '',
		required: true,
		description: 'The ID of the user to retrieve',
		displayOptions: {
			show: {
				resource: ['legacy_User'],
				operation: ['get_username_history'],
			},
		},
	},
	{
		displayName: 'Query Parameters',
		name: 'arguments_username_history',
		default: {},
		type: 'collection',
		description: "The request's query parameters",
		displayOptions: {
			show: {
				resource: ['legacy_User'],
				operation: ['get_username_history'],
			},
		},
		options: [
			{
				displayName: 'Limit',
				name: 'limit',
				typeOptions: {
					minValue: 1,
				},
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
				// eslint-disable-next-line n8n-nodes-base/node-param-default-wrong-for-limit
				default: 10,
				description: 'Max number of results to return',
			},
			{
				displayName: 'Cursor',
				name: 'cursor',
				type: 'string',
				default: '',
				description: 'Cursor for pagination',
			},
			{
				displayName: 'Sort Order',
				name: 'sortOrder',
				type: 'options',
				options: [
					{
						name: 'Asc',
						value: 'Asc',
					},
					{
						name: 'Desc',
						value: 'Desc',
					},
				],
				default: 'Asc',
				description: 'Order of the results',
			},
		],
	},
	{
		displayName: 'User IDs From Usernames',
		name: 'arguments_user_names_from_user_ids',
		placeholder: 'Add Metadata',
		type: 'fixedCollection',
		default: {},
		typeOptions: {
			multipleValues: false,
		},
		options: [
			{
				name: 'userNamesFromUserIdsTable',
				displayName: 'User Names',
				values: [
					{
						displayName: 'User IDs',
						name: 'userIds',
						type: 'string',
						default: '',
						description:
							'Comma-separated list of user IDs to retrieve usernames for. Maximum 1000 user IDs.',
					},
					{
						displayName: 'Exclude Banned Users',
						name: 'excludeBannedUsers',
						type: 'boolean',
						default: true,
						description: 'Whether to exclude banned users from the results. Default is true.',
					},
				],
			},
		],
		displayOptions: {
			// the resources and operations to display this element with
			show: {
				resource: [
					// comma-separated list of resource names
					'legacy_User',
				],
				operation: [
					// comma-separated list of operation names
					'get_usernames_from_user_ids',
				],
			},
		},
	},
];
