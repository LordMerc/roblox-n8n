import type { INodeProperties } from 'n8n-workflow';

export const userOperations: INodeProperties[] = [
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
		],
		default: 'get_username_history',
	},
];

export const userFields: INodeProperties[] = [
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
];
