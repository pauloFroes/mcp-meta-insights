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
export async function apiRequest(endpoint, queryParams) {
    const params = new URLSearchParams();
    params.set("access_token", ACCESS_TOKEN);
    if (queryParams) {
        for (const [key, value] of Object.entries(queryParams)) {
            if (value !== undefined && value !== "") {
                params.set(key, value);
            }
        }
    }
    const url = `${BASE_URL}${endpoint}?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
        const body = (await response.json().catch(() => ({})));
        const msg = body.error?.message || response.statusText;
        if (response.status === 429 || body.error?.code === 32) {
            throw new MetaApiError(429, "Rate limit exceeded. Try again in a moment.");
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
        const result = await apiRequest(endpoint, params);
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
