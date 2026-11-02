import type { INodeProperties } from 'n8n-workflow';
import { assetMultipartPreSend, assetRollbackPreSend } from '../GenericFunctions';

const assetUrl = '=/assets/v1/assets/{{ $parameter["assetId"] }}';

const updateMaskExpression = `={{ (() => {
	const value = $parameter["assetUpdateJson"];
	const metadata =
		value === undefined || value === ""
			? {}
			: typeof value === "string"
				? JSON.parse(value)
				: value;
	const keys = Object.keys(metadata || {});
	return keys.length > 0 ? keys.join(",") : undefined;
})() }}`;

export const assetOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['asset'],
			},
		},
		options: [
			{
				name: 'Archive Asset (Beta)',
				value: 'archive_asset',
				description: 'Archive an asset so it is hidden and unusable until restored',
				action: 'Archive asset',
				routing: {
					request: {
						method: 'POST',
						url: `${assetUrl}:archive`,
					},
				},
			},
			{
				name: 'Create Asset (Beta)',
				value: 'create_asset',
				description:
					'Upload a new asset such as an image, decal, audio file, model, animation, or video. Returns an operation to poll.',
				action: 'Create asset',
				routing: {
					request: {
						method: 'POST',
						url: '/assets/v1/assets',
					},
					send: {
						preSend: [assetMultipartPreSend],
					},
				},
			},
			{
				name: 'Get Asset (Beta)',
				value: 'get_asset',
				description: 'Get the metadata of an asset',
				action: 'Get asset',
				routing: {
					request: {
						method: 'GET',
						url: assetUrl,
						qs: {
							readMask: '={{ $parameter["assetReadMask"] || undefined }}',
						},
					},
				},
			},
			{
				name: 'Get Asset Operation (Beta)',
				value: 'get_asset_operation',
				description: 'Poll the operation returned by Create Asset or Update Asset until it is done',
				action: 'Get asset operation',
				routing: {
					request: {
						method: 'GET',
						url: '=/assets/v1/operations/{{ $parameter["operationId"] }}',
					},
				},
			},
			{
				name: 'Get Asset Version (Beta)',
				value: 'get_asset_version',
				description: 'Get one version of an asset',
				action: 'Get asset version',
				routing: {
					request: {
						method: 'GET',
						url: `${assetUrl}/versions/{{ $parameter["assetVersionNumber"] }}`,
					},
				},
			},
			{
				name: 'List Asset Quotas (Beta)',
				value: 'list_asset_quotas',
				description: 'List the upload quotas for a user, such as the monthly audio upload limit',
				action: 'List asset quotas',
				routing: {
					request: {
						method: 'GET',
						url: '=/cloud/v2/users/{{ $parameter["userId"] }}/asset-quotas',
						qs: {
							maxPageSize: '={{ $parameter["asset_quota_query"].maxPageSize }}',
							pageToken: '={{ $parameter["asset_quota_query"].pageToken }}',
							filter: '={{ $parameter["asset_quota_query"].filter }}',
						},
					},
				},
			},
			{
				name: 'List Asset Versions (Beta)',
				value: 'list_asset_versions',
				description: 'List the versions of an asset',
				action: 'List asset versions',
				routing: {
					request: {
						method: 'GET',
						url: `${assetUrl}/versions`,
						qs: {
							maxPageSize: '={{ $parameter["asset_versions_query"].maxPageSize }}',
							pageToken: '={{ $parameter["asset_versions_query"].pageToken }}',
						},
					},
				},
			},
			{
				name: 'Restore Asset (Beta)',
				value: 'restore_asset',
				description: 'Restore an archived asset',
				action: 'Restore asset',
				routing: {
					request: {
						method: 'POST',
						url: `${assetUrl}:restore`,
					},
				},
			},
			{
				name: 'Rollback Asset Version (Beta)',
				value: 'rollback_asset_version',
				description: 'Roll an asset back to an earlier version',
				action: 'Rollback asset version',
				routing: {
					request: {
						method: 'POST',
						url: `${assetUrl}/versions:rollback`,
					},
					send: {
						preSend: [assetRollbackPreSend],
					},
				},
			},
			{
				name: 'Update Asset (Beta)',
				value: 'update_asset',
				description: 'Update the metadata of an asset, upload new content, or both',
				action: 'Update asset',
				routing: {
					request: {
						method: 'PATCH',
						url: assetUrl,
						qs: {
							updateMask: updateMaskExpression,
						},
					},
					send: {
						preSend: [assetMultipartPreSend],
					},
				},
			},
		],
		default: 'create_asset',
	},
];

const assetIdOperations = [
	'archive_asset',
	'get_asset',
	'get_asset_version',
	'list_asset_versions',
	'restore_asset',
	'rollback_asset_version',
	'update_asset',
];

export const assetFields: INodeProperties[] = [
	{
		displayName: 'Asset ID',
		name: 'assetId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: assetIdOperations,
			},
		},
	},
	{
		displayName: 'Version Number',
		name: 'assetVersionNumber',
		type: 'string',
		default: '',
		required: true,
		description: 'The asset version number',
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['get_asset_version', 'rollback_asset_version'],
			},
		},
	},
	{
		displayName: 'Operation ID',
		name: 'operationId',
		type: 'string',
		default: '',
		required: true,
		description: 'The operation ID returned by Create Asset or Update Asset',
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['get_asset_operation'],
			},
		},
	},
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		default: '',
		required: true,
		description: 'The user ID whose quotas to list',
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['list_asset_quotas'],
			},
		},
	},
	{
		displayName: 'Asset Type',
		name: 'assetType',
		type: 'options',
		options: [
			{ name: 'Animation', value: 'Animation' },
			{ name: 'Audio', value: 'Audio' },
			{ name: 'Decal', value: 'Decal' },
			{ name: 'Image', value: 'Image' },
			{ name: 'Mesh', value: 'Mesh' },
			{ name: 'Model', value: 'Model' },
			{ name: 'Video', value: 'Video' },
		],
		default: 'Decal',
		required: true,
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['create_asset'],
			},
		},
	},
	{
		displayName: 'Display Name',
		name: 'assetDisplayName',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['create_asset'],
			},
		},
	},
	{
		displayName: 'Description',
		name: 'assetDescription',
		type: 'string',
		typeOptions: {
			rows: 3,
		},
		default: '',
		description: 'Up to 1000 characters',
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['create_asset'],
			},
		},
	},
	{
		displayName: 'Creator Type',
		name: 'assetCreatorType',
		type: 'options',
		options: [
			{ name: 'User', value: 'user' },
			{ name: 'Group', value: 'group' },
		],
		default: 'user',
		description: 'Whether the asset is owned by a user or a group',
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['create_asset'],
			},
		},
	},
	{
		displayName: 'Creator ID',
		name: 'assetCreatorId',
		type: 'string',
		default: '',
		required: true,
		description: 'The user ID or group ID that will own the asset',
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['create_asset'],
			},
		},
	},
	{
		displayName: 'Options',
		name: 'assetCreateOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['create_asset'],
			},
		},
		options: [
			{
				displayName: 'Asset Privacy',
				name: 'assetPrivacy',
				type: 'options',
				options: [
					{ name: 'Default', value: 'default' },
					{ name: 'Restricted', value: 'restricted' },
					{ name: 'Open Use', value: 'openUse' },
				],
				default: 'default',
				description: 'Privacy setting for asset types that allow it',
			},
			{
				displayName: 'Expected Price (Robux)',
				name: 'expectedPrice',
				type: 'number',
				typeOptions: {
					minValue: 0,
				},
				default: 0,
				description:
					'The upload fee you expect to pay. The upload fails if the actual fee is higher.',
			},
		],
	},
	{
		displayName: 'Metadata (JSON)',
		name: 'assetUpdateJson',
		type: 'json',
		default: '{}',
		description:
			'Metadata fields to change, for example {"displayName": "New name", "description": "..."}. The update mask is built from these keys. Leave as {} to only replace the content.',
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['update_asset'],
			},
		},
	},
	{
		displayName: 'Upload New Content',
		name: 'assetUpdateContent',
		type: 'boolean',
		default: false,
		description: 'Whether to upload a new file as the next version of the asset',
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['update_asset'],
			},
		},
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		description: 'Name of the input binary field holding the file to upload (up to 20 MB)',
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['create_asset'],
			},
		},
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		description: 'Name of the input binary field holding the file to upload (up to 20 MB)',
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['update_asset'],
				assetUpdateContent: [true],
			},
		},
	},
	{
		displayName: 'Content Type Override',
		name: 'assetContentType',
		type: 'string',
		default: '',
		placeholder: 'model/fbx',
		description:
			"MIME type to send with the file. Leave empty to use the binary file's own MIME type. Roblox expects types such as image/png, audio/mpeg, model/fbx, model/x-rbxm, or video/mp4.",
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['create_asset', 'update_asset'],
			},
		},
	},
	{
		displayName: 'Read Mask',
		name: 'assetReadMask',
		type: 'string',
		default: '',
		placeholder: 'description,displayName,icon,previews',
		description: 'Comma-separated metadata fields to return. Leave empty for the default fields.',
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['get_asset'],
			},
		},
	},
	{
		displayName: 'Query Parameters',
		name: 'asset_versions_query',
		type: 'collection',
		default: {},
		description: "The request's query parameters",
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['list_asset_versions'],
			},
		},
		options: [
			{
				displayName: 'Max Page Size',
				name: 'maxPageSize',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 50,
				},
				default: 10,
				description: 'The number of versions to return',
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
		displayName: 'Query Parameters',
		name: 'asset_quota_query',
		type: 'collection',
		default: {},
		description: "The request's query parameters",
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['list_asset_quotas'],
			},
		},
		options: [
			{
				displayName: 'Filter',
				name: 'filter',
				type: 'string',
				default: '',
				placeholder: 'quotaType == RateLimitUpload && assetType == Audio',
				description: 'CEL filter on quotaType and assetType, using == and &&',
			},
			{
				displayName: 'Max Page Size',
				name: 'maxPageSize',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				description: 'The maximum number of quotas to return',
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
];
