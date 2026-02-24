const GRAPH_API_VERSION = "v25.0";

export const BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(
      `Error: Missing required environment variable: ${name}\n` +
        "  META_ACCESS_TOKEN and META_AD_ACCOUNT_ID are required.\n" +
        "  Get your token at: developers.facebook.com → Marketing API"
    );
    process.exit(1);
  }
  return value;
}

export const ACCESS_TOKEN = getRequiredEnv("META_ACCESS_TOKEN");

function normalizeAccountId(raw: string): string {
  return raw.startsWith("act_") ? raw : `act_${raw}`;
}

export const AD_ACCOUNT_ID = normalizeAccountId(
  getRequiredEnv("META_AD_ACCOUNT_ID")
);
