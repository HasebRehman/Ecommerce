# ⚡ MCP Quick Fix

## 🎯 The Problem

Supabase MCP connection is failing because:
1. Using ANON_KEY instead of SERVICE_ROLE_KEY
2. Wrong config structure

---

## ✅ The Fix (2 Minutes)

### Step 1: Open File
```
C:/Users/hassa/.kiro/settings/mcp.json
```

### Step 2: Replace Content

Delete everything and paste this:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "https://xfuywackhrzsdtphpdcw.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmdXl3YWNraHJ6c2R0cGhwZGN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzEyODc3NCwiZXhwIjoyMDg4NzA0Nzc0fQ.EIv_XSZHTZAXDGr_tLI0qF6PYYQhzsaM7y7P9RRIZWM"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### Step 3: Save & Restart

Save the file and restart Kiro.

---

## ✅ Done!

Connection should work now! 🎉
