import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AD_ACCOUNT_ID } from "../auth.js";
import { apiRequest, buildInsightsParams, toolResult, toolError } from "../client.js";

const COMMON_FIELDS_DESC =
  "Comma-separated list of metrics/dimensions. Common: impressions, clicks, spend, cpc, cpm, ctr, reach, frequency, actions, cost_per_action_type, conversions, cost_per_conversion. Default: impressions,clicks,spend,cpc,cpm,ctr,reach";

const DEFAULT_FIELDS = "impressions,clicks,spend,cpc,cpm,ctr,reach";

const insightsSchema = {
  fields: z.string().optional().describe(COMMON_FIELDS_DESC),
  since: z
    .string()
    .optional()
    .describe("Start date (YYYY-MM-DD). Used with 'until' to build time_range."),
  until: z
    .string()
    .optional()
    .describe("End date (YYYY-MM-DD). Used with 'since' to build time_range."),
  time_increment: z
    .string()
    .optional()
    .describe("Time granularity: 1 (daily), 7, 14, monthly, or all_days (default: all_days)"),
  filtering: z
    .string()
    .optional()
    .describe(
      'JSON array of filter objects. Example: [{"field":"impressions","operator":"GREATER_THAN","value":"0"}]'
    ),
  breakdowns: z
    .string()
    .optional()
    .describe(
      "Comma-separated breakdowns. Common: age, gender, country, publisher_platform, device_platform, impression_device"
    ),
  limit: z.string().optional().describe("Max number of rows to return (default: 25)"),
};

export function registerInsightTools(server: McpServer) {
  server.registerTool(
    "get_account_insights",
    {
      title: "Get Ad Account Insights",
      description:
        "Get performance insights for the ad account. Optionally set level=campaign, adset, or ad to break down results. Use since/until for date ranges. Returns metrics like impressions, clicks, spend, cpc, cpm, ctr, reach.",
      inputSchema: {
        ...insightsSchema,
        level: z
          .enum(["account", "campaign", "adset", "ad"])
          .optional()
          .describe("Aggregation level (default: account)"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const params = buildInsightsParams({
          ...args,
          fields: args.fields || DEFAULT_FIELDS,
        });
        const data = await apiRequest(`/${AD_ACCOUNT_ID}/insights`, params);
        return toolResult(data);
      } catch (error) {
        return toolError(`Failed to get account insights: ${(error as Error).message}`);
      }
    },
  );

  server.registerTool(
    "get_campaign_insights",
    {
      title: "Get Campaign Insights",
      description:
        "Get performance insights for a specific campaign by ID. Returns metrics like impressions, clicks, spend, cpc, cpm, ctr, reach.",
      inputSchema: {
        campaign_id: z.string().describe("Campaign ID"),
        ...insightsSchema,
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const params = buildInsightsParams({
          ...args,
          fields: args.fields || DEFAULT_FIELDS,
        });
        const data = await apiRequest(`/${args.campaign_id}/insights`, params);
        return toolResult(data);
      } catch (error) {
        return toolError(`Failed to get campaign insights: ${(error as Error).message}`);
      }
    },
  );

  server.registerTool(
    "get_adset_insights",
    {
      title: "Get Ad Set Insights",
      description:
        "Get performance insights for a specific ad set by ID. Returns metrics like impressions, clicks, spend, cpc, cpm, ctr, reach.",
      inputSchema: {
        adset_id: z.string().describe("Ad Set ID"),
        ...insightsSchema,
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const params = buildInsightsParams({
          ...args,
          fields: args.fields || DEFAULT_FIELDS,
        });
        const data = await apiRequest(`/${args.adset_id}/insights`, params);
        return toolResult(data);
      } catch (error) {
        return toolError(`Failed to get ad set insights: ${(error as Error).message}`);
      }
    },
  );

  server.registerTool(
    "get_ad_insights",
    {
      title: "Get Ad Insights",
      description:
        "Get performance insights for a specific ad by ID. Returns metrics like impressions, clicks, spend, cpc, cpm, ctr, reach.",
      inputSchema: {
        ad_id: z.string().describe("Ad ID"),
        ...insightsSchema,
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const params = buildInsightsParams({
          ...args,
          fields: args.fields || DEFAULT_FIELDS,
        });
        const data = await apiRequest(`/${args.ad_id}/insights`, params);
        return toolResult(data);
      } catch (error) {
        return toolError(`Failed to get ad insights: ${(error as Error).message}`);
      }
    },
  );
}
