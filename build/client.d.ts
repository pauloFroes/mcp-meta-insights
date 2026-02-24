export declare class MetaApiError extends Error {
    status: number;
    constructor(status: number, message: string);
}
export declare function apiRequest<T>(endpoint: string, method?: "GET" | "POST" | "DELETE", body?: Record<string, unknown>, queryParams?: Record<string, string | undefined>): Promise<T>;
export declare function apiRequestAllPages<T>(endpoint: string, queryParams?: Record<string, string | undefined>): Promise<T[]>;
export interface TimeRange {
    since: string;
    until: string;
}
export declare function buildInsightsParams(args: {
    fields?: string;
    since?: string;
    until?: string;
    time_increment?: string;
    level?: string;
    filtering?: string;
    breakdowns?: string;
    limit?: string;
}): Record<string, string | undefined>;
export declare function toolResult(data: unknown): {
    content: {
        type: "text";
        text: string;
    }[];
};
export declare function toolError(message: string): {
    isError: true;
    content: {
        type: "text";
        text: string;
    }[];
};
