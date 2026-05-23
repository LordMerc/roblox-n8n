import type { INodeProperties } from 'n8n-workflow';

const storageBaseUrl = '=/cloud/v2/universes/{{ $parameter["universeId"] }}';
const dataStoresUrl = `${storageBaseUrl}/data-stores`;
const dataStoreUrl = `${dataStoresUrl}/{{ $parameter["dataStoreId"] }}`;
const dataStoreEntriesUrl = `${dataStoreUrl}/entries`;
const scopedDataStoreEntriesUrl = `${dataStoreUrl}/scopes/{{ $parameter["scopeId"] }}/entries`;
const memoryStoreUrl = `${storageBaseUrl}/memory-store`;
const memoryStoreQueueUrl = `${memoryStoreUrl}/queues/{{ $parameter["queueId"] }}`;
const memoryStoreSortedMapUrl = `${memoryStoreUrl}/sorted-maps/{{ $parameter["sortedMapId"] }}`;
const orderedDataStoreEntriesUrl =
	`${storageBaseUrl}/ordered-data-stores/{{ $parameter["orderedDataStoreId"] }}` +
	'/scopes/{{ $parameter["scopeId"] }}/entries';

const jsonBody = (parameterName: string): string =>
	`={{ JSON.parse($parameter["${parameterName}"] || "{}") }}`;

const dataStoreOperations: string[] = [
	'delete_data_store',
	'undelete_data_store',
	'list_data_store_entries',
	'create_data_store_entry',
	'get_data_store_entry',
	'update_data_store_entry',
	'delete_data_store_entry',
	'increment_data_store_entry',
	'list_data_store_entry_revisions',
	'list_scoped_data_store_entries',
	'create_scoped_data_store_entry',
	'get_scoped_data_store_entry',
	'update_scoped_data_store_entry',
	'delete_scoped_data_store_entry',
	'increment_scoped_data_store_entry',
	'list_scoped_data_store_entry_revisions',
];

const dataStoreEntryOperations: string[] = [
	'get_data_store_entry',
	'update_data_store_entry',
	'delete_data_store_entry',
	'increment_data_store_entry',
	'list_data_store_entry_revisions',
];

const scopedDataStoreOperations: string[] = [
	'list_scoped_data_store_entries',
	'create_scoped_data_store_entry',
	'get_scoped_data_store_entry',
	'update_scoped_data_store_entry',
	'delete_scoped_data_store_entry',
	'increment_scoped_data_store_entry',
	'list_scoped_data_store_entry_revisions',
];

const scopedDataStoreEntryOperations: string[] = [
	'get_scoped_data_store_entry',
	'update_scoped_data_store_entry',
	'delete_scoped_data_store_entry',
	'increment_scoped_data_store_entry',
	'list_scoped_data_store_entry_revisions',
];

const memoryStoreQueueOperations: string[] = [
	'create_memory_store_queue_item',
	'read_memory_store_queue_items',
	'discard_memory_store_queue_items',
];

const memoryStoreSortedMapOperations: string[] = [
	'list_memory_store_sorted_map_items',
	'create_memory_store_sorted_map_item',
	'get_memory_store_sorted_map_item',
	'update_memory_store_sorted_map_item',
	'delete_memory_store_sorted_map_item',
];

const memoryStoreSortedMapItemOperations: string[] = [
	'get_memory_store_sorted_map_item',
	'update_memory_store_sorted_map_item',
	'delete_memory_store_sorted_map_item',
];

const orderedDataStoreOperations: string[] = [
	'list_ordered_data_store_entries',
	'create_ordered_data_store_entry',
	'get_ordered_data_store_entry',
	'update_ordered_data_store_entry',
	'delete_ordered_data_store_entry',
	'increment_ordered_data_store_entry',
];

const orderedDataStoreEntryOperations: string[] = [
	'get_ordered_data_store_entry',
	'update_ordered_data_store_entry',
	'delete_ordered_data_store_entry',
	'increment_ordered_data_store_entry',
];

const storageOperationsWithUniverse: string[] = [
	'list_data_stores',
	'snapshot_data_stores',
	'flush_memory_store',
	'get_memory_store_flush_operation',
	...dataStoreOperations,
	...memoryStoreQueueOperations,
	...memoryStoreSortedMapOperations,
	...orderedDataStoreOperations,
];

export const storageOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['storage'],
			},
		},
		options: [
			{
				name: 'Create Data Store Entry',
				value: 'create_data_store_entry',
				description: 'Create a data store entry',
				action: 'Create data store entry',
				routing: {
					request: {
						method: 'POST',
						url: dataStoreEntriesUrl,
						qs: {
							id: '={{ $parameter["data_store_create_query"].id }}',
						},
						body: jsonBody('dataStoreEntryJson'),
					},
				},
			},
			{
				name: 'Create Memory Store Queue Item',
				value: 'create_memory_store_queue_item',
				description: 'Create a memory store queue item',
				action: 'Create memory store queue item',
				routing: {
					request: {
						method: 'POST',
						url: `${memoryStoreQueueUrl}/items`,
						body: jsonBody('memoryStoreQueueItemJson'),
					},
				},
			},
			{
				name: 'Create Memory Store Sorted Map Item',
				value: 'create_memory_store_sorted_map_item',
				description: 'Create a memory store sorted map item',
				action: 'Create memory store sorted map item',
				routing: {
					request: {
						method: 'POST',
						url: `${memoryStoreSortedMapUrl}/items`,
						qs: {
							id: '={{ $parameter["memory_store_sorted_map_create_query"].id }}',
						},
						body: jsonBody('memoryStoreSortedMapItemJson'),
					},
				},
			},
			{
				name: 'Create Ordered Data Store Entry',
				value: 'create_ordered_data_store_entry',
				description: 'Create an ordered data store entry',
				action: 'Create ordered data store entry',
				routing: {
					request: {
						method: 'POST',
						url: orderedDataStoreEntriesUrl,
						qs: {
							id: '={{ $parameter["ordered_data_store_create_query"].id }}',
						},
						body: jsonBody('orderedDataStoreEntryJson'),
					},
				},
			},
			{
				name: 'Create Scoped Data Store Entry',
				value: 'create_scoped_data_store_entry',
				description: 'Create a data store entry in a scope',
				action: 'Create scoped data store entry',
				routing: {
					request: {
						method: 'POST',
						url: scopedDataStoreEntriesUrl,
						qs: {
							id: '={{ $parameter["data_store_create_query"].id }}',
						},
						body: jsonBody('dataStoreEntryJson'),
					},
				},
			},
			{
				name: 'Delete Data Store',
				value: 'delete_data_store',
				description: 'Delete a data store',
				action: 'Delete data store',
				routing: {
					request: {
						method: 'DELETE',
						url: dataStoreUrl,
					},
				},
			},
			{
				name: 'Delete Data Store Entry',
				value: 'delete_data_store_entry',
				description: 'Delete a data store entry',
				action: 'Delete data store entry',
				routing: {
					request: {
						method: 'DELETE',
						url: `${dataStoreEntriesUrl}/{{ $parameter["entryId"] }}`,
					},
				},
			},
			{
				name: 'Delete Memory Store Sorted Map Item',
				value: 'delete_memory_store_sorted_map_item',
				description: 'Delete a memory store sorted map item',
				action: 'Delete memory store sorted map item',
				routing: {
					request: {
						method: 'DELETE',
						url: `${memoryStoreSortedMapUrl}/items/{{ $parameter["itemId"] }}`,
					},
				},
			},
			{
				name: 'Delete Ordered Data Store Entry',
				value: 'delete_ordered_data_store_entry',
				description: 'Delete an ordered data store entry',
				action: 'Delete ordered data store entry',
				routing: {
					request: {
						method: 'DELETE',
						url: `${orderedDataStoreEntriesUrl}/{{ $parameter["entryId"] }}`,
					},
				},
			},
			{
				name: 'Delete Scoped Data Store Entry',
				value: 'delete_scoped_data_store_entry',
				description: 'Delete a data store entry in a scope',
				action: 'Delete scoped data store entry',
				routing: {
					request: {
						method: 'DELETE',
						url: `${scopedDataStoreEntriesUrl}/{{ $parameter["entryId"] }}`,
					},
				},
			},
			{
				name: 'Discard Memory Store Queue Items',
				value: 'discard_memory_store_queue_items',
				description: 'Discard previously read memory store queue items',
				action: 'Discard memory store queue items',
				routing: {
					request: {
						method: 'POST',
						url: `${memoryStoreQueueUrl}/items:discard`,
						body: jsonBody('discardMemoryStoreQueueItemsJson'),
					},
				},
			},
			{
				name: 'Flush Memory Store',
				value: 'flush_memory_store',
				description: 'Flush memory stores for a universe',
				action: 'Flush memory store',
				routing: {
					request: {
						method: 'POST',
						url: `${memoryStoreUrl}:flush`,
						body: {},
					},
				},
			},
			{
				name: 'Get Data Store Entry',
				value: 'get_data_store_entry',
				description: 'Get a data store entry',
				action: 'Get data store entry',
				routing: {
					request: {
						method: 'GET',
						url: `${dataStoreEntriesUrl}/{{ $parameter["entryId"] }}`,
					},
				},
			},
			{
				name: 'Get Memory Store Flush Operation',
				value: 'get_memory_store_flush_operation',
				description: 'Get a memory store flush operation',
				action: 'Get memory store flush operation',
				routing: {
					request: {
						method: 'GET',
						url: `${memoryStoreUrl}/operations/{{ $parameter["operationId"] }}`,
					},
				},
			},
			{
				name: 'Get Memory Store Sorted Map Item',
				value: 'get_memory_store_sorted_map_item',
				description: 'Get a memory store sorted map item',
				action: 'Get memory store sorted map item',
				routing: {
					request: {
						method: 'GET',
						url: `${memoryStoreSortedMapUrl}/items/{{ $parameter["itemId"] }}`,
					},
				},
			},
			{
				name: 'Get Ordered Data Store Entry',
				value: 'get_ordered_data_store_entry',
				description: 'Get an ordered data store entry',
				action: 'Get ordered data store entry',
				routing: {
					request: {
						method: 'GET',
						url: `${orderedDataStoreEntriesUrl}/{{ $parameter["entryId"] }}`,
					},
				},
			},
			{
				name: 'Get Scoped Data Store Entry',
				value: 'get_scoped_data_store_entry',
				description: 'Get a data store entry in a scope',
				action: 'Get scoped data store entry',
				routing: {
					request: {
						method: 'GET',
						url: `${scopedDataStoreEntriesUrl}/{{ $parameter["entryId"] }}`,
					},
				},
			},
			{
				name: 'Increment Data Store Entry',
				value: 'increment_data_store_entry',
				description: 'Increment a data store entry value',
				action: 'Increment data store entry',
				routing: {
					request: {
						method: 'POST',
						url: `${dataStoreEntriesUrl}/{{ $parameter["entryId"] }}:increment`,
						body: jsonBody('incrementDataStoreEntryJson'),
					},
				},
			},
			{
				name: 'Increment Ordered Data Store Entry',
				value: 'increment_ordered_data_store_entry',
				description: 'Increment an ordered data store entry value',
				action: 'Increment ordered data store entry',
				routing: {
					request: {
						method: 'POST',
						url: `${orderedDataStoreEntriesUrl}/{{ $parameter["entryId"] }}:increment`,
						body: jsonBody('incrementOrderedDataStoreEntryJson'),
					},
				},
			},
			{
				name: 'Increment Scoped Data Store Entry',
				value: 'increment_scoped_data_store_entry',
				description: 'Increment a scoped data store entry value',
				action: 'Increment scoped data store entry',
				routing: {
					request: {
						method: 'POST',
						url: `${scopedDataStoreEntriesUrl}/{{ $parameter["entryId"] }}:increment`,
						body: jsonBody('incrementDataStoreEntryJson'),
					},
				},
			},
			{
				name: 'List Data Store Entries',
				value: 'list_data_store_entries',
				action: 'List data store entries',
				routing: {
					request: {
						method: 'GET',
						url: dataStoreEntriesUrl,
						qs: {
							maxPageSize: '={{ $parameter["data_store_list_query"].maxPageSize }}',
							pageToken: '={{ $parameter["data_store_list_query"].pageToken }}',
							filter: '={{ $parameter["data_store_list_query"].filter }}',
							showDeleted: '={{ $parameter["data_store_list_query"].showDeleted }}',
						},
					},
				},
			},
			{
				name: 'List Data Store Entry Revisions',
				value: 'list_data_store_entry_revisions',
				action: 'List data store entry revisions',
				routing: {
					request: {
						method: 'GET',
						url: `${dataStoreEntriesUrl}/{{ $parameter["entryId"] }}:listRevisions`,
						qs: {
							maxPageSize: '={{ $parameter["data_store_revision_query"].maxPageSize }}',
							pageToken: '={{ $parameter["data_store_revision_query"].pageToken }}',
							filter: '={{ $parameter["data_store_revision_query"].filter }}',
						},
					},
				},
			},
			{
				name: 'List Data Stores',
				value: 'list_data_stores',
				description: 'List data stores in a universe',
				action: 'List data stores',
				routing: {
					request: {
						method: 'GET',
						url: dataStoresUrl,
						qs: {
							maxPageSize: '={{ $parameter["data_store_list_query"].maxPageSize }}',
							pageToken: '={{ $parameter["data_store_list_query"].pageToken }}',
							filter: '={{ $parameter["data_store_list_query"].filter }}',
							showDeleted: '={{ $parameter["data_store_list_query"].showDeleted }}',
						},
					},
				},
			},
			{
				name: 'List Memory Store Sorted Map Items',
				value: 'list_memory_store_sorted_map_items',
				action: 'List memory store sorted map items',
				routing: {
					request: {
						method: 'GET',
						url: `${memoryStoreSortedMapUrl}/items`,
						qs: {
							maxPageSize: '={{ $parameter["memory_store_sorted_map_list_query"].maxPageSize }}',
							pageToken: '={{ $parameter["memory_store_sorted_map_list_query"].pageToken }}',
							orderBy: '={{ $parameter["memory_store_sorted_map_list_query"].orderBy }}',
							filter: '={{ $parameter["memory_store_sorted_map_list_query"].filter }}',
						},
					},
				},
			},
			{
				name: 'List Ordered Data Store Entries',
				value: 'list_ordered_data_store_entries',
				action: 'List ordered data store entries',
				routing: {
					request: {
						method: 'GET',
						url: orderedDataStoreEntriesUrl,
						qs: {
							maxPageSize: '={{ $parameter["ordered_data_store_list_query"].maxPageSize }}',
							pageToken: '={{ $parameter["ordered_data_store_list_query"].pageToken }}',
							orderBy: '={{ $parameter["ordered_data_store_list_query"].orderBy }}',
							filter: '={{ $parameter["ordered_data_store_list_query"].filter }}',
						},
					},
				},
			},
			{
				name: 'List Scoped Data Store Entries',
				value: 'list_scoped_data_store_entries',
				description: 'List data store entries in a scope',
				action: 'List scoped data store entries',
				routing: {
					request: {
						method: 'GET',
						url: scopedDataStoreEntriesUrl,
						qs: {
							maxPageSize: '={{ $parameter["data_store_list_query"].maxPageSize }}',
							pageToken: '={{ $parameter["data_store_list_query"].pageToken }}',
							filter: '={{ $parameter["data_store_list_query"].filter }}',
							showDeleted: '={{ $parameter["data_store_list_query"].showDeleted }}',
						},
					},
				},
			},
			{
				name: 'List Scoped Data Store Entry Revisions',
				value: 'list_scoped_data_store_entry_revisions',
				action: 'List scoped data store entry revisions',
				routing: {
					request: {
						method: 'GET',
						url: `${scopedDataStoreEntriesUrl}/{{ $parameter["entryId"] }}:listRevisions`,
						qs: {
							maxPageSize: '={{ $parameter["data_store_revision_query"].maxPageSize }}',
							pageToken: '={{ $parameter["data_store_revision_query"].pageToken }}',
							filter: '={{ $parameter["data_store_revision_query"].filter }}',
						},
					},
				},
			},
			{
				name: 'Read Memory Store Queue Items',
				value: 'read_memory_store_queue_items',
				action: 'Read memory store queue items',
				routing: {
					request: {
						method: 'GET',
						url: `${memoryStoreQueueUrl}/items:read`,
						qs: {
							count: '={{ $parameter["memory_store_queue_read_query"].count }}',
							allOrNothing: '={{ $parameter["memory_store_queue_read_query"].allOrNothing }}',
							invisibilityWindow:
								'={{ $parameter["memory_store_queue_read_query"].invisibilityWindow }}',
						},
					},
				},
			},
			{
				name: 'Snapshot Data Stores',
				value: 'snapshot_data_stores',
				description: 'Snapshot data stores in a universe',
				action: 'Snapshot data stores',
				routing: {
					request: {
						method: 'POST',
						url: `${dataStoresUrl}:snapshot`,
						body: {},
					},
				},
			},
			{
				name: 'Undelete Data Store',
				value: 'undelete_data_store',
				description: 'Undelete a data store',
				action: 'Undelete data store',
				routing: {
					request: {
						method: 'POST',
						url: `${dataStoreUrl}:undelete`,
						body: {},
					},
				},
			},
			{
				name: 'Update Data Store Entry',
				value: 'update_data_store_entry',
				description: 'Update a data store entry',
				action: 'Update data store entry',
				routing: {
					request: {
						method: 'PATCH',
						url: `${dataStoreEntriesUrl}/{{ $parameter["entryId"] }}`,
						qs: {
							allowMissing: '={{ $parameter["data_store_update_query"].allowMissing }}',
						},
						body: jsonBody('dataStoreEntryJson'),
					},
				},
			},
			{
				name: 'Update Memory Store Sorted Map Item',
				value: 'update_memory_store_sorted_map_item',
				description: 'Update a memory store sorted map item',
				action: 'Update memory store sorted map item',
				routing: {
					request: {
						method: 'PATCH',
						url: `${memoryStoreSortedMapUrl}/items/{{ $parameter["itemId"] }}`,
						qs: {
							allowMissing:
								'={{ $parameter["memory_store_sorted_map_update_query"].allowMissing }}',
						},
						body: jsonBody('memoryStoreSortedMapItemJson'),
					},
				},
			},
			{
				name: 'Update Ordered Data Store Entry',
				value: 'update_ordered_data_store_entry',
				description: 'Update an ordered data store entry',
				action: 'Update ordered data store entry',
				routing: {
					request: {
						method: 'PATCH',
						url: `${orderedDataStoreEntriesUrl}/{{ $parameter["entryId"] }}`,
						qs: {
							allowMissing: '={{ $parameter["ordered_data_store_update_query"].allowMissing }}',
						},
						body: jsonBody('orderedDataStoreEntryJson'),
					},
				},
			},
			{
				name: 'Update Scoped Data Store Entry',
				value: 'update_scoped_data_store_entry',
				description: 'Update a data store entry in a scope',
				action: 'Update scoped data store entry',
				routing: {
					request: {
						method: 'PATCH',
						url: `${scopedDataStoreEntriesUrl}/{{ $parameter["entryId"] }}`,
						qs: {
							allowMissing: '={{ $parameter["data_store_update_query"].allowMissing }}',
						},
						body: jsonBody('dataStoreEntryJson'),
					},
				},
			},
		],
		default: 'list_data_stores',
	},
];

export const storageFields: INodeProperties[] = [
	{
		displayName: 'Universe ID',
		name: 'universeId',
		type: 'string',
		default: '',
		required: true,
		description: 'The universe ID that owns the storage resource',
		displayOptions: {
			show: {
				resource: ['storage'],
				operation: storageOperationsWithUniverse,
			},
		},
	},
	{
		displayName: 'Data Store ID',
		name: 'dataStoreId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['storage'],
				operation: dataStoreOperations,
			},
		},
	},
	{
		displayName: 'Scope ID',
		name: 'scopeId',
		type: 'string',
		default: '',
		required: true,
		description: 'The data store or ordered data store scope ID',
		displayOptions: {
			show: {
				resource: ['storage'],
				operation: [...scopedDataStoreOperations, ...orderedDataStoreOperations],
			},
		},
	},
	{
		displayName: 'Entry ID',
		name: 'entryId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['storage'],
				operation: [
					...dataStoreEntryOperations,
					...scopedDataStoreEntryOperations,
					...orderedDataStoreEntryOperations,
				],
			},
		},
	},
	{
		displayName: 'Queue ID',
		name: 'queueId',
		type: 'string',
		default: '',
		required: true,
		description: 'The memory store queue ID',
		displayOptions: {
			show: {
				resource: ['storage'],
				operation: memoryStoreQueueOperations,
			},
		},
	},
	{
		displayName: 'Sorted Map ID',
		name: 'sortedMapId',
		type: 'string',
		default: '',
		required: true,
		description: 'The memory store sorted map ID',
		displayOptions: {
			show: {
				resource: ['storage'],
				operation: memoryStoreSortedMapOperations,
			},
		},
	},
	{
		displayName: 'Item ID',
		name: 'itemId',
		type: 'string',
		default: '',
		required: true,
		description: 'The memory store sorted map item ID',
		displayOptions: {
			show: {
				resource: ['storage'],
				operation: memoryStoreSortedMapItemOperations,
			},
		},
	},
	{
		displayName: 'Ordered Data Store ID',
		name: 'orderedDataStoreId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['storage'],
				operation: orderedDataStoreOperations,
			},
		},
	},
	{
		displayName: 'Operation ID',
		name: 'operationId',
		type: 'string',
		default: '',
		required: true,
		description: 'The memory store flush operation ID',
		displayOptions: {
			show: {
				resource: ['storage'],
				operation: ['get_memory_store_flush_operation'],
			},
		},
	},
	{
		displayName: 'Query Parameters',
		name: 'data_store_list_query',
		default: {},
		type: 'collection',
		description: "The request's query parameters",
		displayOptions: {
			show: {
				resource: ['storage'],
				operation: [
					'list_data_stores',
					'list_data_store_entries',
					'list_scoped_data_store_entries',
				],
			},
		},
		options: [
			{
				displayName: 'Filter',
				name: 'filter',
				type: 'string',
				default: '',
				description: 'Filter expression for returned resources',
			},
			{
				displayName: 'Max Page Size',
				name: 'maxPageSize',
				type: 'number',
				default: 10,
				description: 'Maximum number of results to return',
			},
			{
				displayName: 'Page Token',
				name: 'pageToken',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'Page token from a previous response',
			},
			{
				displayName: 'Show Deleted',
				name: 'showDeleted',
				type: 'boolean',
				default: false,
				description: 'Whether to include deleted resources',
			},
		],
	},
	{
		displayName: 'Query Parameters',
		name: 'data_store_revision_query',
		default: {},
		type: 'collection',
		description: "The request's query parameters",
		displayOptions: {
			show: {
				resource: ['storage'],
				operation: ['list_data_store_entry_revisions', 'list_scoped_data_store_entry_revisions'],
			},
		},
		options: [
			{
				displayName: 'Filter',
				name: 'filter',
				type: 'string',
				default: '',
				description: 'Filter expression for returned revisions',
			},
			{
				displayName: 'Max Page Size',
				name: 'maxPageSize',
				type: 'number',
				default: 10,
				description: 'Maximum number of revisions to return',
			},
			{
				displayName: 'Page Token',
				name: 'pageToken',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'Page token from a previous response',
			},
		],
	},
	{
		displayName: 'Query Parameters',
		name: 'data_store_create_query',
		default: {},
		type: 'collection',
		description: "The request's query parameters",
		displayOptions: {
			show: {
				resource: ['storage'],
				operation: ['create_data_store_entry', 'create_scoped_data_store_entry'],
			},
		},
		options: [
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				default: '',
				description: 'The entry ID to create',
			},
		],
	},
	{
		displayName: 'Update Fields',
		name: 'data_store_update_query',
		default: {},
		type: 'collection',
		description: "The request's query parameters",
		displayOptions: {
			show: {
				resource: ['storage'],
				operation: ['update_data_store_entry', 'update_scoped_data_store_entry'],
			},
		},
		options: [
			{
				displayName: 'Allow Missing',
				name: 'allowMissing',
				type: 'boolean',
				default: false,
				description: 'Whether to create the entry if it does not exist',
			},
		],
	},
	{
		displayName: 'Data Store Entry',
		name: 'dataStoreEntryJson',
		type: 'json',
		default: '{"value":{}}',
		required: true,
		description: 'The data store entry JSON body',
		displayOptions: {
			show: {
				resource: ['storage'],
				operation: [
					'create_data_store_entry',
					'update_data_store_entry',
					'create_scoped_data_store_entry',
					'update_scoped_data_store_entry',
				],
			},
		},
	},
	{
		displayName: 'Increment Data Store Entry',
		name: 'incrementDataStoreEntryJson',
		type: 'json',
		default: '{"amount":1}',
		required: true,
		description: 'The increment data store entry JSON body',
		displayOptions: {
			show: {
				resource: ['storage'],
				operation: ['increment_data_store_entry', 'increment_scoped_data_store_entry'],
			},
		},
	},
	{
		displayName: 'Memory Store Queue Item',
		name: 'memoryStoreQueueItemJson',
		type: 'json',
		default: '{"data":{},"priority":0,"ttl":"30s"}',
		required: true,
		description: 'The memory store queue item JSON body',
		displayOptions: {
			show: {
				resource: ['storage'],
				operation: ['create_memory_store_queue_item'],
			},
		},
	},
	{
		displayName: 'Query Parameters',
		name: 'memory_store_queue_read_query',
		default: {},
		type: 'collection',
		description: "The request's query parameters",
		displayOptions: {
			show: {
				resource: ['storage'],
				operation: ['read_memory_store_queue_items'],
			},
		},
		options: [
			{
				displayName: 'All Or Nothing',
				name: 'allOrNothing',
				type: 'boolean',
				default: false,
				description: 'Whether the read should fail unless all requested items are available',
			},
			{
				displayName: 'Count',
				name: 'count',
				type: 'number',
				default: 1,
				description: 'Number of queue items to read',
			},
			{
				displayName: 'Invisibility Window',
				name: 'invisibilityWindow',
				type: 'string',
				default: '30s',
				description: 'How long read items stay invisible before discard',
			},
		],
	},
	{
		displayName: 'Discard Memory Store Queue Items',
		name: 'discardMemoryStoreQueueItemsJson',
		type: 'json',
		default: '{"readId":""}',
		required: true,
		description: 'The discard memory store queue items JSON body',
		displayOptions: {
			show: {
				resource: ['storage'],
				operation: ['discard_memory_store_queue_items'],
			},
		},
	},
	{
		displayName: 'Query Parameters',
		name: 'memory_store_sorted_map_list_query',
		default: {},
		type: 'collection',
		description: "The request's query parameters",
		displayOptions: {
			show: {
				resource: ['storage'],
				operation: ['list_memory_store_sorted_map_items'],
			},
		},
		options: [
			{
				displayName: 'Filter',
				name: 'filter',
				type: 'string',
				default: '',
				description: 'Filter expression for returned sorted map items',
			},
			{
				displayName: 'Max Page Size',
				name: 'maxPageSize',
				type: 'number',
				default: 10,
				description: 'Maximum number of sorted map items to return',
			},
			{
				displayName: 'Order By',
				name: 'orderBy',
				type: 'string',
				default: '',
				description: 'Sort order for returned sorted map items',
			},
			{
				displayName: 'Page Token',
				name: 'pageToken',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'Page token from a previous response',
			},
		],
	},
	{
		displayName: 'Query Parameters',
		name: 'memory_store_sorted_map_create_query',
		default: {},
		type: 'collection',
		description: "The request's query parameters",
		displayOptions: {
			show: {
				resource: ['storage'],
				operation: ['create_memory_store_sorted_map_item'],
			},
		},
		options: [
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				default: '',
				description: 'The sorted map item ID to create',
			},
		],
	},
	{
		displayName: 'Update Fields',
		name: 'memory_store_sorted_map_update_query',
		default: {},
		type: 'collection',
		description: "The request's query parameters",
		displayOptions: {
			show: {
				resource: ['storage'],
				operation: ['update_memory_store_sorted_map_item'],
			},
		},
		options: [
			{
				displayName: 'Allow Missing',
				name: 'allowMissing',
				type: 'boolean',
				default: false,
				description: 'Whether to create the sorted map item if it does not exist',
			},
		],
	},
	{
		displayName: 'Memory Store Sorted Map Item',
		name: 'memoryStoreSortedMapItemJson',
		type: 'json',
		default: '{"value":{},"ttl":"30s"}',
		required: true,
		description: 'The memory store sorted map item JSON body',
		displayOptions: {
			show: {
				resource: ['storage'],
				operation: ['create_memory_store_sorted_map_item', 'update_memory_store_sorted_map_item'],
			},
		},
	},
	{
		displayName: 'Query Parameters',
		name: 'ordered_data_store_list_query',
		default: {},
		type: 'collection',
		description: "The request's query parameters",
		displayOptions: {
			show: {
				resource: ['storage'],
				operation: ['list_ordered_data_store_entries'],
			},
		},
		options: [
			{
				displayName: 'Filter',
				name: 'filter',
				type: 'string',
				default: '',
				description: 'Filter expression for returned ordered data store entries',
			},
			{
				displayName: 'Max Page Size',
				name: 'maxPageSize',
				type: 'number',
				default: 10,
				description: 'Maximum number of ordered data store entries to return',
			},
			{
				displayName: 'Order By',
				name: 'orderBy',
				type: 'string',
				default: '',
				description: 'Sort order for returned ordered data store entries',
			},
			{
				displayName: 'Page Token',
				name: 'pageToken',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'Page token from a previous response',
			},
		],
	},
	{
		displayName: 'Query Parameters',
		name: 'ordered_data_store_create_query',
		default: {},
		type: 'collection',
		description: "The request's query parameters",
		displayOptions: {
			show: {
				resource: ['storage'],
				operation: ['create_ordered_data_store_entry'],
			},
		},
		options: [
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				default: '',
				description: 'The ordered data store entry ID to create',
			},
		],
	},
	{
		displayName: 'Update Fields',
		name: 'ordered_data_store_update_query',
		default: {},
		type: 'collection',
		description: "The request's query parameters",
		displayOptions: {
			show: {
				resource: ['storage'],
				operation: ['update_ordered_data_store_entry'],
			},
		},
		options: [
			{
				displayName: 'Allow Missing',
				name: 'allowMissing',
				type: 'boolean',
				default: false,
				description: 'Whether to create the ordered data store entry if it does not exist',
			},
		],
	},
	{
		displayName: 'Ordered Data Store Entry',
		name: 'orderedDataStoreEntryJson',
		type: 'json',
		default: '{"value":0}',
		required: true,
		description: 'The ordered data store entry JSON body',
		displayOptions: {
			show: {
				resource: ['storage'],
				operation: ['create_ordered_data_store_entry', 'update_ordered_data_store_entry'],
			},
		},
	},
	{
		displayName: 'Increment Ordered Data Store Entry',
		name: 'incrementOrderedDataStoreEntryJson',
		type: 'json',
		default: '{"amount":1}',
		required: true,
		description: 'The increment ordered data store entry JSON body',
		displayOptions: {
			show: {
				resource: ['storage'],
				operation: ['increment_ordered_data_store_entry'],
			},
		},
	},
];
