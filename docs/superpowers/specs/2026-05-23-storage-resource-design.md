# Roblox Cloud Storage Resource Design

## Goal

Add a new `Storage` resource to the existing `Roblox Cloud` n8n node that implements Roblox's recommended Cloud v2 storage endpoints from the Data and memory stores reference.

## Scope

The resource will include only the recommended `/cloud/v2/...` storage endpoints. It will not include endpoints from the docs' "Not Recommended" legacy section.

The implemented endpoint groups are:

- Standard data stores: list, delete, undelete, snapshot.
- Standard data store entries without an explicit scope path: list, create, get, update, delete, increment, list revisions.
- Standard data store entries with an explicit `scope_id` path: list, create, get, update, delete, increment, list revisions.
- Memory store queues: create item, read items, discard read items.
- Memory store sorted maps: list, create, get, update, delete items.
- Memory store flush: start flush and get flush operation.
- Ordered data store entries: list, create, get, update, delete, increment.

## Architecture

Create `nodes/Roblox/Storage/StorageDescription.ts` and export `storageOperations` and `storageFields`, matching the existing resource description pattern used by Config and Team Create. Import those exports into `nodes/Roblox/RobloxCloud.node.ts`, add `Storage` to the resource selector, and spread the new operation and field arrays into `properties`.

The node will continue to use the existing `RobloxCloudApi` credential and the existing request defaults with base URL `https://apis.roblox.com`.

## Operation Naming

Use explicit operation values to avoid ambiguity between scoped and unscoped data store entry endpoints:

- `list_data_stores`
- `delete_data_store`
- `undelete_data_store`
- `snapshot_data_stores`
- `list_data_store_entries`
- `create_data_store_entry`
- `get_data_store_entry`
- `update_data_store_entry`
- `delete_data_store_entry`
- `increment_data_store_entry`
- `list_data_store_entry_revisions`
- `list_scoped_data_store_entries`
- `create_scoped_data_store_entry`
- `get_scoped_data_store_entry`
- `update_scoped_data_store_entry`
- `delete_scoped_data_store_entry`
- `increment_scoped_data_store_entry`
- `list_scoped_data_store_entry_revisions`
- `create_memory_store_queue_item`
- `read_memory_store_queue_items`
- `discard_memory_store_queue_items`
- `list_memory_store_sorted_map_items`
- `create_memory_store_sorted_map_item`
- `get_memory_store_sorted_map_item`
- `update_memory_store_sorted_map_item`
- `delete_memory_store_sorted_map_item`
- `flush_memory_store`
- `get_memory_store_flush_operation`
- `list_ordered_data_store_entries`
- `create_ordered_data_store_entry`
- `get_ordered_data_store_entry`
- `update_ordered_data_store_entry`
- `delete_ordered_data_store_entry`
- `increment_ordered_data_store_entry`

## Field Model

Use shared fields where possible:

- `universeId` for all operations.
- `dataStoreId`, `entryId`, and optional `scopeId` for standard data store entry operations.
- `orderedDataStoreId`, `scopeId`, and `entryId` for ordered data store entry operations.
- `queueId` for memory store queue operations.
- `sortedMapId` and `itemId` for memory store sorted map operations.
- `operationId` for reading a memory store flush operation.

Query fields will be grouped in operation-specific collections:

- Standard data store list queries: `maxPageSize`, `pageToken`, `filter`, `showDeleted`.
- Entry creation queries: `id`.
- Update queries: `allowMissing`.
- Memory queue read queries: `count`, `allOrNothing`, `invisibilityWindow`.
- Memory and ordered list queries: `maxPageSize`, `pageToken`, `orderBy`, `filter`.

Request bodies will use JSON fields for arbitrary Roblox payloads:

- Data store entry body: `dataStoreEntryJson`.
- Increment data store entry body: `incrementDataStoreEntryJson`.
- Queue item body: `memoryStoreQueueItemJson`.
- Discard queue items body: `discardMemoryStoreQueueItemsJson`.
- Sorted map item body: `memoryStoreSortedMapItemJson`.
- Ordered data store entry body: `orderedDataStoreEntryJson`.
- Ordered increment body: `incrementOrderedDataStoreEntryJson`.

Empty request bodies for snapshot, undelete, and flush will be sent as `{}`.

## Data Flow

n8n evaluates the selected operation's declarative routing. Path parameters are inserted through Tournament expressions, query values come from the operation-specific collections, and JSON body fields are parsed with `JSON.parse($parameter["..."] || "{}")`.

The node returns Roblox's response body directly. Delete operations that return no content will preserve n8n's default handling for declarative request nodes.

## Error Handling

The implementation will rely on n8n's standard HTTP error handling for Roblox API errors. Required fields will be marked `required: true` so missing IDs are caught in the n8n UI before request execution where possible.

## Testing

Extend `tests/roblox-cloud-metadata.test.js` before implementation:

- Assert that the `Storage` resource exists.
- Assert that all expected storage operation values are registered.
- Assert representative HTTP methods for each endpoint family.
- Evaluate representative URLs with Tournament for standard data store, scoped data store, memory queue, memory sorted map, flush operation, and ordered data store paths.
- Assert representative query and body mappings, including JSON body expression strings.
- Assert composed request defaults still include `https://apis.roblox.com`, the API key header, and JSON accept headers.

Run `npm test` after each TDD cycle and before completion.

## Non-Goals

- Do not implement legacy not-recommended data store endpoints.
- Do not add new credentials.
- Do not build a generated OpenAPI client.
- Do not change existing user, config, team create, universe, place, group, or engine behavior.
