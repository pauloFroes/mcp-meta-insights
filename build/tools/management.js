import { z } from "zod";
import { AD_ACCOUNT_ID } from "../auth.js";
import { apiRequest, toolResult, toolError } from "../client.js";
const objectiveEnum = z
    .enum([
    "OUTCOME_AWARENESS",
    "OUTCOME_TRAFFIC",
    "OUTCOME_ENGAGEMENT",
    "OUTCOME_LEADS",
    "OUTCOME_APP_PROMOTION",
    "OUTCOME_SALES",
])
    .describe("Campaign objective (ODAX)");
const statusEnum = z
    .enum(["ACTIVE", "PAUSED", "ARCHIVED", "DELETED"])
    .describe("Status");
export function registerManagementTools(server) {
    // ── Campaign CRUD ──
    server.registerTool("create_campaign", {
        title: "Create Campaign",
        description: "Create a new campaign. Requires name, objective, and status. Set special_ad_categories to [] if none apply. Budget can be set at campaign level (CBO) or at ad set level.",
        inputSchema: {
            name: z.string().describe("Campaign name"),
            objective: objectiveEnum,
            status: z.enum(["ACTIVE", "PAUSED"]).describe("Initial status (recommend PAUSED to review before activating)"),
            special_ad_categories: z
                .string()
                .optional()
                .describe('JSON array of special categories. Use "[]" if none. Options: CREDIT, EMPLOYMENT, HOUSING, ISSUES_ELECTIONS_POLITICS'),
            daily_budget: z
                .string()
                .optional()
                .describe("Daily budget in cents (e.g. 5000 = R$50.00). Set at campaign level for CBO."),
            lifetime_budget: z
                .string()
                .optional()
                .describe("Lifetime budget in cents. Requires stop_time on ad sets."),
            bid_strategy: z
                .enum(["LOWEST_COST_WITHOUT_CAP", "LOWEST_COST_WITH_BID_CAP", "COST_CAP"])
                .optional()
                .describe("Bid strategy (default: LOWEST_COST_WITHOUT_CAP)"),
        },
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async (args) => {
        try {
            const body = {
                name: args.name,
                objective: args.objective,
                status: args.status,
                special_ad_categories: args.special_ad_categories
                    ? JSON.parse(args.special_ad_categories)
                    : [],
            };
            if (args.daily_budget)
                body.daily_budget = args.daily_budget;
            if (args.lifetime_budget)
                body.lifetime_budget = args.lifetime_budget;
            if (args.bid_strategy)
                body.bid_strategy = args.bid_strategy;
            const data = await apiRequest(`/${AD_ACCOUNT_ID}/campaigns`, "POST", body);
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to create campaign: ${error.message}`);
        }
    });
    server.registerTool("update_campaign", {
        title: "Update Campaign",
        description: "Update an existing campaign. Send only the fields you want to change. Cannot change objective after creation.",
        inputSchema: {
            campaign_id: z.string().describe("Campaign ID to update"),
            name: z.string().optional().describe("New campaign name"),
            status: statusEnum.optional(),
            daily_budget: z.string().optional().describe("New daily budget in cents"),
            lifetime_budget: z.string().optional().describe("New lifetime budget in cents"),
            bid_strategy: z
                .enum(["LOWEST_COST_WITHOUT_CAP", "LOWEST_COST_WITH_BID_CAP", "COST_CAP"])
                .optional()
                .describe("New bid strategy"),
        },
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async (args) => {
        try {
            const body = {};
            if (args.name)
                body.name = args.name;
            if (args.status)
                body.status = args.status;
            if (args.daily_budget)
                body.daily_budget = args.daily_budget;
            if (args.lifetime_budget)
                body.lifetime_budget = args.lifetime_budget;
            if (args.bid_strategy)
                body.bid_strategy = args.bid_strategy;
            const data = await apiRequest(`/${args.campaign_id}`, "POST", body);
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to update campaign: ${error.message}`);
        }
    });
    server.registerTool("delete_campaign", {
        title: "Delete Campaign",
        description: "Delete a campaign. This is irreversible. Consider using update_campaign with status=ARCHIVED instead.",
        inputSchema: {
            campaign_id: z.string().describe("Campaign ID to delete"),
        },
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            openWorldHint: true,
        },
    }, async ({ campaign_id }) => {
        try {
            const data = await apiRequest(`/${campaign_id}`, "DELETE");
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to delete campaign: ${error.message}`);
        }
    });
    // ── Ad Set CRUD ──
    server.registerTool("create_adset", {
        title: "Create Ad Set",
        description: "Create a new ad set within a campaign. Requires campaign_id, targeting, billing_event, optimization_goal, budget, and status. Targeting is a JSON string with age, gender, geo, interests, etc.",
        inputSchema: {
            name: z.string().describe("Ad set name"),
            campaign_id: z.string().describe("Parent campaign ID"),
            daily_budget: z
                .string()
                .optional()
                .describe("Daily budget in cents (e.g. 5000 = R$50.00). Required if campaign has no budget."),
            lifetime_budget: z
                .string()
                .optional()
                .describe("Lifetime budget in cents. Requires end_time."),
            billing_event: z
                .enum(["IMPRESSIONS", "LINK_CLICKS", "POST_ENGAGEMENT"])
                .optional()
                .describe("Billing event (default: IMPRESSIONS)"),
            optimization_goal: z
                .enum([
                "OFFSITE_CONVERSIONS",
                "LINK_CLICKS",
                "LANDING_PAGE_VIEWS",
                "LEAD_GENERATION",
                "REACH",
                "IMPRESSIONS",
                "POST_ENGAGEMENT",
                "VIDEO_VIEWS",
                "APP_INSTALLS",
            ])
                .describe("What to optimize for"),
            targeting: z
                .string()
                .describe('JSON targeting object. Example: {"age_min":25,"age_max":55,"geo_locations":{"countries":["BR"]},"publisher_platforms":["facebook","instagram"]}'),
            promoted_object: z
                .string()
                .optional()
                .describe('JSON promoted object. Required for conversions. Example: {"pixel_id":"123","custom_event_type":"PURCHASE"}'),
            status: z.enum(["ACTIVE", "PAUSED"]).describe("Initial status"),
            start_time: z.string().optional().describe("Start time (ISO 8601)"),
            end_time: z.string().optional().describe("End time (ISO 8601). Required if using lifetime_budget."),
        },
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async (args) => {
        try {
            const body = {
                name: args.name,
                campaign_id: args.campaign_id,
                billing_event: args.billing_event || "IMPRESSIONS",
                optimization_goal: args.optimization_goal,
                targeting: JSON.parse(args.targeting),
                status: args.status,
            };
            if (args.daily_budget)
                body.daily_budget = args.daily_budget;
            if (args.lifetime_budget)
                body.lifetime_budget = args.lifetime_budget;
            if (args.promoted_object)
                body.promoted_object = JSON.parse(args.promoted_object);
            if (args.start_time)
                body.start_time = args.start_time;
            if (args.end_time)
                body.end_time = args.end_time;
            const data = await apiRequest(`/${AD_ACCOUNT_ID}/adsets`, "POST", body);
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to create ad set: ${error.message}`);
        }
    });
    server.registerTool("update_adset", {
        title: "Update Ad Set",
        description: "Update an existing ad set. Send only the fields you want to change.",
        inputSchema: {
            adset_id: z.string().describe("Ad set ID to update"),
            name: z.string().optional().describe("New name"),
            status: statusEnum.optional(),
            daily_budget: z.string().optional().describe("New daily budget in cents"),
            lifetime_budget: z.string().optional().describe("New lifetime budget in cents"),
            targeting: z.string().optional().describe("New targeting JSON object"),
            bid_amount: z.string().optional().describe("Bid amount in cents"),
            end_time: z.string().optional().describe("New end time (ISO 8601)"),
        },
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async (args) => {
        try {
            const body = {};
            if (args.name)
                body.name = args.name;
            if (args.status)
                body.status = args.status;
            if (args.daily_budget)
                body.daily_budget = args.daily_budget;
            if (args.lifetime_budget)
                body.lifetime_budget = args.lifetime_budget;
            if (args.targeting)
                body.targeting = JSON.parse(args.targeting);
            if (args.bid_amount)
                body.bid_amount = args.bid_amount;
            if (args.end_time)
                body.end_time = args.end_time;
            const data = await apiRequest(`/${args.adset_id}`, "POST", body);
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to update ad set: ${error.message}`);
        }
    });
    server.registerTool("delete_adset", {
        title: "Delete Ad Set",
        description: "Delete an ad set. This is irreversible. Consider using update_adset with status=ARCHIVED instead.",
        inputSchema: {
            adset_id: z.string().describe("Ad set ID to delete"),
        },
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            openWorldHint: true,
        },
    }, async ({ adset_id }) => {
        try {
            const data = await apiRequest(`/${adset_id}`, "DELETE");
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to delete ad set: ${error.message}`);
        }
    });
    // ── Ad CRUD ──
    server.registerTool("create_ad", {
        title: "Create Ad",
        description: "Create a new ad within an ad set. Requires adset_id and a creative_id (create the creative first with create_adcreative).",
        inputSchema: {
            name: z.string().describe("Ad name"),
            adset_id: z.string().describe("Parent ad set ID"),
            creative_id: z.string().describe("Creative ID to use (create with create_adcreative first)"),
            status: z.enum(["ACTIVE", "PAUSED"]).describe("Initial status"),
        },
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async (args) => {
        try {
            const body = {
                name: args.name,
                adset_id: args.adset_id,
                creative: { creative_id: args.creative_id },
                status: args.status,
            };
            const data = await apiRequest(`/${AD_ACCOUNT_ID}/ads`, "POST", body);
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to create ad: ${error.message}`);
        }
    });
    server.registerTool("update_ad", {
        title: "Update Ad",
        description: "Update an existing ad. Change name, status, or swap creative.",
        inputSchema: {
            ad_id: z.string().describe("Ad ID to update"),
            name: z.string().optional().describe("New name"),
            status: statusEnum.optional(),
            creative_id: z.string().optional().describe("New creative ID to swap to"),
        },
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async (args) => {
        try {
            const body = {};
            if (args.name)
                body.name = args.name;
            if (args.status)
                body.status = args.status;
            if (args.creative_id)
                body.creative = { creative_id: args.creative_id };
            const data = await apiRequest(`/${args.ad_id}`, "POST", body);
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to update ad: ${error.message}`);
        }
    });
    server.registerTool("delete_ad", {
        title: "Delete Ad",
        description: "Delete an ad. This is irreversible. Consider using update_ad with status=ARCHIVED instead.",
        inputSchema: {
            ad_id: z.string().describe("Ad ID to delete"),
        },
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            openWorldHint: true,
        },
    }, async ({ ad_id }) => {
        try {
            const data = await apiRequest(`/${ad_id}`, "DELETE");
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to delete ad: ${error.message}`);
        }
    });
    // ── Ad Creative ──
    server.registerTool("create_adcreative", {
        title: "Create Ad Creative",
        description: "Create an ad creative. The object_story_spec is a JSON string defining the creative content (image, video, or carousel with link_data or video_data). Requires a page_id.",
        inputSchema: {
            name: z.string().describe("Creative name"),
            object_story_spec: z
                .string()
                .describe('JSON creative spec. Image example: {"page_id":"123","link_data":{"image_hash":"abc","link":"https://...","message":"Ad text","call_to_action":{"type":"LEARN_MORE","value":{"link":"https://..."}}}}'),
        },
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            openWorldHint: true,
        },
    }, async (args) => {
        try {
            const body = {
                name: args.name,
                object_story_spec: JSON.parse(args.object_story_spec),
            };
            const data = await apiRequest(`/${AD_ACCOUNT_ID}/adcreatives`, "POST", body);
            return toolResult(data);
        }
        catch (error) {
            return toolError(`Failed to create ad creative: ${error.message}`);
        }
    });
}
