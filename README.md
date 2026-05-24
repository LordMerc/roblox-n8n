![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# n8n-nodes-roblox

This project provides custom community nodes for [n8n](https://n8n.io) that integrate with the [Roblox Open Cloud API](https://create.roblox.com/docs/cloud). It allows you to connect your Roblox experience with automated workflows in n8n — including data access, place publishing, messaging, and more.

## Features

- Community node package for n8n
- Built-in authentication with Open Cloud API keys
- Modular support for Roblox API endpoints
- Example nodes for querying and automating Roblox experiences
- Configs Open Cloud support for reading, staging, publishing, and restoring experience configs
- User subscription lookup support for subscription products
- Team Create Open Cloud support for settings, active sessions, team test shutdowns, and membership removal
- Storage Open Cloud support for data stores, memory store queues, memory store sorted maps, memory store flush operations, and ordered data stores
- Luau Execution Open Cloud support for creating tasks, polling task state, reading logs, and creating binary inputs
- Group Forum Open Cloud support for listing forum categories, posts, and comments

> ✅ Ideal for developers using Roblox + automation tools like n8n to build dashboards, pipelines, and custom tools.

## Current Nodes and Arguments

- `Roblox Cloud`
  - `Config`: operations `get_config_values`, `get_config_full`, `get_config_draft`, `update_config_draft`, `reset_config_draft`, `overwrite_config_draft`, `publish_config_draft`, `list_config_revisions`, `restore_config_revision`. Arguments: `universeId`, `repository`, `entriesJson`, `previousDraftHash`, `draftHash`, `publishMessage`, `deploymentStrategy`, `revisionId`, `config_revision_filters` (`endTime`, `maxPageSize`, `searchKey`, `skip`, `sortKey`, `sortOrder`, `startTime`).
  - `Engine`: operation `get_operation`. Arguments: `operationPath`.
  - `Group`: operations `accept_join_request`, `assign_member_role`, `ban_user`, `decline_join_request`, `get_audit_log`, `get_group`, `get_group_policies`, `get_join_requests`, `get_manageable_groups`, `get_memberships`, `get_pending_groups`, `get_role`, `get_roles`, `get_settings`, `list_forum_categories`, `list_forum_comments`, `list_forum_posts`, `unassign_member_role`, `unban_user`, `update_description`, `update_member_role`, `update_notification_preference`, `update_settings`. Arguments: `groupId`, `joinRequestId`, `membershipId`, `forumCategoryId`, `postId`, `userId`, `roleId`, `description`, `groupPolicyGroupIds`, `arguments_memberships` (`maxPageSize`, `pageToken`, `filter`), `group_join_requests_query` (`maxPageSize`, `pageToken`, `filter`), `group_roles_query` (`maxPageSize`, `pageToken`), `group_forum_categories_query` (`maxPageSize`, `pageToken`, `filter`), `group_forum_posts_query` (`maxPageSize`, `pageToken`, `filter`, `view`), `group_forum_comments_query` (`maxPageSize`, `pageToken`, `filter`), `group_audit_log_query` (`actionType`, `userId`, `limit`, `cursor`, `sortOrder`), `group_settings_update`, and `group_notification_preference`.
  - `Luau Execution`: operations `create_session_task_binary_input`, `create_session_task`, `create_session_task_for_version`, `get_session_task`, `list_session_task_logs`. Arguments: `universeId`, `placeId`, `versionId`, `luauExecutionSessionId`, `taskId`, `binaryInputSize`, `script`, `timeout`, `binaryInput`, `enableBinaryOutput`, `luauExecutionTaskView`, `luau_execution_task_logs_query` (`maxPageSize`, `pageToken`, `view`).
  - `Place`: operations `get_place`, `update_place`. Arguments: `universeId`, `placeId`, `place_update_mask` (`displayName`, `description`, `serverSize`).
  - `Storage`: operations include data store control (`list_data_stores`, `delete_data_store`, `undelete_data_store`, `snapshot_data_stores`), data store entries and scoped entries (`list`, `get`, `create`, `update`, `delete`, `increment`, `list revisions`), memory store queues (`create`, `read`, `discard`), memory store sorted maps (`list`, `get`, `create`, `update`, `delete`), memory store flush (`flush_memory_store`, `get_memory_store_flush_operation`), and ordered data store entries (`list`, `get`, `create`, `update`, `delete`, `increment`). Arguments: `universeId`, `dataStoreId`, `scopeId`, `entryId`, `queueId`, `sortedMapId`, `itemId`, `orderedDataStoreId`, `operationId`, `dataStoreEntryJson`, `incrementDataStoreEntryJson`, `memoryStoreQueueItemJson`, `discardMemoryStoreQueueItemsJson`, `memoryStoreSortedMapItemJson`, `orderedDataStoreEntryJson`, `incrementOrderedDataStoreEntryJson`, query/update collections for list, create, read, and update operations (`filter`, `maxPageSize`, `pageToken`, `showDeleted`, `id`, `allowMissing`, `allOrNothing`, `count`, `invisibilityWindow`, `orderBy`).
  - `Team Create`: operations `close_team_test_session`, `get_active_session_members`, `get_many_team_create_settings`, `get_team_create_settings`, `remove_team_create_membership`, `update_team_create_settings`. Arguments: `placeId`, `gameId`, `team_create_pagination` (`cursor`, `limit`), `universeId`, `isEnabled`, `userId`, `universeIds`.
  - `Universe`: operations `generate_speech_asset`, `get_universe`, `get_user_restriction_universe`, `get_user_restrictions_universe`, `list_user_restriction_logs`, `publish_universe_message`, `restart_universe_servers`, `update_user_restriction_universe`. Arguments: `universeId`, `topic`, `message`, `userId`, `arguments_list_user_restriction_logs` (`pageToken`, `maxPageSize`), `speechText`, `speechStyleFields` (`pitch`, `speed`, `voiceId`), `restriction_update_mask` (`active`, `displayReason`, `duration`, `excludeAltAccounts`, `privateReason`).
  - `User`: operations `generate_thumbnail`, `get_subscription`, `get_user`. Arguments: `userId`, `universeId`, `subscriptionProductId`, `subscriptionId`, `view`, `arguments_thumbnail_generation` (`size`, `format`, `shape`).
- `Roblox Legacy`
  - `Legacy Place`: operations `get_favorites_count`, `get_universe_products`. Arguments: `universeId`, `universeIds`.
  - `Legacy User`: operations `get_username_history`, `get_usernames_from_user_ids`. Arguments: `userId`, `arguments_username_history` (`limit`, `cursor`, `sortOrder`), `arguments_user_names_from_user_ids` (`userIds`, `excludeBannedUsers`).
- `Roblox Cloud Trigger`
  - Events: `Group Audit Log Entry`, `Group Join Request`. Arguments: `eventType`, `groupId`, audit-log filters `actionType`, `userId`, `limit`, and join-request page size `maxPageSize`.

## Group API Scopes

The Group resource uses the existing Roblox Cloud API key credential. Group Forum category, post, and comment list operations require `group-forum:read`. Join request reads require `group:read`; accepting and declining join requests, updating group memberships, assigning roles, and unassigning roles require `group:write`. Listing or getting roles can use `group:read` to include non-guest role permissions. Audit log, description, settings, group policy, manageable groups, and pending groups operations require `legacy-group:manage`; notification preference updates require `legacy-user:manage`. Roblox's current Groups reference does not list an additional API-key scope for Get Group or List Group Memberships.

## Configs API Scopes

The Config resource uses the existing Roblox Cloud API key credential. Published config, full config, draft, and revision reads require the `universe:read` scope. Draft changes, draft reset, publish, and revision restore require the `universe:write` scope.

## User Subscription API Scopes

The Get Subscription user operation requires either `universe:write` or `universe.subscription-product.subscription:read`.

## Team Create API Scopes

The Team Create resource uses the existing Roblox Cloud API key credential and requires the `legacy-team-collaboration:manage` scope.

## Storage API Scopes

The Storage resource uses the existing Roblox Cloud API key credential. Standard data store control operations use `universe-datastores.control:list`, `universe-datastores.control:delete`, and `universe-datastores.control:snapshot`. Standard entry operations use `universe-datastores.objects:list`, `universe-datastores.objects:read`, `universe-datastores.objects:create`, `universe-datastores.objects:update`, `universe-datastores.objects:delete`, and `universe-datastores.versions:list`. Memory store queues use `memory-store.queue:add`, `memory-store.queue:dequeue`, and `memory-store.queue:discard`; memory store sorted maps use `memory-store.sorted-map:read` and `memory-store.sorted-map:write`; memory store flush uses `memory-store:flush`. Ordered data store reads require `universe.ordered-data-store.scope.entry:read`; ordered data store writes require `universe.ordered-data-store.scope.entry:write`.

## Luau Execution API Scopes

The Luau Execution resource uses the existing Roblox Cloud API key credential. Creating session tasks and binary inputs requires `universe.place.luau-execution-session:write`. Reading session tasks and logs requires `universe.place.luau-execution-session:read`; Roblox also allows those reads with `universe.place.luau-execution-session:write`.

## Prerequisites

Before getting started, ensure you have the following:

- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/) (v20 or higher recommended)
- [n8n installed globally](https://docs.n8n.io/getting-started/installation/)
  ```bash
  npm install -g n8n
  ```

## Setup

1. Clone this repository:

   ```bash
   git clone https://github.com/LordMerc/roblox-n8n.git
   cd roblox-n8n
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start developing or customizing your own nodes within the `/nodes` and `/credentials` directories.

4. Run linter checks:
   ```bash
   npm run lint       # Check for issues
   npm run lintfix    # Auto-fix common issues
   ```

## Running Locally

To test your custom node within your local n8n environment, follow the official guide here:  
👉 [Run your node locally](https://docs.n8n.io/integrations/creating-nodes/test/run-node-locally/)

## Roblox Open Cloud API Docs

Learn more about the endpoints and features available from Roblox's Open Cloud platform:  
📚 [Roblox Cloud Documentation](https://create.roblox.com/docs/cloud)

## Contributing

If you improve or expand functionality, feel free to open a PR! This is a community project meant to accelerate Roblox ↔ automation use cases.

## License

[MIT License](LICENSE.md)
