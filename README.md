# mcp-meta-ads

MCP server that wraps the [Meta Marketing API](https://developers.facebook.com/docs/marketing-apis/) (Graph API v25.0) as semantic tools for LLM agents.

Works with **Claude Code**, **Codex**, **Claude Desktop**, **Cursor**, **VS Code**, **Windsurf**, and any MCP-compatible client.

---

## Prerequisites

You need a **System User Token** (non-expiring) and your **Ad Account ID**.

| Variable | Description |
| --- | --- |
| `META_ACCESS_TOKEN` | System User Token generated in Business Manager |
| `META_AD_ACCOUNT_ID` | Ad account ID (with or without `act_` prefix) |

### Step 1 — Create a Meta App

1. Go to [developers.facebook.com](https://developers.facebook.com/) → **My Apps** → **Create App**
2. Use case: **Other** → App type: **Business**
3. Name it (e.g. `mcp-meta-ads`), set contact email
4. Associate with your **Business Manager** (Business Portfolio)
5. In the app dashboard, find **Marketing API** and click **Set Up**

### Step 2 — Create a System User

1. Go to [business.facebook.com](https://business.facebook.com/) → **Business Settings**
2. Navigate to **Users → System Users** → click **Add**
3. Name: `mcp-ads-reader` — Role: **Admin**
4. Click the system user → **Add Assets** → **Ad Accounts**
5. Select your ad account → permission level: **View performance**

### Step 3 — Generate the Token

1. On the System User page, click **Generate New Token**
2. Select the app you created in Step 1
3. Check the scopes: **`ads_read`** and **`business_management`**
4. Click **Generate Token**
5. **Copy it immediately** — it's only shown once

### Step 4 — Find your Ad Account ID

Copy from the Ads Manager URL: `act_XXXXXXXXX`, or from Business Settings → Ad Accounts.

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

The server uses a **System User Token** — a non-expiring token generated in Meta Business Manager. No OAuth flow is needed. The token is passed as a query parameter per the Graph API convention.

The token may be invalidated if:
- The app is deactivated or deleted
- The System User is removed from Business Manager
- Permissions are revoked or Meta policies are violated

If this happens, the server returns a clear error message asking you to regenerate the token.

## License

MIT
