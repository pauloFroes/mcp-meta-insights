#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerInsightTools } from "./tools/insights.js";
import { registerObjectTools } from "./tools/objects.js";
import { registerManagementTools } from "./tools/management.js";

const server = new McpServer({
  name: "mcp-meta-marketing",
  version: "1.0.0",
});

registerInsightTools(server);
registerObjectTools(server);
registerManagementTools(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("mcp-meta-marketing server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
