# mcp-meta-ads

MCP server that wraps the [Meta Marketing API](https://developers.facebook.com/docs/marketing-apis/) (Graph API v25.0) as semantic tools for LLM agents.

Works with **Claude Code**, **Codex**, **Claude Desktop**, **Cursor**, **VS Code**, **Windsurf**, and any MCP-compatible client.

---

## Prerequisites

You need a Meta **access token** with `ads_read` permission and your **Ad Account ID**.

| Variable | Description |
| --- | --- |
| `META_ACCESS_TOKEN` | Access token (see 3 methods below) |
| `META_AD_ACCOUNT_ID` | Ad account ID (with or without `act_` prefix) |

### Create a Meta App (required for all methods)

1. Go to [developers.facebook.com](https://developers.facebook.com/) → **My Apps** → **Create App**
2. Use case: **Other** → App type: **Business**
3. Name it (e.g. `mcp-meta-ads`), set contact email
4. Associate with your **Business Manager** (Business Portfolio)
5. In the app dashboard, find **Marketing API** and click **Set Up**

### Find your Ad Account ID

Copy from the Ads Manager URL: `act_XXXXXXXXX`, or from Business Settings → Ad Accounts.

---

### Method A — System User Token (recommended, never expires)

Best for production. Create a new System User or reuse an existing one.

**Create or pick a System User:**

1. Go to [business.facebook.com](https://business.facebook.com/) → **Business Settings**
2. Navigate to **Users → System Users**
3. Create a new one (**Add** → name: `mcp-ads-reader` → role: **Admin**), or select an existing System User

**Assign ad account assets:**

4. Click the System User → **Add Assets** → **Ad Accounts**
5. Select the ad account(s) you want to access → permission level: **View performance**
6. Click **Save Changes**

> Without this step the token won't have access to any ad account data.

**Generate the token:**

7. On the System User page, click **Generate New Token**
8. Select your app in the dropdown
9. Check the scopes: **`ads_read`** and **`business_management`**
10. Click **Generate Token**
11. **Copy it immediately** — it's only shown once

This token **never expires** unless you revoke it or remove the System User.

---

### Method B — Token Debugger (no code, 60 days)

Quick method entirely in the browser. No System User needed.

1. Go to your app dashboard at [developers.facebook.com](https://developers.facebook.com/) → **Marketing API → Tools**
2. Select permissions: **`ads_read`** → click **Get Token**
3. Authorize when prompted — this generates a short-lived token (~1 hour)
4. Go to [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)
5. Paste the token → click **Debug**
6. At the bottom of the page, click **Extend Access Token**
7. Copy the new token — it's valid for **60 days**

> You'll need to repeat this every ~55 days to keep the token active.

---

### Method C — Programmatic Exchange (automatable, 60 days)

Same result as Method B, but via a single HTTP request — useful for scripts.

1. Get a short-lived token via **Marketing API → Tools** (same as Method B, steps 1-3)
2. Find your **App ID** and **App Secret** in your app → **Settings → Basic**
3. Make a GET request (browser, curl, or code):

```
https://graph.facebook.com/v25.0/oauth/access_token?
  grant_type=fb_exchange_token&
  client_id={APP_ID}&
  client_secret={APP_SECRET}&
  fb_exchange_token={SHORT_LIVED_TOKEN}
```

4. The response contains your long-lived `access_token` (60 days) and `expires_in`

> Keep your App Secret safe — never expose it client-side.

## Installation

### Claude Code

```bash
claude mcp add meta-ads \
  --transport stdio \
  -e META_ACCESS_TOKEN=your-token \
  -e META_AD_ACCOUNT_ID=your-account-id \
  -- npx -y github:pauloFroes/mcp-meta-ads
```

### Codex

Add to your Codex configuration:

```toml
[mcp_servers.meta-ads]
command = "npx"
args = ["-y", "github:pauloFroes/mcp-meta-ads"]
env_vars = ["META_ACCESS_TOKEN", "META_AD_ACCOUNT_ID"]
```

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "meta-ads": {
      "command": "npx",
      "args": ["-y", "github:pauloFroes/mcp-meta-ads"],
      "env": {
        "META_ACCESS_TOKEN": "your-token",
        "META_AD_ACCOUNT_ID": "your-account-id"
      }
    }
  }
}
```

### Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "meta-ads": {
      "command": "npx",
      "args": ["-y", "github:pauloFroes/mcp-meta-ads"],
      "env": {
        "META_ACCESS_TOKEN": "your-token",
        "META_AD_ACCOUNT_ID": "your-account-id"
      }
    }
  }
}
```

### VS Code

Add to `.vscode/mcp.json` in your project:

```json
{
  "servers": {
    "meta-ads": {
      "command": "npx",
      "args": ["-y", "github:pauloFroes/mcp-meta-ads"],
      "env": {
        "META_ACCESS_TOKEN": "your-token",
        "META_AD_ACCOUNT_ID": "your-account-id"
      }
    }
  }
}
```

### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "meta-ads": {
      "command": "npx",
      "args": ["-y", "github:pauloFroes/mcp-meta-ads"],
      "env": {
        "META_ACCESS_TOKEN": "your-token",
        "META_AD_ACCOUNT_ID": "your-account-id"
      }
    }
  }
}
```

## Available Tools

### Insights

| Tool | Description |
| --- | --- |
| `get_account_insights` | Get ad account insights with optional level breakdown (campaign/adset/ad) |
| `get_campaign_insights` | Get insights for a specific campaign |
| `get_adset_insights` | Get insights for a specific ad set |
| `get_ad_insights` | Get insights for a specific ad |

### Objects

| Tool | Description |
| --- | --- |
| `list_campaigns` | List campaigns with status filter and auto-pagination |
| `list_adsets` | List ad sets, optionally filtered by campaign |
| `list_ads` | List ads, optionally filtered by ad set |
| `get_ad_account` | Get ad account details (name, currency, timezone, balance) |

## Common Usage Examples

**Get last 7 days spend:**
> "How much did I spend in the last 7 days?"

**Campaign performance breakdown:**
> "Show me insights for all campaigns this month"

**Find active campaigns:**
> "List all active campaigns"

**Detailed ad set analysis:**
> "Get insights for ad set 123456 broken down by age and gender"

## Authentication

The server uses a static access token passed via environment variable. No OAuth flow is needed at runtime — the token is sent as a query parameter per the Graph API convention.

| Method | Duration | Renewal |
| --- | --- | --- |
| **A — System User** | Never expires | None |
| **B — Token Debugger** | 60 days | Manual (repeat steps) |
| **C — Programmatic** | 60 days | Automatable via HTTP |

If the token expires or is revoked, the server returns a clear error message with instructions to regenerate it.

## License

MIT
