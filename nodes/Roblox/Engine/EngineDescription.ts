import type { INodeProperties } from 'n8n-workflow';

export const engineOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['engine'],
			},
		},
		options: [
			{
				name: 'Get Operation',
				value: 'get_operation',
				description: 'Get details of an operation',
				action: 'Get operation',
				routing: {
					request: {
						method: 'GET',
						url: '=/assets/v1/{{ $parameter["operationPath"] }}',
						headers: {
							'x-api-key': '={{ $credentials.apiKey }}',
						},
					},
				},
			},
		],
		default: 'get_operation',
	},
];

export const engineFields: INodeProperties[] = [
	{
		displayName: 'Operation Path',
		name: 'operationPath',
		type: 'string',
		default: '',
		required: true,
		description: 'The path of the operation to retrieve details for',
		displayOptions: {
			show: {
				resource: ['engine'],
				operation: ['get_operation'],
			},
		},
	},
];
