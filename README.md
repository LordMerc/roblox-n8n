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

> ✅ Ideal for developers using Roblox + automation tools like n8n to build dashboards, pipelines, and custom tools.

## Configs API Scopes

The Config resource uses the existing Roblox Cloud API key credential. Published config, full config, draft, and revision reads require the `universe:read` scope. Draft changes, draft reset, publish, and revision restore require the `universe:write` scope.

## User Subscription API Scopes

The Get Subscription user operation requires either `universe:write` or `universe.subscription-product.subscription:read`.

## Team Create API Scopes

The Team Create resource uses the existing Roblox Cloud API key credential and requires the `legacy-team-collaboration:manage` scope.

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
