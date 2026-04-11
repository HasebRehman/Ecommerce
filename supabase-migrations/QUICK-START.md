# Quick Start: Admin Messaging Setup

## ⚡ 3-Step Setup (Takes 2 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Select your project: `xfuywackhrzsdtphpdcw`
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"** button

### Step 2: Run the Migration

1. Open this file: `create-admin-messages-table.sql`
2. Copy ALL the SQL code (Ctrl+A, Ctrl+C)
3. Paste into Supabase SQL Editor (Ctrl+V)
4. Click **"Run"** button (or press Ctrl+Enter)
5. Wait for "Success" message

### Step 3: Verify Setup

**Option A: Quick Test (Recommended)**

```bash
npm run test:messaging-db
```

**Option B: Manual Test**

1. Log in as admin: `superadmin@gmail.com` / `Superadmin123`
2. Go to: http://localhost:3000/admin/messages
3. If you see a red error banner → migration didn't run
4. If you see admin list → setup successful!

---

## 🎯 What the Migration Does

The SQL script creates:

✅ `admin_messages` table with proper schema
✅ Indexes for fast queries
✅ Row Level Security (RLS) policies
✅ Realtime subscriptions

---

## ❓ Troubleshooting

### "Table already exists" error

This is fine! It means the table was already created. You can:
- Ignore the error, or
- Drop the table first: `DROP TABLE IF EXISTS admin_messages CASCADE;`

### "Permission denied" error

Make sure you're logged into Supabase as the project owner.

### Migration runs but messages still don't send

1. Check browser console (F12) for errors
2. Verify realtime is enabled:
   - Supabase Dashboard → Database → Replication
   - Look for `admin_messages` in the list
   - Make sure it's checked/enabled

3. Try refreshing the page (Ctrl+R)

### Still not working?

Run the diagnostic script:

```bash
npm run test:messaging-db
```

This will tell you exactly what's wrong.

---

## 📋 SQL Script Preview

```sql
-- Creates the table
CREATE TABLE IF NOT EXISTS admin_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   uuid NOT NULL REFERENCES auth.users(id),
  receiver_id uuid NOT NULL REFERENCES auth.users(id),
  message     text NOT NULL,
  is_read     boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Adds indexes for performance
CREATE INDEX ON admin_messages (sender_id, receiver_id);
CREATE INDEX ON admin_messages (receiver_id, is_read);

-- Enables realtime
ALTER PUBLICATION supabase_realtime ADD TABLE admin_messages;

-- ... and more (RLS policies, etc.)
```

---

## ✅ Success Indicators

You'll know it worked when:

1. ✅ SQL Editor shows "Success. No rows returned"
2. ✅ No red error banner on `/admin/messages` page
3. ✅ You can see other admins in the left panel
4. ✅ Messages send instantly when you press Enter
5. ✅ Messages appear in both sender and receiver windows

---

## 🧪 Test with Multiple Admins

Open two browser windows:

**Window 1:**
- Email: `superadmin@gmail.com`
- Password: `Superadmin123`

**Window 2:**
- Email: `platformadmin@gmail.com`
- Password: `Platformadmin123`

Both go to: `/admin/messages`

Send messages back and forth - they should appear instantly!

---

## 📞 Need More Help?

See the full guide: `MESSAGING-SETUP.md`
