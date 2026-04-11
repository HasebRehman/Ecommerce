# Database Migrations

This folder contains SQL migration scripts for your Supabase database.

## How to Run Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of the migration file you want to run
5. Paste it into the SQL editor
6. Click **Run** or press `Ctrl+Enter`

### Option 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push
```

## Available Migrations

### create-admin-messages-table.sql

Creates the `admin_messages` table for the admin-to-admin messaging system.

**What it does:**
- Creates `admin_messages` table with proper schema
- Adds indexes for performance
- Sets up Row Level Security (RLS) policies
- Enables realtime subscriptions

**Run this if:**
- Messages are not being sent/received in the admin messaging page
- You see errors about `admin_messages` table not existing
- This is your first time setting up the messaging feature

## Troubleshooting

If you encounter errors:

1. **Table already exists**: Safe to ignore, or drop the table first with `DROP TABLE IF EXISTS admin_messages CASCADE;`
2. **Permission denied**: Make sure you're logged in as the database owner
3. **Realtime not working**: Verify realtime is enabled in your Supabase project settings
