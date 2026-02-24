import { z } from "zod";
import { AD_ACCOUNT_ID } from "../auth.js";
import { apiRequest, apiRequestAllPages, toolResult, toolError } from "../client.js";
const campaignStatus = z
    .enum(["ACTIVE", "PAUSED", "DELETED", "ARCHIVED"])
    .optional()
    .describe("Filter by effective status");
export function registerObjectTools(server) {
    server.registerTool("list_campaigns", {
        title: "List Campaigns",
        description: "List campaigns in the ad account. Returns campaign name, status, objective, daily/lifetime budget, and bid strategy. Use effective_status to filter. Auto-paginates up to 10 pages.",
        inputSchema: {
            fields: z
                .string()
                .optional()
                .describe("Comma-separated fields. Default: id,name,status,effective_status,objective,daily_budget,lifetime_budget,bid_strategy,start_time,stop_time"),
            effective_status: campaignStatus,
            limit: z.string().optional().describe("Items per page (default: 100, max: 100)"),
        },
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async (args) => {
        try {
            const params = {
                fields: args.fields ||
                    "id,name,status,effective_status,objective,daily_budget,lifetime_budget,bid_strategy,start_time,stop_time",
                limit: args.limit || "100",
            };
            if (args.effective_status) {
                params["effective_status"] = JSON.stringify([args.effective_status]);
            }
            const data = await apiRequestAllPages(`/${AD_ACCOUNT_ID}/campaigns`, params);
            return toolResult({ data, total: data.length });
        }
        catch (error) {
            return toolError(`Failed to list campaigns: ${error.message}`);
        }
    });
    server.registerTool("list_adsets", {
        title: "List Ad Sets",
        description: "List ad sets in the ad account. Optionally filter by campaign ID or effective status. Returns ad set name, status, targeting, budget, and schedule. Auto-paginates up to 10 pages.",
        inputSchema: {
            fields: z
                .string()
                .optional()
                .describe("Comma-separated fields. Default: id,name,status,effective_status,campaign_id,daily_budget,lifetime_budget,targeting,optimization_goal,billing_event,start_time,end_time"),
            campaign_id: z
                .string()
                .optional()
                .describe("Filter ad sets by campaign ID. If set, queries /{campaign_id}/adsets instead of account-level."),
            effective_status: campaignStatus,
            limit: z.string().optional().describe("Items per page (default: 100, max: 100)"),
        },
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async (args) => {
        try {
            const params = {
                fields: args.fields ||
                    "id,name,status,effective_status,campaign_id,daily_budget,lifetime_budget,targeting,optimization_goal,billing_event,start_time,end_time",
                limit: args.limit || "100",
            };
            if (args.effective_status) {
                params["effective_status"] = JSON.stringify([args.effective_status]);
            }
            const endpoint = args.campaign_id
                ? `/${args.campaign_id}/adsets`
                : `/${AD_ACCOUNT_ID}/adsets`;
            const data = await apiRequestAllPages(endpoint, params);
            return toolResult({ data, total: data.length });
        }
        catch (error) {
            return toolError(`Failed to list ad sets: ${error.message}`);
        }
    });
    server.registerTool("list_ads", {
        title: "List Ads",
        description: "List ads in the ad account. Optionally filter by ad set ID or effective status. Returns ad name, status, creative, and tracking info. Auto-paginates up to 10 pages.",
        inputSchema: {
            fields: z
                .string()
                .optional()
                .describe("Comma-separated fields. Default: id,name,status,effective_status,adset_id,campaign_id,creative"),
            adset_id: z
                .string()
                .optional()
                .describe("Filter ads by ad set ID. If set, queries /{adset_id}/ads instead of account-level."),
            effective_status: campaignStatus,
            limit: z.string().optional().describe("Items per page (default: 100, max: 100)"),
        },
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async (args) => {
        try {
            const params = {
                fields: args.fields ||
                    "id,name,status,effective_status,adset_id,campaign_id,creative",
                limit: args.limit || "100",
            };
            if (args.effective_status) {
                params["effective_status"] = JSON.stringify([args.effective_status]);
            }
            const endpoint = args.adset_id
                ? `/${args.adset_id}/ads`
                : `/${AD_ACCOUNT_ID}/ads`;
            const data = await apiRequestAllPages(endpoint, params);
            return toolResult({ data, total: data.length });
        }
        catch (error) {
            return toolError(`Failed to list ads: ${error.message}`);
        }
    });
    server.registerTool("get_ad_account", {
        title: "Get Ad Account Details",
        description: "Get details of the ad account — name, status, currency, timezone, spend cap, balance, and business info.",
        inputSchema: {
            fields: z
                .string()
                .optional()
                .describe("Comma-separated fields. Default: id,name,account_status,currency,timezone_name,timezone_offset_hours_utc,amount_spent,balance,spend_cap,business_name,business_city,business_country_code"),
        },
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async (args) => {
        try {
            const data = await apiRequest(`/${AD_ACCOUNT_ID}`, "GET", undefined, {
                fields: args.fields ||
                    "id,name,account_status,currency,timezone_name,timezone_offset_hours_utc,amount_spent,balance,spend_cap,business_name,business_city,business_country_code",
            });
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to get ad account: ${error.message}`);
        }
    });
}
