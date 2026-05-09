# 🚨 FIX: "Could not find the table named 'announcements'" Error

## The Problem
The `announcements` table doesn't exist in your Supabase database yet.

## The Solution (Takes 2 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project: https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"** button

### Step 2: Copy & Paste This SQL

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

-- Enable Row Level Security
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role has full access"
  ON announcements FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Allow authenticated users to read published announcements
CREATE POLICY "Users can read published announcements"
  ON announcements FOR SELECT TO authenticated
  USING (status = 'published');

-- Allow admins to read all announcements
CREATE POLICY "Admins can read all announcements"
  ON announcements FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('super_admin', 'platform_admin')
    )
  );

-- Create indexes
CREATE INDEX idx_announcements_status_scheduled_at
  ON announcements (status, scheduled_at)
  WHERE status = 'scheduled';

CREATE INDEX idx_announcements_status_target_roles
  ON announcements (status)
  WHERE status = 'published';

CREATE INDEX idx_announcements_created_by
  ON announcements (created_by);

-- Grant permissions
GRANT ALL ON announcements TO service_role;
GRANT SELECT ON announcements TO authenticated;
```

### Step 3: Run the SQL
1. Click the **"Run"** button (or press `Ctrl+Enter` on Windows, `Cmd+Enter` on Mac)
2. Wait for "Success" message

### Step 4: Verify Table Was Created
1. In Supabase Dashboard, click **"Table Editor"** in the left sidebar
2. You should now see **"announcements"** in the list of tables
3. Click on it to see the columns

### Step 5: Test the Feature
1. Go back to your admin page
2. Refresh the page (`F5` or `Ctrl+R`)
3. Click **"Add Announcement"** button
4. Fill in the form and click **"Create Announcement"**
5. ✅ It should work now!

---

## Still Having Issues?

If you still get an error after running the SQL:

1. **Check your Supabase connection**:
   - Make sure `NEXT_PUBLIC_SUPABASE_URL` is correct in your `.env` file
   - Make sure `SUPABASE_SERVICE_ROLE_KEY` is correct in your `.env` file

2. **Restart your development server**:
   ```bash
   # Stop the server (Ctrl+C)
   # Then start it again
   npm run dev
   ```

3. **Check the browser console** (F12) for any additional error messages

4. **Verify the table exists**:
   - Go to Supabase Dashboard → Table Editor
   - Look for "announcements" table
   - If it's not there, run the SQL again
