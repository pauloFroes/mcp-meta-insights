# mcp-meta-ads

MCP server that wraps the [Meta Marketing API](https://developers.facebook.com/docs/marketing-apis/) (Graph API v25.0) as semantic tools for LLM agents.

Works with **Claude Code**, **Codex**, **Claude Desktop**, **Cursor**, **VS Code**, **Windsurf**, and any MCP-compatible client.

---

## Prerequisites

You need a Meta access token with `ads_read` permission and your Ad Account ID.

| Variable | Description |
| --- | --- |
| `META_ACCESS_TOKEN` | User token, long-lived token, or System User token |
| `META_AD_ACCOUNT_ID` | Ad account ID (with or without `act_` prefix) |

### Getting your credentials

1. Go to [Meta Business Suite](https://business.facebook.com/) → Settings → Users → System Users
2. Create a System User with `ads_read` permission
3. Generate a token — this won't expire
4. Copy your Ad Account ID from Ads Manager URL: `act_XXXXXXXXX`

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

The server uses a static Bearer token (no OAuth flow). Pass your `META_ACCESS_TOKEN` as an environment variable. The token is sent as a query parameter per the Graph API convention.

For production use, create a **System User** token in Business Manager — these don't expire.

## License

MIT
