import { ACCESS_TOKEN, BASE_URL } from "./auth.js";

const MAX_PAGES = 10;

export class MetaApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "MetaApiError";
  }
}

interface GraphApiError {
  error?: {
    message?: string;
    type?: string;
    code?: number;
    error_subcode?: number;
  };
}

interface CursorPaging {
  cursors?: { before?: string; after?: string };
  next?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  paging?: CursorPaging;
}

export async function apiRequest<T>(
  endpoint: string,
  queryParams?: Record<string, string | undefined>,
): Promise<T> {
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
    const body = (await response.json().catch(() => ({}))) as GraphApiError;
    const msg =
      body.error?.message || response.statusText;

    if (response.status === 429 || body.error?.code === 32) {
      throw new MetaApiError(429, "Rate limit exceeded. Try again in a moment.");
    }

    if (body.error?.code === 190) {
      const sub = body.error.error_subcode;
      const hint =
        sub === 463 || sub === 467
          ? " Token has expired — generate a new System User token in Business Manager."
          : " Check your META_ACCESS_TOKEN or generate a new one in Business Manager → System Users.";
      throw new MetaApiError(401, `Authentication failed: ${msg}.${hint}`);
    }

    throw new MetaApiError(
      response.status,
      `Meta API error (${response.status}): ${msg}`,
    );
  }

  return (await response.json()) as T;
}

export async function apiRequestAllPages<T>(
  endpoint: string,
  queryParams?: Record<string, string | undefined>,
): Promise<T[]> {
  const all: T[] = [];
  let after: string | undefined;

  for (let page = 0; page < MAX_PAGES; page++) {
    const params: Record<string, string | undefined> = {
      ...queryParams,
      after,
    };

    const result = await apiRequest<PaginatedResponse<T>>(endpoint, params);

    if (result.data) {
      all.push(...result.data);
    }

    if (!result.paging?.next) break;
    after = result.paging.cursors?.after;
    if (!after) break;
  }

  return all;
}

export interface TimeRange {
  since: string;
  until: string;
}

export function buildInsightsParams(args: {
  fields?: string;
  since?: string;
  until?: string;
  time_increment?: string;
  level?: string;
  filtering?: string;
  breakdowns?: string;
  limit?: string;
}): Record<string, string | undefined> {
  const params: Record<string, string | undefined> = {
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

export function toolResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

export function toolError(message: string) {
  return {
    isError: true as const,
    content: [{ type: "text" as const, text: message }],
  };
}
