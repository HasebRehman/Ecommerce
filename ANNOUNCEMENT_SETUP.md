# Announcement Feature Setup Guide

## Issue: 400 Bad Request Error

The error you're seeing is because the `announcements` table doesn't exist in your database yet.

## Solution: Run the Database Migration

You need to create the `announcements` table in your Supabase database. Follow these steps:

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the following SQL:

```sql
-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  subject      TEXT        NOT NULL CHECK (subject <> ''),
  message      TEXT        NOT NULL CHECK (message <> ''),
  scheduled_at TIMESTAMPTZ NOT NULL,
  status       TEXT        NOT NULL DEFAULT 'scheduled'
                           CHECK (status IN ('scheduled', 'published')),
  target_roles TEXT[]      NOT NULL CHECK (array_length(target_roles, 1) > 0),
  created_by   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for cron job: quickly find scheduled announcements past their time
CREATE INDEX IF NOT EXISTS idx_announcements_status_scheduled_at
  ON announcements (status, scheduled_at)
  WHERE status = 'scheduled';

-- Index for active announcements query
CREATE INDEX IF NOT EXISTS idx_announcements_status_target_roles
  ON announcements (status)
  WHERE status = 'published';
```

5. Click **Run** (or press Ctrl+Enter / Cmd+Enter)
6. You should see "Success. No rows returned"

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
cd Ecommerce
supabase db push
```

This will apply all migrations in the `supabase/migrations/` folder.

## Verify the Table Was Created

1. In Supabase Dashboard, go to **Table Editor**
2. Look for the `announcements` table in the list
3. You should see it with columns: id, subject, message, scheduled_at, status, target_roles, created_by, created_at

## Test the Feature

After creating the table:

1. Refresh your admin page
2. Click "Add Announcement"
3. Fill in the form:
   - Subject: Test Announcement
   - Date: Any future date
   - Time: Any time
   - Target Audience: Select at least one role
   - Message: Test message
4. Click "Create Announcement"
5. The announcement should now be created successfully!

## Notes

- **Past dates are now allowed**: If you select a past date/time, the announcement will be published immediately
- **Future dates**: If you select a future date/time, the announcement will be scheduled and published automatically at that time
- **Cron job**: For scheduled announcements to auto-publish, you need to set up the Vercel cron (see vercel.json)
