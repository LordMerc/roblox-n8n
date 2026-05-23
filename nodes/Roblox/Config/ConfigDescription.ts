import type { INodeProperties } from 'n8n-workflow';

const configRepositoryUrl =
	'=/creator-configs-public-api/v1/configs/universes/{{ $parameter["universeId"] }}/repositories/{{ $parameter["repository"] }}';

const draftMutationBody = `={{ Object.assign(
	{ entries: JSON.parse($parameter["entriesJson"] || "{}") },
	$parameter["previousDraftHash"] ? { previousDraftHash: $parameter["previousDraftHash"] } : {}
) }}`;

export const configOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['config'],
			},
		},
		options: [
			{
				name: 'Get Config Draft',
				value: 'get_config_draft',
				description: 'Get the current draft config',
				action: 'Get config draft',
				routing: {
					request: {
						method: 'GET',
						url: `${configRepositoryUrl}/draft`,
					},
				},
			},
			{
				name: 'Get Config Full',
				value: 'get_config_full',
				description: 'Get the published config with metadata',
				action: 'Get config full',
				routing: {
					request: {
						method: 'GET',
						url: `${configRepositoryUrl}/full`,
					},
				},
			},
			{
				name: 'Get Config Values',
				value: 'get_config_values',
				description: 'Get published config values without metadata',
				action: 'Get config values',
				routing: {
					request: {
						method: 'GET',
						url: configRepositoryUrl,
					},
				},
			},
			{
				name: 'List Config Revisions',
				value: 'list_config_revisions',
				description: 'List config revision history',
				action: 'List config revisions',
				routing: {
					request: {
						method: 'GET',
						url: `${configRepositoryUrl}/revisions`,
						qs: {
							MaxPageSize: '={{ $parameter["config_revision_filters"].maxPageSize }}',
							Skip: '={{ $parameter["config_revision_filters"].skip }}',
							SearchKey: '={{ $parameter["config_revision_filters"].searchKey }}',
							SortOrder: '={{ $parameter["config_revision_filters"].sortOrder }}',
							SortKey: '={{ $parameter["config_revision_filters"].sortKey }}',
							startTime: '={{ $parameter["config_revision_filters"].startTime }}',
							endTime: '={{ $parameter["config_revision_filters"].endTime }}',
						},
					},
				},
			},
			{
				name: 'Overwrite Config Draft',
				value: 'overwrite_config_draft',
				description: 'Overwrite the entire draft with the request entries',
				action: 'Overwrite config draft',
				routing: {
					request: {
						method: 'PUT',
						url: `${configRepositoryUrl}/draft:overwrite`,
						body: draftMutationBody,
					},
				},
			},
			{
				name: 'Publish Config Draft',
				value: 'publish_config_draft',
				description: 'Publish draft config changes',
				action: 'Publish config draft',
				routing: {
					request: {
						method: 'POST',
						url: `${configRepositoryUrl}/publish`,
						body: `={{ Object.assign(
							{
								draftHash: $parameter["draftHash"],
								deploymentStrategy: $parameter["deploymentStrategy"],
							},
							$parameter["publishMessage"] ? { message: $parameter["publishMessage"] } : {}
						) }}`,
					},
				},
			},
			{
				name: 'Reset Config Draft',
				value: 'reset_config_draft',
				description: 'Reset or delete the current draft config',
				action: 'Reset config draft',
				routing: {
					request: {
						method: 'DELETE',
						url: `${configRepositoryUrl}/draft`,
					},
				},
			},
			{
				name: 'Restore Config Revision',
				value: 'restore_config_revision',
				description: 'Stage a revert to a previous config revision',
				action: 'Restore config revision',
				routing: {
					request: {
						method: 'POST',
						url: `${configRepositoryUrl}/revisions/{{ $parameter["revisionId"] }}/restore`,
					},
				},
			},
			{
				name: 'Update Config Draft',
				value: 'update_config_draft',
				description: 'Partially update the current draft config',
				action: 'Update config draft',
				routing: {
					request: {
						method: 'PATCH',
						url: `${configRepositoryUrl}/draft`,
						body: draftMutationBody,
					},
				},
			},
		],
		default: 'get_config_values',
	},
];

const configOperationsWithRepository = [
	'get_config_values',
	'get_config_full',
	'get_config_draft',
	'update_config_draft',
	'reset_config_draft',
	'overwrite_config_draft',
	'publish_config_draft',
	'list_config_revisions',
	'restore_config_revision',
];

export const configFields: INodeProperties[] = [
	{
		displayName: 'Universe ID',
		name: 'universeId',
		type: 'string',
		default: '',
		required: true,
		description: 'The Universe ID that owns the config repository',
		displayOptions: {
			show: {
				resource: ['config'],
				operation: configOperationsWithRepository,
			},
		},
	},
	{
		displayName: 'Repository',
		name: 'repository',
		type: 'string',
		default: 'InExperienceConfig',
		required: true,
		description: 'The config repository to read or mutate',
		displayOptions: {
			show: {
				resource: ['config'],
				operation: configOperationsWithRepository,
			},
		},
	},
	{
		displayName: 'Entries',
		name: 'entriesJson',
		type: 'json',
		default: '{}',
		required: true,
		description: 'The flat config entries object to stage in the draft',
		displayOptions: {
			show: {
				resource: ['config'],
				operation: ['update_config_draft', 'overwrite_config_draft'],
			},
		},
	},
	{
		displayName: 'Previous Draft Hash',
		name: 'previousDraftHash',
		type: 'string',
		default: '',
		description: 'Optional draft hash used for optimistic concurrency',
		displayOptions: {
			show: {
				resource: ['config'],
				operation: ['update_config_draft', 'overwrite_config_draft'],
			},
		},
	},
	{
		displayName: 'Draft Hash',
		name: 'draftHash',
		type: 'string',
		default: '',
		required: true,
		description: 'The draftHash returned by a draft read or write operation',
		displayOptions: {
			show: {
				resource: ['config'],
				operation: ['publish_config_draft'],
			},
		},
	},
	{
		displayName: 'Message',
		name: 'publishMessage',
		type: 'string',
		default: '',
		description: 'Optional message to store in config revision history',
		displayOptions: {
			show: {
				resource: ['config'],
				operation: ['publish_config_draft'],
			},
		},
	},
	{
		displayName: 'Deployment Strategy',
		name: 'deploymentStrategy',
		type: 'options',
		options: [
			{
				name: 'Immediate',
				value: 'Immediate',
			},
			{
				name: 'Gradual Rollout',
				value: 'GradualRollout',
			},
		],
		default: 'Immediate',
		required: true,
		description: 'How Roblox should deploy the published config',
		displayOptions: {
			show: {
				resource: ['config'],
				operation: ['publish_config_draft'],
			},
		},
	},
	{
		displayName: 'Revision ID',
		name: 'revisionId',
		type: 'string',
		default: '',
		required: true,
		description: 'The revision ID to restore',
		displayOptions: {
			show: {
				resource: ['config'],
				operation: ['restore_config_revision'],
			},
		},
	},
	{
		displayName: 'Query Parameters',
		name: 'config_revision_filters',
		default: {},
		type: 'collection',
		description: "The request's query parameters",
		displayOptions: {
			show: {
				resource: ['config'],
				operation: ['list_config_revisions'],
			},
		},
		options: [
			{
				displayName: 'End Time',
				name: 'endTime',
				type: 'dateTime',
				default: '',
				description: 'Only include revisions at or before this time',
			},
			{
				displayName: 'Max Page Size',
				name: 'maxPageSize',
				type: 'number',
				default: 10,
				description: 'Maximum number of revisions to return',
			},
			{
				displayName: 'Search Key',
				name: 'searchKey',
				type: 'string',
				default: '',
				description: 'Config key to search revisions for',
			},
			{
				displayName: 'Skip',
				name: 'skip',
				type: 'boolean',
				default: false,
				description: 'Whether to skip matching revisions',
			},
			{
				displayName: 'Sort Key',
				name: 'sortKey',
				type: 'string',
				default: '',
				description: 'Field to sort revisions by',
			},
			{
				displayName: 'Sort Order',
				name: 'sortOrder',
				type: 'options',
				options: [
					{
						name: 'Ascending',
						value: 'Asc',
					},
					{
						name: 'Descending',
						value: 'Desc',
					},
				],
				default: 'Desc',
				description: 'Revision sort order',
			},
			{
				displayName: 'Start Time',
				name: 'startTime',
				type: 'dateTime',
				default: '',
				description: 'Only include revisions at or after this time',
			},
		],
	},
];
