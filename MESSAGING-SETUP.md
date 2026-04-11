# Admin Messaging System - Setup & Troubleshooting

## 🚀 Quick Setup

The admin messaging system is fully implemented, but requires a database table to be created.

### Step 1: Create the Database Table

You need to run a SQL migration in your Supabase database.

**Option A: Supabase Dashboard (Easiest)**

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Open the file: `supabase-migrations/create-admin-messages-table.sql`
6. Copy all the SQL code
7. Paste it into the Supabase SQL editor
8. Click **Run** (or press Ctrl+Enter)

**Option B: Using Supabase CLI**

```bash
cd Ecommerce
supabase db push
```

### Step 2: Verify Setup (Optional)

Run the test script to verify everything is configured correctly:

```bash
cd Ecommerce
node scripts/test-admin-messages-db.js
```

### Step 3: Test the Messaging System

1. Log in as an admin (super_admin, platform_admin, or operations_admin)
2. Navigate to `/admin/messages`
3. Select another admin from the left panel
4. Send a test message
5. The message should appear instantly in the chat

---

## 🔧 Troubleshooting

### Issue: "Message stays in input field, doesn't send"

**Cause**: The `admin_messages` table doesn't exist in your database.

**Solution**: Run the SQL migration (see Step 1 above)

**How to verify**: 
- Open browser console (F12)
- Try sending a message
- Look for error messages
- If you see "relation does not exist" or "admin_messages", the table is missing

---

### Issue: "Messages don't appear in real-time"

**Possible causes:**

1. **Realtime not enabled for the table**
   - Solution: Make sure you ran the full migration SQL, including the line:
     ```sql
     ALTER PUBLICATION supabase_realtime ADD TABLE admin_messages;
     ```

2. **Realtime not enabled in Supabase project**
   - Go to Supabase Dashboard → Database → Replication
   - Make sure `admin_messages` table is listed and enabled

3. **Browser tab in background**
   - Some browsers throttle WebSocket connections when tab is inactive
   - Try keeping both admin tabs visible side-by-side

---

### Issue: "Unauthorized" or "Forbidden" errors

**Cause**: User is not logged in as an admin, or role is not set correctly.

**Solution**: 
1. Verify you're logged in with an admin account
2. Check the `user_roles` table in Supabase to confirm the user has one of these roles:
   - `super_admin`
   - `platform_admin`
   - `operations_admin`

---

### Issue: "Cannot read messages from other admins"

**Cause**: Row Level Security (RLS) policies not set up correctly.

**Solution**: Re-run the migration SQL to ensure RLS policies are created.

---

## 📊 Database Schema

The `admin_messages` table structure:

```sql
CREATE TABLE admin_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   uuid NOT NULL REFERENCES auth.users(id),
  receiver_id uuid NOT NULL REFERENCES auth.users(id),
  message     text NOT NULL,
  is_read     boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);
```

---

## 🧪 Testing with Multiple Admins

To test the messaging system properly:

1. **Open two browser windows** (or use incognito mode for second window)
2. **Window 1**: Log in as `superadmin@gmail.com` (password: `Superadmin123`)
3. **Window 2**: Log in as `platformadmin@gmail.com` (password: `Platformadmin123`)
4. **Both windows**: Navigate to `/admin/messages`
5. **Window 1**: Select "Platform Admin" from the list
6. **Window 2**: Select "Super Admin" from the list
7. **Send messages** from either window - they should appear instantly in both

---

## 📝 Features Implemented

✅ Admin-to-admin real-time messaging
✅ WhatsApp-style chat interface
✅ Unread message badges
✅ Message history persistence
✅ Auto-scroll to latest message
✅ Typing indicator (Enter to send)
✅ Online/offline status
✅ Message timestamps
✅ Conversation grouping by time
✅ Search admins by name
✅ Mark messages as read automatically
✅ Responsive design

---

## 🔐 Security

- Only admins can access the messaging system
- Row Level Security (RLS) ensures users can only see their own messages
- Messages are encrypted in transit (HTTPS)
- Service role key used for admin operations (bypasses RLS when needed)

---

## 📞 Need Help?

If you're still experiencing issues:

1. Check browser console for error messages (F12 → Console tab)
2. Check Supabase logs (Dashboard → Logs)
3. Verify environment variables in `.env` file
4. Run the test script: `node scripts/test-admin-messages-db.js`
5. Make sure you're using the latest code (no cached files)

---

## 🎯 Admin Test Accounts

Use these accounts for testing:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@gmail.com | Superadmin123 |
| Platform Admin | platformadmin@gmail.com | Platformadmin123 |
| Operations Admin | operationadmin@gmail.com | Operationadmin123 |
