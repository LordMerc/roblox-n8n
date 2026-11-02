import type { INodeProperties } from 'n8n-workflow';
import { productMultipartPreSend } from '../GenericFunctions';

const developerProductsUrl =
	'=/developer-products/v2/universes/{{ $parameter["universeId"] }}/developer-products';
const gamePassesUrl = '=/game-passes/v1/universes/{{ $parameter["universeId"] }}/game-passes';

const listQuery = {
	pageSize: '={{ $parameter["product_list_query"].pageSize }}',
	pageToken: '={{ $parameter["product_list_query"].pageToken }}',
};

export const developerProductOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['developerProduct'],
			},
		},
		options: [
			{
				name: 'Create Developer Product (Beta)',
				value: 'create_developer_product',
				description: 'Create a developer product in a universe',
				action: 'Create developer product',
				routing: {
					request: {
						method: 'POST',
						url: developerProductsUrl,
					},
					send: {
						preSend: [productMultipartPreSend],
					},
				},
			},
			{
				name: 'Get Developer Product (Beta)',
				value: 'get_developer_product',
				description: 'Get a developer product with its configuration details',
				action: 'Get developer product',
				routing: {
					request: {
						method: 'GET',
						url: `${developerProductsUrl}/{{ $parameter["productId"] }}/creator`,
					},
				},
			},
			{
				name: 'List Developer Products (Beta)',
				value: 'list_developer_products',
				description: 'List the developer products in a universe with their configuration details',
				action: 'List developer products',
				routing: {
					request: {
						method: 'GET',
						url: `${developerProductsUrl}/creator`,
						qs: listQuery,
					},
				},
			},
			{
				name: 'Update Developer Product (Beta)',
				value: 'update_developer_product',
				description:
					'Update the name, description, price, sale status, or icon of a developer product',
				action: 'Update developer product',
				routing: {
					request: {
						method: 'PATCH',
						url: `${developerProductsUrl}/{{ $parameter["productId"] }}`,
					},
					send: {
						preSend: [productMultipartPreSend],
					},
				},
			},
		],
		default: 'list_developer_products',
	},
];

export const gamePassOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['gamePass'],
			},
		},
		options: [
			{
				name: 'Create Game Pass (Beta)',
				value: 'create_game_pass',
				description: 'Create a game pass in a universe',
				action: 'Create game pass',
				routing: {
					request: {
						method: 'POST',
						url: gamePassesUrl,
					},
					send: {
						preSend: [productMultipartPreSend],
					},
				},
			},
			{
				name: 'Get Game Pass (Beta)',
				value: 'get_game_pass',
				description: 'Get a game pass with its configuration details',
				action: 'Get game pass',
				routing: {
					request: {
						method: 'GET',
						url: `${gamePassesUrl}/{{ $parameter["gamePassId"] }}/creator`,
					},
				},
			},
			{
				name: 'List Game Passes (Beta)',
				value: 'list_game_passes',
				description: 'List the game passes in a universe with their configuration details',
				action: 'List game passes',
				routing: {
					request: {
						method: 'GET',
						url: `${gamePassesUrl}/creator`,
						qs: listQuery,
					},
				},
			},
			{
				name: 'Update Game Pass (Beta)',
				value: 'update_game_pass',
				description: 'Update the name, description, price, sale status, or icon of a game pass',
				action: 'Update game pass',
				routing: {
					request: {
						method: 'PATCH',
						url: `${gamePassesUrl}/{{ $parameter["gamePassId"] }}`,
					},
					send: {
						preSend: [productMultipartPreSend],
					},
				},
			},
		],
		default: 'list_game_passes',
	},
];

const resources = ['developerProduct', 'gamePass'];
const createOperations = ['create_developer_product', 'create_game_pass'];
const writeOperations = [...createOperations, 'update_developer_product', 'update_game_pass'];

export const monetizationFields: INodeProperties[] = [
	{
		displayName: 'Universe ID',
		name: 'universeId',
		type: 'string',
		default: '',
		required: true,
		description: 'The universe ID that owns the product',
		displayOptions: {
			show: {
				resource: resources,
			},
		},
	},
	{
		displayName: 'Product ID',
		name: 'productId',
		type: 'string',
		default: '',
		required: true,
		description: 'The developer product ID',
		displayOptions: {
			show: {
				resource: ['developerProduct'],
				operation: ['get_developer_product', 'update_developer_product'],
			},
		},
	},
	{
		displayName: 'Game Pass ID',
		name: 'gamePassId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['gamePass'],
				operation: ['get_game_pass', 'update_game_pass'],
			},
		},
	},
	{
		displayName: 'Name',
		name: 'productName',
		type: 'string',
		default: '',
		required: true,
		description: 'The name shown to players',
		displayOptions: {
			show: {
				resource: resources,
				operation: createOperations,
			},
		},
	},
	{
		displayName: 'Fields',
		name: 'productFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		description: 'Product settings to send. Fields you leave out are not changed.',
		displayOptions: {
			show: {
				resource: resources,
				operation: writeOperations,
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
			},
			{
				displayName: 'For Sale',
				name: 'isForSale',
				type: 'boolean',
				default: true,
				description: 'Whether players can buy the product',
			},
			{
				displayName: 'Managed Pricing Enabled',
				name: 'isManagedPricingEnabled',
				type: 'boolean',
				default: false,
				description: 'Whether Roblox manages the price automatically',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'A new name for the product (update only)',
			},
			{
				displayName: 'Price (Robux)',
				name: 'price',
				type: 'number',
				typeOptions: {
					minValue: 0,
				},
				default: 0,
			},
			{
				displayName: 'Regional Pricing Enabled',
				name: 'isRegionalPricingEnabled',
				type: 'boolean',
				default: false,
				description: 'Whether regional pricing is enabled',
			},
			{
				displayName: 'Store Page Enabled',
				name: 'storePageEnabled',
				type: 'boolean',
				default: true,
				description:
					'Whether the product shows on the experience store page (developer product updates only)',
			},
		],
	},
	{
		displayName: 'Image Binary Property',
		name: 'productImageBinaryProperty',
		type: 'string',
		default: '',
		placeholder: 'data',
		description:
			'Name of the input binary property holding the product icon. Leave empty to send no image.',
		displayOptions: {
			show: {
				resource: resources,
				operation: writeOperations,
			},
		},
	},
	{
		displayName: 'Query Parameters',
		name: 'product_list_query',
		type: 'collection',
		default: {},
		description: "The request's query parameters",
		displayOptions: {
			show: {
				resource: resources,
				operation: ['list_developer_products', 'list_game_passes'],
			},
		},
		options: [
			{
				displayName: 'Page Size',
				name: 'pageSize',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				description: 'The number of results to return',
			},
			{
				displayName: 'Page Token',
				name: 'pageToken',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description: 'The cursor from a previous response, used to fetch the next page',
			},
		],
	},
];
