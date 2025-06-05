import type { INodeProperties } from 'n8n-workflow';

export const placeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['place'],
			},
		},
		options: [
			{
				name: 'Get Place',
				value: 'get_place',
				description: 'Get details of a place',
				action: 'Get place',
				routing: {
					request: {
						method: 'GET',
						url: '=/cloud/v2/universes/{{ $parameter["universeId"] }}/places/{{ $parameter["placeId"] }}',
						headers: {
							'x-api-key': '={{ $credentials.apiKey }}',
						},
					},
				},
			},
			{
				name: 'Update Place',
				value: 'update_place',
				description: 'Update details of a place',
				action: 'Update place',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/cloud/v2/universes/{{ $parameter["universeId"] }}/places/{{ $parameter["placeId"] }}',
						qs: {
							updateMask: '={{ Object.keys($parameter["place_update_mask"] || {}).join(",") }}',
						},
						body: '={{ $parameter["place_update_mask"] }}',
						headers: {
							'x-api-key': '={{ $credentials.apiKey }}',
						},
					},
				},
			},
		],
		default: 'get_place',
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
				resource: ['place'],
				operation: ['get_place', 'update_place'],
			},
		},
	},
	{
		displayName: 'Place ID',
		name: 'placeId',
		type: 'string',
		default: '',
		required: true,
		description: 'The Place ID to retrieve or update',
		displayOptions: {
			show: {
				resource: ['place'],
				operation: ['get_place', 'update_place'],
			},
		},
	},
	{
		displayName: 'Update Fields',
		name: 'place_update_mask',
		default: {},
		type: 'collection',
		description: 'The fields to update in the place',
		displayOptions: {
			show: {
				resource: ['place'],
				operation: ['update_place'],
			},
		},
		options: [
			{
				displayName: 'Display Name',
				name: 'displayName',
				type: 'string',
				default: '',
				description: 'The display name of the place',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'The description of the place',
			},
			{
				displayName: 'Server Size',
				name: 'serverSize',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 150,
				},
				default: 10,
				description: 'The maximum number of players allowed in the place',
			},
		],
	},
];
