# Stable Open Cloud Endpoints Design

## Goal

Remove the unusable cookie-authenticated Group ban operations from the API-key Cloud node and add the two currently missing Stable Roblox Open Cloud endpoints: Update Universe and Create User Notification.

## Scope

This release will:

- Remove `ban_user` and `unban_user` from the `Group` resource.
- Remove fields used only by those operations.
- Add `Update Universe` to the existing `Universe` resource.
- Add a dedicated `Notification` resource with `Create User Notification`.
- Update metadata tests and README documentation.
- Regenerate `dist` through the existing build.
- Bump `package.json` and `package-lock.json` from `2.4.27` to `2.4.28`.

This release will not:

- Add `.ROBLOSECURITY` or any other cookie credential.
- Move Group ban operations into the Legacy node.
- Add Beta, Experimental, legacy-proxy, or superseded endpoints.
- Make live Roblox requests in automated tests.

## Authentication and Security Boundary

Both new operations use the existing `RobloxCloudApi` credential, which sends an `x-api-key` header to `https://apis.roblox.com`.

- Update Universe requires `universe:write`.
- Create User Notification requires `user.user-notification:write`.

The Group ban and unban routes are removed because Roblox documents them as cookie-authenticated `groups.roblox.com` endpoints. The project will not store or transmit a `.ROBLOSECURITY` cookie.

## Notification Resource

Create `nodes/Roblox/Notification/NotificationDescription.ts` and register a `Notification` resource in `RobloxCloud.node.ts`.

The resource exposes one operation:

- Display name: `Create User Notification`
- Value: `create_user_notification`
- Method: `POST`
- URL: `/cloud/v2/users/{userId}/notifications`

Required inputs:

- `userId`: destination Roblox user ID.
- `universeId`: source universe ID. The request uses the resource name `universes/{universeId}`.
- `notificationMessageId`: Creator Dashboard notification-string asset ID.

Optional inputs:

- `notificationParametersJson`: a JSON object whose values follow Roblox's `stringValue` or `int64Value` parameter-value schema.
- `notificationLaunchData`: arbitrary launch data, documented with Roblox's 200-byte maximum.
- `notificationAnalyticsCategory`: category used to group notification analytics.

The request body uses the current OpenAPI camelCase schema:

```json
{
  "source": {
    "universe": "universes/{universeId}"
  },
  "payload": {
    "type": "MOMENT",
    "messageId": "{notificationMessageId}",
    "parameters": {},
    "joinExperience": {
      "launchData": "optional"
    },
    "analyticsData": {
      "category": "optional"
    }
  }
}
```

### Notification payload wire-shape decision

Roblox's official narrative guide currently conflicts with the current machine-readable OpenAPI and feature reference by describing `joinExperience` and `analyticsData` at the request root. This package follows the current machine-readable OpenAPI and feature reference: both fields remain nested inside `payload`. The metadata contract explicitly guards that placement.

Blank optional fields and their empty parent objects are omitted. `notificationParametersJson` defaults to `{}` and is represented by an n8n JSON field so malformed JSON and non-object values are rejected before a request is sent.

## Update Universe Operation

Add this operation to `nodes/Roblox/Universe/UniverseDescription.ts`:

- Display name: `Update Universe`
- Value: `update_universe`
- Method: `PATCH`
- URL: `/cloud/v2/universes/{universeId}`

Inputs:

- Existing required `universeId` field.
- Required `universeUpdateMask` string containing a comma-separated list of fields.
- Required `universeUpdateJson` JSON object containing the values to update.

The request sends `universeUpdateMask` as the `updateMask` query parameter and `universeUpdateJson` as the request body. The operation intentionally uses a raw JSON body because Roblox's Stable Universe schema includes nullable fields, nested social-link objects, and fields that may evolve independently of this package. The field description warns users to include only writable fields and to grant `universe:write`.

## Group Cleanup

Remove the `ban_user` and `unban_user` operation options from `nodes/Roblox/Group/GroupDescription.ts`. Remove `userId` only if no remaining Group operation consumes it; otherwise preserve the shared field. Remove any display conditions and descriptions used exclusively by the deleted operations.

Update README operation lists and scope documentation so cookie-only Group bans are described as unsupported rather than available.

## Tests

Extend `tests/roblox-cloud-metadata.test.js` before changing production descriptions.

The tests must verify:

- `Notification` appears in the Cloud resource selector.
- `create_user_notification` exists and routes to the documented `POST` URL.
- Its three required identifiers and three optional customization fields are present with the intended display conditions.
- The notification body expression constructs `source.universe`, `payload.type`, and `payload.messageId`, and conditionally omits empty optional objects.
- `update_universe` exists under `Universe` and routes with `PATCH` to the documented URL.
- Update Universe sends `universeUpdateMask` as `updateMask` and `universeUpdateJson` as the body.
- `ban_user` and `unban_user` are absent.
- Fields used only by removed operations are absent.

The metadata test must be observed failing for the missing operations and existing ban operations before production code is changed.

## Validation

Run, in order:

1. `node tests/roblox-cloud-metadata.test.js`
2. `& .\node_modules\.bin\tsc.cmd --noEmit`
3. `& .\node_modules\.bin\eslint.cmd nodes credentials package.json`
4. The repository build using the available local npm/runtime environment.
5. Re-run the metadata test against generated `dist` behavior.
6. Inspect the final diff for source/generated parity, version parity, unrelated changes, secrets, and debug output.

Automated tests do not call Roblox. A manual integration check remains necessary to prove that keys with `universe:write` and `user.user-notification:write` mutate Roblox resources and deliver notifications.

## Release and Compatibility

This is a patch release, `2.4.28`.

Removing Group ban and unban options is intentional because those options cannot authenticate through the required Cloud API-key credential. Existing workflows selecting those values will no longer find a matching operation after upgrading; this compatibility break is accepted to avoid presenting a nonfunctional and security-sensitive path.

All other resources, operation values, request routes, fields, and credentials remain unchanged.
