# Setup Complaints Database - Step by Step Guide

## Problem
The contact form and complaints page are created, but data is not being stored because the `contact_messages` table doesn't exist in Supabase.

## Solution
Create the `contact_messages` table in your Supabase database by running the SQL command.

---

## Step-by-Step Instructions

### Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com](https://supabase.com)
2. Log in to your account
3. Select your project

### Step 2: Open SQL Editor
1. In the left sidebar, click on **"SQL Editor"**
2. Click on **"New query"** button

### Step 3: Copy and Paste SQL Command
1. Open the file: `Ecommerce/CREATE_CONTACT_MESSAGES_TABLE.sql`
2. Copy ALL the SQL code from that file
3. Paste it into the Supabase SQL Editor

### Step 4: Run the SQL Command
1. Click the **"Run"** button (or press Ctrl+Enter / Cmd+Enter)
2. Wait for the query to complete
3. You should see a success message: "Success. No rows returned"

### Step 5: Verify Table Creation
1. In the left sidebar, click on **"Table Editor"**
2. You should now see a table named **"contact_messages"**
3. Click on it to view the table structure

---

## What This SQL Does

### Creates Table
```sql
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  read BOOLEAN DEFAULT false,
  replied BOOLEAN DEFAULT false
);
```

**Columns:**
- `id` - Unique identifier for each message
- `name` - User's full name from contact form
- `email` - User's email address
- `message` - User's message
- `created_at` - Timestamp when message was submitted
- `read` - Whether admin has read the message (default: false)
- `replied` - Whether admin has replied (default: false)

### Creates Indexes
```sql
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX idx_contact_messages_read ON contact_messages(read);
```

**Purpose:** Makes queries faster when sorting by date or filtering by read status

### Enables Row Level Security (RLS)
```sql
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
```

**Purpose:** Protects data with access control policies

### Creates Security Policies

**Policy 1: Anyone can submit contact form**
```sql
CREATE POLICY "Anyone can submit contact form"
  ON contact_messages
  FOR INSERT
  TO public
  WITH CHECK (true);
```
- Allows anyone (even non-logged-in users) to submit the contact form

**Policy 2: Only admins can view messages**
```sql
CREATE POLICY "Only admins can view contact messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('super_admin', 'platform_admin', 'operations_admin')
    )
  );
```
- Only super_admin, platform_admin, and operations_admin can view messages

**Policy 3: Only admins can update messages**
```sql
CREATE POLICY "Only admins can update contact messages"
  ON contact_messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('super_admin', 'platform_admin', 'operations_admin')
    )
  );
```
- Only admins can mark messages as read/unread

---

## Testing After Setup

### Test 1: Submit Contact Form
1. Go to your website's contact page: `/contact`
2. Fill out the form:
   - Name: Test User
   - Email: test@example.com
   - Message: This is a test message
3. Click "Send Message"
4. You should see: "Thank you for contacting us! We will get back to you soon."

### Test 2: Check Database
1. Go back to Supabase Dashboard
2. Click on "Table Editor" in sidebar
3. Click on "contact_messages" table
4. You should see your test message in the table

### Test 3: View in Complaints Page
1. Log in to your website as super_admin or operations_admin
2. Click "Complaints" in the sidebar
3. You should see your test message displayed in a card
4. Try clicking "Mark Read" button
5. The card should change appearance (green badge)

---

## Troubleshooting

### Issue: "relation 'contact_messages' does not exist"
**Solution:** The table wasn't created. Run the SQL command again.

### Issue: "permission denied for table contact_messages"
**Solution:** RLS policies might not be set correctly. Run the SQL command again to recreate policies.

### Issue: Contact form submits but no data appears
**Solution:** 
1. Check browser console for errors (F12)
2. Verify the table exists in Supabase
3. Check that RLS policies allow INSERT for public

### Issue: Admin can't see complaints
**Solution:**
1. Verify you're logged in as super_admin or operations_admin
2. Check that the SELECT policy exists
3. Verify your user has the correct role in user_roles table

---

## Complete SQL Command (Copy This)

```sql
-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  read BOOLEAN DEFAULT false,
  replied BOOLEAN DEFAULT false
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_read ON contact_messages(read);

-- Enable Row Level Security
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (submit contact form)
CREATE POLICY "Anyone can submit contact form"
  ON contact_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Only admins can view contact messages
CREATE POLICY "Only admins can view contact messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('super_admin', 'platform_admin', 'operations_admin')
    )
  );

-- Policy: Only admins can update contact messages
CREATE POLICY "Only admins can update contact messages"
  ON contact_messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('super_admin', 'platform_admin', 'operations_admin')
    )
  );

-- Add comment
COMMENT ON TABLE contact_messages IS 'Stores contact form submissions from users';
```

---

## After Running SQL

### What You Can Do:
1. ✅ Users can submit contact forms
2. ✅ Messages are stored in database
3. ✅ Super admin can view complaints
4. ✅ Operations admin can view complaints
5. ✅ Admins can mark messages as read/unread
6. ✅ Statistics show total, unread, and read counts

### What's Protected:
1. 🔒 Only admins can view messages
2. 🔒 Only admins can update read status
3. 🔒 Platform admin, business owners, and customers cannot access
4. 🔒 Data is secure with Row Level Security

---

## Summary

**File to Use:** `Ecommerce/CREATE_CONTACT_MESSAGES_TABLE.sql`

**Steps:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the SQL from the file
4. Click "Run"
5. Verify table appears in Table Editor
6. Test contact form
7. Check complaints page

**That's it!** Your contact form and complaints page will now work perfectly! 🎉
