# 🔧 Fix MCP Configuration Error

## 🎯 The Problem

Your MCP config file has the wrong structure:

**Wrong:**
```json
{
  "powers": {
    "mcpServers": { ... }
  }
}
```

**Correct:**
```json
{
  "mcpServers": { ... }
}
```

---

## ✅ How to Fix

### Option 1: Manual Fix (Recommended)

1. **Open the file:** `C:/Users/hassa/.kiro/settings/mcp.json`

2. **Replace the entire content with:**

```json
{
  "mcpServers": {
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"],
      "env": {},
      "disabled": false,
      "autoApprove": []
    },
    "supabase": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "https://xfuywackhrzsdtphpdcw.supabase.co",
        "SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmdXl3YWNraHJ6c2R0cGhwZGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMjg3NzQsImV4cCI6MjA4ODcwNDc3NH0.kk3WFY2NQHVzJTikR7GRrKJ-_aG_kRYoo7rIINJsxwQ"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

3. **Save the file**

4. **Restart Kiro**

---

### Option 2: Copy from File

1. **Open:** `FIXED-MCP-CONFIG.json` (in this folder)

2. **Copy all content**

3. **Open:** `C:/Users/hassa/.kiro/settings/mcp.json`

4. **Replace all content** with what you copied

5. **Save the file**

6. **Restart Kiro**

---

## 🎯 What Changed

**Before:**
- Had `powers` wrapper (incorrect)
- Structure: `powers.mcpServers`

**After:**
- No `powers` wrapper (correct)
- Structure: `mcpServers` at root level

---

## ✅ Verification

After fixing and restarting Kiro:

1. The error should be gone
2. MCP servers should work normally
3. You can use Supabase and fetch MCP tools

---

## 📝 Summary

1. Open `C:/Users/hassa/.kiro/settings/mcp.json`
2. Replace content with the correct structure
3. Save and restart Kiro
4. Error should be fixed!
