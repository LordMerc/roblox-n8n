import type { INodeProperties } from 'n8n-workflow';

export const placeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['legacy_Place'],
			},
		},
		options: [
			{
				name: 'Get Favorites Count',
				value: 'get_favorites_count',
				description: 'Get the count of favorites for a place',
				action: 'Get favorites count',
				routing: {
					request: {
						method: 'GET',
						url: '=https://games.roblox.com/v1/games/{{ $parameter["universeId"] }}/favorites/count',
					},
				},
			},
		],
		default: 'get_favorites_count',
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
				resource: ['legacy_Place'],
				operation: ['get_favorites_count'],
			},
		},
	},
];
