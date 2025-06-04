import type { INodeProperties } from 'n8n-workflow';

export const groupOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['group'],
			},
		},
		options: [
			{
				name: 'Get Group',
				value: 'get_group',
				description: 'Retrieve a group',
				action: 'Get group by ID',
				routing: {
					request: {
						method: 'GET',
						url: '=/cloud/v2/groups/{{$parameter["groupId"]}}',
						headers: {
							'x-api-key': '={{ $credentials.apiKey }}',
						},
					},
				},
			},
			{
				name: 'Get Group Shout',
				value: 'get_shout',
				description: 'Retrieve a group shout',
				action: 'Get group shout by ID',
				routing: {
					request: {
						method: 'GET',
						url: '=/cloud/v2/groups/{{$parameter["groupId"]}}/shout',
						headers: {
							'x-api-key': '={{ $credentials.apiKey }}',
						},
					},
				},
			},
		],
		default: 'get_group',
	},
];

export const groupFields: INodeProperties[] = [
	{
		displayName: 'Group ID',
		name: 'groupId',
		type: 'string',
		default: '',
		required: true,
		description: 'The Roblox group ID to retrieve',
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['get_group', 'get_shout'],
			},
		},
	},
];
