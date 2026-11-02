import type { INodeProperties } from 'n8n-workflow';
import { placeFilePreSend } from '../GenericFunctions';

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
					},
				},
			},
			{
				name: 'Publish Place (Beta)',
				value: 'publish_place',
				description:
					'Upload an .rbxl or .rbxlx file as a new version of a place, and optionally publish it',
				action: 'Publish place',
				routing: {
					request: {
						method: 'POST',
						url: '=/universes/v1/{{ $parameter["universeId"] }}/places/{{ $parameter["placeId"] }}/versions',
						qs: {
							versionType: '={{ $parameter["placeVersionType"] }}',
						},
					},
					send: {
						preSend: [placeFilePreSend],
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
				operation: [
					'get_place',
					'publish_place',
					'update_place',
					'get_user_restriction_universe',
					'get_user_restrictions_universe',
					'update_user_restriction_universe',
				],
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
				operation: ['get_place', 'publish_place', 'update_place'],
			},
		},
	},
	{
		displayName: 'Version Type',
		name: 'placeVersionType',
		type: 'options',
		options: [
			{
				name: 'Published',
				value: 'Published',
				description: 'Save the file and publish it so new servers use it',
			},
			{
				name: 'Saved',
				value: 'Saved',
				description: 'Save the file as a new version without publishing it',
			},
		],
		default: 'Published',
		displayOptions: {
			show: {
				resource: ['place'],
				operation: ['publish_place'],
			},
		},
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		description:
			'Name of the input binary field holding the place file. Files ending in .rbxlx are sent as XML; anything else is sent as binary .rbxl.',
		displayOptions: {
			show: {
				resource: ['place'],
				operation: ['publish_place'],
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
