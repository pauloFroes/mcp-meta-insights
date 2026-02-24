#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerInsightTools } from "./tools/insights.js";
import { registerObjectTools } from "./tools/objects.js";

const server = new McpServer({
  name: "mcp-meta-insights",
  version: "1.0.0",
});

registerInsightTools(server);
registerObjectTools(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("mcp-meta-insights server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
