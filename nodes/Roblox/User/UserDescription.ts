import type { INodeProperties } from 'n8n-workflow';

export const userOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['user'],
			},
		},
		options: [
			{
				name: 'Get User',
				value: 'get_user',
				description: 'Retrieve a user',
				action: 'Get user',
				routing: {
					request: {
						method: 'GET',
						url: '=/cloud/v2/users/{{$parameter["userId"]}}',
						headers: {
							'x-api-key': '={{ $credentials.apiKey }}',
						},
					},
				},
			},
		],
		default: 'get_user',
	},
];

export const userFields: INodeProperties[] = [
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		default: '',
		required: true,
		description: 'The Roblox user ID to retrieve',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['get_user'],
			},
		},
	},
];
