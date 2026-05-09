# 🚨 FIX: Announcement Creation Error (400 Bad Request)

## Error You're Seeing
```
Could not find the table named 'announcements' in the schema 'public'
Status Code: 400 Bad Request
```

## Root Cause
The `announcements` table doesn't exist in your Supabase database yet. The code is ready, but the database table needs to be created.

---

## ✅ SOLUTION (Choose One Method)

### Method 1: Using Supabase Dashboard (RECOMMENDED - Takes 2 minutes)

#### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"** button (top right)

#### Step 2: Copy This Entire SQL Code

```sql
-- Create announcements table
DROP TABLE IF EXISTS announcements CASCADE;

CREATE TABLE announcements (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  subject      TEXT        NOT NULL CHECK (subject <> ''),
  message      TEXT        NOT NULL CHECK (message <> ''),
  scheduled_at TIMESTAMPTZ NOT NULL,
  status       TEXT        NOT NULL DEFAULT 'scheduled'
                           CHECK (status IN ('scheduled', 'published')),
  target_roles TEXT[]      NOT NULL CHECK (array_length(target_roles, 1) > 0),
  created_by   UUID        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access"
  ON announcements FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Users can read published announcements"
  ON announcements FOR SELECT TO authenticated
  USING (status = 'published');

CREATE POLICY "Admins can read all announcements"
  ON announcements FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('super_admin', 'platform_admin')
    )
  );

CREATE INDEX idx_announcements_status_scheduled_at
  ON announcements (status, scheduled_at)
  WHERE status = 'scheduled';

CREATE INDEX idx_announcements_status_target_roles
  ON announcements (status)
  WHERE status = 'published';

CREATE INDEX idx_announcements_created_by
  ON announcements (created_by);

GRANT ALL ON announcements TO service_role;
GRANT SELECT ON announcements TO authenticated;
```

#### Step 3: Run the SQL
1. Paste the SQL code into the editor
2. Click **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)
3. Wait for "Success. No rows returned" message

#### Step 4: Verify Table Was Created
1. In Supabase Dashboard, click **"Table Editor"** in the left sidebar
2. Look for **"announcements"** in the list of tables
3. Click on it - you should see columns: id, subject, message, scheduled_at, status, target_roles, created_by, created_at

#### Step 5: Test the Feature
1. Go back to your admin page in the browser
2. **Refresh the page** (F5 or Ctrl+R)
3. Click **"Add Announcement"** button
4. Fill in the form:
   - Subject: "Test Announcement"
   - Date: Select any date
   - Time: Select any time
   - Target Audience: Check at least one role
   - Message: "This is a test message"
5. Click **"Create Announcement"**
6. ✅ **It should work now!**

---

### Method 2: Using Supabase CLI (If you have it installed)

```bash
cd Ecommerce
supabase db push
```

This will apply all migrations in the `supabase/migrations/` folder.

---

## 🔍 Verify Everything is Working

### Option 1: Use the Checker Tool
1. Open `check-announcements-table.html` in your browser
2. Click "Check Table Status"
3. It will tell you if the table exists or not

### Option 2: Manual Check
1. Try creating an announcement from the admin panel
2. If it works → ✅ Success!
3. If you still get an error → See troubleshooting below

---

## 🐛 Troubleshooting

### Still Getting 400 Error After Running SQL?

1. **Verify the table exists:**
   - Supabase Dashboard → Table Editor
   - Look for "announcements" table
   - If not there, run the SQL again

2. **Check your environment variables:**
   - Open `Ecommerce/.env`
   - Verify these are correct:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
     ```

3. **Restart your development server:**
   ```bash
   # Stop the server (Ctrl+C in terminal)
   # Then start again
   npm run dev
   ```

4. **Clear browser cache:**
   - Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
   - Clear cached images and files
   - Or try in Incognito/Private mode

5. **Check browser console for errors:**
   - Press F12 to open Developer Tools
   - Go to Console tab
   - Look for any red error messages
   - Share them if you need more help

### Getting "Unauthorized" or "Forbidden" Error?

- Make sure you're logged in as **Super Admin** or **Platform Admin**
- Other roles cannot create announcements

### Table Exists But Still Getting Error?

- Check if RLS policies are enabled:
  - Supabase Dashboard → Table Editor → announcements
  - Click on the table
  - Go to "Policies" tab
  - You should see 3 policies listed
  - If not, run the SQL code again

---

## 📋 What This Feature Does

Once the table is created, you'll be able to:

✅ Create announcements with subject, message, date, and time
✅ Target specific user roles (Super Admin, Platform Admin, Operations Admin, Seller, Customer)
✅ Schedule announcements for future dates (auto-publish when time comes)
✅ Create immediate announcements (past dates are auto-published)
✅ View all announcements on the admin page
✅ See published announcements on dashboards (for targeted roles)
✅ Customers see announcements in notification bell

---

## 🎯 Quick Summary

**The Problem:** Database table doesn't exist
**The Solution:** Run the SQL code in Supabase Dashboard
**Time Required:** 2 minutes
**Difficulty:** Easy (just copy & paste)

After running the SQL, the feature will work perfectly! 🎉
