# 🔧 Fix Supabase MCP Connection

## 🎯 The Issues

1. ❌ Using **ANON_KEY** instead of **SERVICE_ROLE_KEY**
2. ❌ Wrong config structure (`powers.mcpServers` instead of `mcpServers`)
3. ❌ Missing `-y` flag in npx command

---

## ✅ The Fix

### Step 1: Update MCP Config

**Open:** `C:/Users/hassa/.kiro/settings/mcp.json`

**Replace ALL content with:**

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

**Save the file**

---

### Step 2: Restart Kiro

Close and reopen Kiro completely.

---

### Step 3: Verify Connection

After restart, check the logs. You should see:
- ✅ `[supabase] MCP connection established`
- ✅ No more "Connection closed" errors

---

## 🔑 Key Changes

### 1. Service Role Key (Not Anon Key)

**Before:**
```json
"SUPABASE_ANON_KEY": "eyJ..."
```

**After:**
```json
"SUPABASE_SERVICE_ROLE_KEY": "eyJ..."
```

**Why:** The MCP server needs admin access to query your database.

### 2. Added `-y` Flag

**Before:**
```json
"args": ["@modelcontextprotocol/server-supabase"]
```

**After:**
```json
"args": ["-y", "@modelcontextprotocol/server-supabase"]
```

**Why:** The `-y` flag automatically installs the package if not found.

### 3. Fixed Structure

**Before:**
```json
{
  "powers": {
    "mcpServers": { ... }
  }
}
```

**After:**
```json
{
  "mcpServers": { ... }
}
```

**Why:** Kiro expects `mcpServers` at the root level.

---

## 🧪 Test the Connection

After fixing and restarting:

1. **Open Kiro**
2. **Check logs** (should see successful connection)
3. **Try using Supabase MCP tools**

---

## 📝 Files

- `CORRECT-MCP-CONFIG.json` - Copy from this file
- `FIX-SUPABASE-MCP.md` - This guide

---

## ✅ Summary

1. Open `C:/Users/hassa/.kiro/settings/mcp.json`
2. Replace with content from `CORRECT-MCP-CONFIG.json`
3. Save and restart Kiro
4. Connection should work!

---

## 🆘 If Still Not Working

Check:
1. Is Node.js installed? (`node --version`)
2. Is npm installed? (`npm --version`)
3. Can you run `npx -y @modelcontextprotocol/server-supabase` in terminal?

If any of these fail, install Node.js first.
