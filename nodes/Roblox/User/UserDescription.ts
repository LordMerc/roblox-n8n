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
			{
				name: 'Generate User Thumbnail',
				value: 'generate_thumbnail',
				description: 'Generate a user thumbnail',
				action: 'Generate user thumbnail',
				routing: {
					request: {
						method: 'GET',
						url: '=/cloud/v2/users/{{$parameter["userId"]}}:generateThumbnail',
						headers: {
							'x-api-key': '={{ $credentials.apiKey }}',
						},
						qs: {
							size: '={{ $parameter["arguments_thumbnail_generation"].size }}',
							format: '={{ $parameter["arguments_thumbnail_generation"].format }}',
							shape: '={{ $parameter["arguments_thumbnail_generation"].shape }}',
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
				operation: ['get_user', 'generate_thumbnail'],
			},
		},
	},
	{
		displayName: 'Query Parameters',
		name: 'arguments_thumbnail_generation',
		default: {},
		type: 'collection',
		description: "The request's query parameters",
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['generate_thumbnail'],
			},
		},
		options: [
			{
				displayName: 'Size',
				name: 'size',
				type: 'options',
				options: [
					{
						name: '48x48',
						value: '48',
					},
					{
						name: '50x50',
						value: '50',
					},
					{
						name: '60x60',
						value: '60',
					},
					{
						name: '75x75',
						value: '75',
					},
					{
						name: '100x100',
						value: '100',
					},
					{
						name: '110x110',
						value: '110',
					},
					{
						name: '150x150',
						value: '150',
					},
					{
						name: '180x180',
						value: '180',
					},
					{
						name: '352x352',
						value: '352',
					},
					{
						name: '420x420',
						value: '420',
					},
					{
						name: '720x720',
						value: '720',
					},
				],
				default: '420',
				description: 'The size of the thumbnail to generate',
			},
			{
				displayName: 'Format',
				name: 'format',
				type: 'options',
				options: [
					{
						name: 'PNG',
						value: 'PNG',
					},
					{
						name: 'JPEG',
						value: 'JPEG',
					},
				],
				default: 'PNG',
				description: 'The format of the thumbnail to generate',
			},
			{
				displayName: 'Shape',
				name: 'shape',
				type: 'options',
				options: [
					{
						name: 'Round',
						value: 'ROUND',
					},
					{
						name: 'Square',
						value: 'SQUARE',
					},
				],
				default: 'ROUND',
				description: 'The format of the thumbnail to generate',
			},
		],
	},
];
