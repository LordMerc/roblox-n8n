# Stable Open Cloud Endpoints Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove nonfunctional cookie-authenticated Group ban operations and add typed Create User Notification plus hybrid JSON-based Update Universe support.

**Architecture:** Keep the existing declarative n8n-node routing pattern. Add a focused Notification description module, extend the Universe description, and remove only the Group operations that cannot use the package's API-key credential. Metadata tests define the public node contract before production changes.

**Tech Stack:** TypeScript 5.8, n8n declarative node metadata, Node.js `assert`, ESLint, Gulp build.

## Global Constraints

- Use only the existing `robloxCloudApi` API-key credential and `https://apis.roblox.com` base URL.
- Do not introduce `.ROBLOSECURITY`, cookie authentication, new dependencies, Beta endpoints, or Experimental endpoints.
- Notification JSON uses the current OpenAPI camelCase schema and fixed payload type `MOMENT`.
- Notification optional fields and empty parent objects must be omitted.
- Update Universe uses a required comma-separated update mask and a required JSON object body.
- Preserve every unrelated resource, operation value, field, and route.
- Bump both package manifests from `2.4.27` to `2.4.28` because the change is publishable.
- Do not commit, push, publish, or deploy; repository policy requires separate authorization.

---

### Task 1: Define the metadata contract with failing tests

**Files:**
- Modify: `tests/roblox-cloud-metadata.test.js`

**Interfaces:**
- Consumes: compiled node description from `dist/nodes/Roblox/RobloxCloud.node.js`.
- Produces: assertions for resource registration, operation routing, inputs, request expressions, and removed operation values.

- [ ] **Step 1: Add Notification resource and operation assertions**

Add assertions that locate the `resource` selector and require `notification`, then locate the Notification `operation` selector and require `create_user_notification` with `POST` and `/cloud/v2/users/{{ $parameter["userId"] }}/notifications`.

- [ ] **Step 2: Add Notification field assertions**

Require `userId`, `universeId`, and `notificationMessageId` for `create_user_notification`; require optional `notificationParametersJson`, `notificationLaunchData`, and `notificationAnalyticsCategory`. Assert the request body expression contains `MOMENT`, `messageId`, `source`, `universe`, `joinExperience`, and `analyticsData`.

- [ ] **Step 3: Add Update Universe assertions**

Add `update_universe: 'PATCH'` to the expected Universe operation map. Assert its URL is `=/cloud/v2/universes/{{ $parameter["universeId"] }}`, its query mapping reads `universeUpdateMask`, and its body reads `universeUpdateJson`. Require both new fields and require `universeId` to display for `update_universe`.

- [ ] **Step 4: Add Group-removal regression assertions**

Assert `ban_user` and `unban_user` are absent. If `userId` is found to be exclusive to those Group operations, assert no Group-only `userId` display condition remains.

- [ ] **Step 5: Run the test and observe the intended failure**

Run: `node tests/roblox-cloud-metadata.test.js`

Expected: nonzero exit because `notification` and `update_universe` are not implemented and ban/unban still exist. Record the first relevant assertion failure in the task report.

---

### Task 2: Implement the Stable operations and Group cleanup

**Files:**
- Create: `nodes/Roblox/Notification/NotificationDescription.ts`
- Modify: `nodes/Roblox/RobloxCloud.node.ts`
- Modify: `nodes/Roblox/Universe/UniverseDescription.ts`
- Modify: `nodes/Roblox/Group/GroupDescription.ts`

**Interfaces:**
- Consumes: the failing metadata contract from Task 1 and existing `INodeProperties` declarative routing conventions.
- Produces: `notificationOperations`, `notificationFields`, `update_universe`, `universeUpdateMask`, and `universeUpdateJson`.

- [ ] **Step 1: Create Notification description exports**

Export `notificationOperations` and `notificationFields`. Define `create_user_notification` with `POST` and the exact Cloud v2 user-notification route. Build the body expression as an object containing `source.universe = "universes/" + universeId` and `payload.type = "MOMENT"`, `payload.messageId`, optional parsed parameters, optional `joinExperience.launchData`, and optional `analyticsData.category`. Filter blank optional values so no empty optional object is emitted.

- [ ] **Step 2: Define Notification inputs**

Add required string fields `userId`, `universeId`, and `notificationMessageId`. Add `notificationParametersJson` as an n8n `json` field defaulting to `{}`. Add optional string fields `notificationLaunchData` and `notificationAnalyticsCategory`; document the 200-byte launch-data limit.

- [ ] **Step 3: Register the Notification resource**

Import the two exports in `RobloxCloud.node.ts`, add the `Notification` option with value `notification`, and spread the operation and field arrays into `properties` without changing other resource order or defaults unnecessarily.

- [ ] **Step 4: Add Update Universe**

Add `update_universe` to `universeOperations` with `PATCH`, the existing Universe path, query `updateMask: '={{ $parameter["universeUpdateMask"] }}'`, and body `={{ $parameter["universeUpdateJson"] }}`. Include `update_universe` in the existing `universeId` display condition. Add required `universeUpdateMask` string and required `universeUpdateJson` JSON fields displayed only for this operation.

- [ ] **Step 5: Remove cookie-only Group operations**

Delete `ban_user` and `unban_user` options and their route overrides to `groups.roblox.com`. Remove their operation references from fields. Delete the Group `userId` field only if no remaining Group operation consumes it; preserve any shared use.

- [ ] **Step 6: Build generated output and run the contract test**

Run the repository build with the bundled/local working Node and npm entry point. Then run `node tests/roblox-cloud-metadata.test.js`.

Expected: build exits 0 and metadata test exits 0.

- [ ] **Step 7: Run targeted static checks**

Run:

```powershell
& .\node_modules\.bin\tsc.cmd --noEmit
& .\node_modules\.bin\eslint.cmd nodes credentials package.json
```

Expected: both exit 0.

---

### Task 3: Document and package the release

**Files:**
- Modify: `README.md`
- Modify: `package.json`
- Modify: `package-lock.json`
- Generated: `dist/**`

**Interfaces:**
- Consumes: final public operation and field names from Task 2.
- Produces: accurate user documentation and publishable `2.4.28` package metadata.

- [ ] **Step 1: Update README operation inventory**

Remove `ban_user` and `unban_user` from Group. Add Notification with `create_user_notification` and all six inputs. Add `update_universe`, `universeUpdateMask`, and `universeUpdateJson` to Universe.

- [ ] **Step 2: Update scope documentation**

State that cookie-only Group bans are unsupported. Add Notification scope `user.user-notification:write`; add Update Universe scope `universe:write` and note that users should re-read the resource to verify mutations as Roblox recommends.

- [ ] **Step 3: Bump package version**

Change the package version to `2.4.28` in `package.json` and both lockfile version locations. Do not change dependency resolutions.

- [ ] **Step 4: Rebuild and run the full verification set**

Run:

```powershell
node tests/roblox-cloud-metadata.test.js
& .\node_modules\.bin\tsc.cmd --noEmit
& .\node_modules\.bin\eslint.cmd nodes credentials package.json
```

Run the full build and then repeat the metadata test so `dist` is proven current.

Expected: every command exits 0.

- [ ] **Step 5: Inspect the final diff**

Confirm only the design, plan, tests, Notification module, Cloud registration, Universe/Group descriptions, README, package manifests, and corresponding generated `dist` files changed. Confirm no secrets, cookie credential, debug output, dependency changes, or unfinished markers exist.
