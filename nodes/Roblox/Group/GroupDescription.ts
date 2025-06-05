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
				action: 'Get group',
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
				name: 'Get Group Memberships',
				value: 'get_memberships',
				description: "Retrieve a group's memberships",
				action: 'Get group memberships',
				routing: {
					request: {
						method: 'GET',
						url: '=/cloud/v2/groups/{{$parameter["groupId"]}}/memberships',
						headers: {
							'x-api-key': '={{ $credentials.apiKey }}',
						},
						qs: {
							maxPageSize: '={{ $parameter["arguments_memberships"].maxPageSize }}',
							pageToken: '={{ $parameter["arguments_memberships"].pageToken }}',
							filter: '={{ $parameter["arguments_memberships"].filter }}',
						},
					},
				},
			},
			{
				name: 'Get Group Roles',
				value: 'get_roles',
				description: 'Retrieve group roles',
				action: 'Get group roles',
				routing: {
					request: {
						method: 'GET',
						url: '=/cloud/v2/groups/{{$parameter["groupId"]}}/roles',
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
				action: 'Get group shout',
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
			{
				name: 'Update Group Shout',
				value: 'update_group_shout',
				description: 'Update a group shout',
				action: 'Update group shout',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/legacy-groups/v1/groups/{{ $parameter["groupId"] }}/status',
						body: {
							message: '={{ $parameter["message"] }}',
						},

						headers: {
							'x-api-key': '={{ $credentials.apiKey }}',
							'Content-Type': 'application/json',
						},
					},
				},
			},
			{
				name: 'Update Member Role',
				value: 'update_member_role',
				description: "Update a member's role in the group",
				action: 'Update group member role',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/cloud/v2/groups/{{ $parameter["groupId"] }}/memberships/{{ $parameter["userId"] }}',
						body: {
							role: '=groups/{{ $parameter["groupId"] }}/roles/{{ $parameter["roleId"] }}',
						},
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
				operation: [
					'get_group',
					'get_shout',
					'update_member_role',
					'get_memberships',
					'get_roles',
					'update_group_shout',
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
		description: 'The ID of the the user',
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['update_member_role'],
			},
		},
	},
	{
		displayName: 'Shout Message',
		name: 'message',
		type: 'string',
		default: '',
		required: true,
		description: 'The message to post as the group shout',
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['update_group_shout'],
			},
		},
	},
	{
		displayName: 'Query Parameters',
		name: 'arguments_memberships',
		default: {},
		type: 'collection',
		description: "The request's query parameters",
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['get_memberships'],
			},
		},
		options: [
			{
				displayName: 'Max Page Size',
				name: 'maxPageSize',
				type: 'number',
				default: 10,
				description: 'Maximum number of results per page',
			},
			{
				displayName: 'Page Token',
				name: 'pageToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description: 'Token for pagination',
			},
			{
				displayName: 'Filter',
				name: 'filter',
				type: 'string',
				default: '',
				description: 'Optional filter expression',
			},
		],
	},

	{
		displayName: 'Role ID',
		name: 'roleId',
		type: 'string',
		default: '',
		required: true,
		description: 'The ID of the role to assign to the member',
		displayOptions: {
			show: {
				resource: ['group'],
				operation: ['update_member_role'],
			},
		},
	},
];
