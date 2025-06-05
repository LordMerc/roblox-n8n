import type { INodeProperties } from 'n8n-workflow';

export const legacyPlaceOperations: INodeProperties[] = [
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
			{
				name: 'Get Universe Products',
				value: 'get_universe_products',
				description: 'Get the products of a universe',
				action: 'Get universe products',
				routing: {
					request: {
						method: 'GET',
						url: '=https://games.roblox.com/v1/games/games-product-info',
						qs: {
							universeIds: '={{ $parameter["universeIds"] }}',
						},
					},
				},
			},
		],
		default: 'get_favorites_count',
	},
];

export const legacyPlaceFields: INodeProperties[] = [
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
	{
		displayName: 'Universe IDs',
		name: 'universeIds',
		type: 'string',
		default: '',
		required: true,
		description: 'The Universe IDs of the places, comma-separated',
		displayOptions: {
			show: {
				resource: ['legacy_Place'],
				operation: ['get_universe_products'],
			},
		},
	},
];
