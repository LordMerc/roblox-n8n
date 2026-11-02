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
				name: 'Generate User Thumbnail',
				value: 'generate_thumbnail',
				description: 'Generate a user thumbnail',
				action: 'Generate user thumbnail',
				routing: {
					request: {
						method: 'GET',
						url: '=/cloud/v2/users/{{ $parameter["userId"] || $json?.userId || $json?.query?.userId }}:generateThumbnail',
						qs: {
							size: '={{ $parameter["arguments_thumbnail_generation"].size }}',
							format: '={{ $parameter["arguments_thumbnail_generation"].format }}',
							shape: '={{ $parameter["arguments_thumbnail_generation"].shape }}',
						},
					},
				},
			},
			{
				name: 'Get Subscription',
				value: 'get_subscription',
				description: 'Get a user subscription to a subscription product',
				action: 'Get subscription',
				routing: {
					request: {
						method: 'GET',
						url: '=/cloud/v2/universes/{{ $parameter["universeId"] }}/subscription-products/{{ $parameter["subscriptionProductId"] }}/subscriptions/{{ $parameter["subscriptionId"] }}',
						qs: {
							view: '={{ $parameter["view"] }}',
						},
					},
				},
			},
			{
				name: 'Get Thumbnail Operation',
				value: 'get_thumbnail_operation',
				description: 'Poll a user thumbnail generation operation until it is done',
				action: 'Get thumbnail operation',
				routing: {
					request: {
						method: 'GET',
						url: '=/cloud/v2/users/{{ $parameter["userId"] }}/operations/{{ $parameter["operationId"] }}',
					},
				},
			},
			{
				name: 'Get User',
				value: 'get_user',
				description: 'Retrieve a user',
				action: 'Get user',
				routing: {
					request: {
						method: 'GET',
						url: '=/cloud/v2/users/{{ $parameter["userId"] || $json?.userId || $json?.query?.userId }}',
					},
				},
			},
			{
				name: 'List Inventory Items (Beta)',
				value: 'list_inventory_items',
				description:
					"List items in a user's inventory, such as game passes, badges, and assets. Requires user.inventory-item:read unless the inventory is public.",
				action: 'List inventory items',
				routing: {
					request: {
						method: 'GET',
						url: '=/cloud/v2/users/{{ $parameter["userId"] }}/inventory-items',
						qs: {
							maxPageSize: '={{ $parameter["inventory_items_query"].maxPageSize }}',
							pageToken: '={{ $parameter["inventory_items_query"].pageToken }}',
							filter: '={{ $parameter["inventory_items_query"].filter }}',
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
				operation: [
					'get_user',
					'generate_thumbnail',
					'get_thumbnail_operation',
					'list_inventory_items',
				],
			},
		},
	},
	{
		displayName: 'Operation ID',
		name: 'operationId',
		type: 'string',
		default: '',
		required: true,
		description:
			'The operation ID returned by Generate User Thumbnail (the last segment of its path)',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['get_thumbnail_operation'],
			},
		},
	},
	{
		displayName: 'Query Parameters',
		name: 'inventory_items_query',
		type: 'collection',
		default: {},
		description: "The request's query parameters",
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['list_inventory_items'],
			},
		},
		options: [
			{
				displayName: 'Filter',
				name: 'filter',
				type: 'string',
				default: '',
				placeholder: 'gamePassIds=123456;badgeIds=789',
				description:
					'Filter the returned items, for example by gamePassIds, badgeIds, assetIds, or inventoryItemAssetTypes. See the Roblox inventory filtering docs.',
			},
			{
				displayName: 'Max Page Size',
				name: 'maxPageSize',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				description: 'The maximum number of items to return',
			},
			{
				displayName: 'Page Token',
				name: 'pageToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description: 'A page token from a previous call, used to fetch the next page',
			},
		],
	},
	{
		displayName: 'Universe ID',
		name: 'universeId',
		type: 'string',
		default: '',
		required: true,
		description: 'The universe ID that owns the subscription product',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['get_subscription'],
			},
		},
	},
	{
		displayName: 'Subscription Product ID',
		name: 'subscriptionProductId',
		type: 'string',
		default: '',
		required: true,
		description: 'The subscription-product ID',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['get_subscription'],
			},
		},
	},
	{
		displayName: 'Subscription ID',
		name: 'subscriptionId',
		type: 'string',
		default: '',
		required: true,
		description: 'The subscription ID, which is the subscribed user ID',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['get_subscription'],
			},
		},
	},
	{
		displayName: 'View',
		name: 'view',
		type: 'options',
		options: [
			{
				name: 'Basic',
				value: 'BASIC',
			},
			{
				name: 'Full',
				value: 'FULL',
			},
			{
				name: 'View Unspecified',
				value: 'VIEW_UNSPECIFIED',
			},
		],
		default: 'BASIC',
		description: 'The view in which to retrieve the subscription',
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['get_subscription'],
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
