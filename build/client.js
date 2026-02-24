import { ACCESS_TOKEN, BASE_URL } from "./auth.js";
const MAX_PAGES = 10;
export class MetaApiError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = "MetaApiError";
    }
}
export async function apiRequest(endpoint, method = "GET", body, queryParams) {
    const params = new URLSearchParams();
    params.set("access_token", ACCESS_TOKEN);
    if (method === "GET" && queryParams) {
        for (const [key, value] of Object.entries(queryParams)) {
            if (value !== undefined && value !== "") {
                params.set(key, value);
            }
        }
    }
    const url = `${BASE_URL}${endpoint}?${params.toString()}`;
    const fetchBody = method !== "GET" && body
        ? JSON.stringify(body)
        : undefined;
    const response = await fetch(url, {
        method,
        headers: fetchBody ? { "Content-Type": "application/json" } : undefined,
        body: fetchBody,
    });
    if (!response.ok) {
        const body = (await response.json().catch(() => ({})));
        const msg = body.error?.message || response.statusText;
        if (response.status === 429 || body.error?.code === 32) {
            throw new MetaApiError(429, "Rate limit exceeded. Try again in a moment.");
        }
        if (body.error?.code === 190) {
            const sub = body.error.error_subcode;
            const hint = sub === 463 || sub === 467
                ? " Token has expired — generate a new System User token in Business Manager."
                : " Check your META_ACCESS_TOKEN or generate a new one in Business Manager → System Users.";
            throw new MetaApiError(401, `Authentication failed: ${msg}.${hint}`);
        }
        throw new MetaApiError(response.status, `Meta API error (${response.status}): ${msg}`);
    }
    return (await response.json());
}
export async function apiRequestAllPages(endpoint, queryParams) {
    const all = [];
    let after;
    for (let page = 0; page < MAX_PAGES; page++) {
        const params = {
            ...queryParams,
            after,
        };
        const result = await apiRequest(endpoint, "GET", undefined, params);
        if (result.data) {
            all.push(...result.data);
        }
        if (!result.paging?.next)
            break;
        after = result.paging.cursors?.after;
        if (!after)
            break;
    }
    return all;
}
export function buildInsightsParams(args) {
    const params = {
        fields: args.fields,
        time_increment: args.time_increment,
        level: args.level,
        filtering: args.filtering,
        breakdowns: args.breakdowns,
        limit: args.limit,
    };
    if (args.since && args.until) {
        params.time_range = JSON.stringify({
            since: args.since,
            until: args.until,
        });
    }
    return params;
}
export function toolResult(data) {
    return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
}
export function toolError(message) {
    return {
        isError: true,
        content: [{ type: "text", text: message }],
    };
}
