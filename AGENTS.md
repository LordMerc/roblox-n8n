# Repository Instructions

## CodeGraph

This project has a CodeGraph MCP server (`codegraph_*` tools) configured. CodeGraph is a tree-sitter-parsed knowledge graph of every symbol, edge, and file. Reads are sub-millisecond and return structural information grep cannot.

Use CodeGraph for structural questions, including where symbols are defined, what calls what, what would break, signatures, source, architecture context, and file structure. Use native grep/read only for literal text queries, comments, log messages, endpoint strings, or after a specific file is already open.

Preferred tools:

- "Where is X defined?" / "Find symbol named X": `codegraph_search`
- "What calls function Y?": `codegraph_callers`
- "What does Y call?": `codegraph_callees`
- "What would break if I changed Z?": `codegraph_impact`
- "Show me Y's signature / source / docstring": `codegraph_node`
- "Give me focused context for a task/area": `codegraph_context`
- "See several related symbols' source at once": `codegraph_explore`
- "What files exist under path/": `codegraph_files`
- "Is the index healthy?": `codegraph_status`

Trust CodeGraph results for structural lookups. Do not re-verify them with grep unless checking literal text or confirming a detail outside the graph.

Do not commit `.codegraph/`; it is a local generated index and should remain ignored.

## Publishing

For publishable changes to this n8n community node package, always bump the npm package version in both `package.json` and `package-lock.json` before committing or publishing. Use the smallest appropriate semver bump unless the user requests a specific version.
