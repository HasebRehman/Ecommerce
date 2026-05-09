# Quick Setup - Complaints Database

## 🚀 Quick Steps

### 1. Open Supabase
- Go to [supabase.com](https://supabase.com)
- Login and select your project

### 2. Open SQL Editor
- Click **"SQL Editor"** in left sidebar
- Click **"New query"**

### 3. Run This SQL

```sql
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  read BOOLEAN DEFAULT false,
  replied BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_read ON contact_messages(read);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact form"
  ON contact_messages FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Only admins can view contact messages"
  ON contact_messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('super_admin', 'platform_admin', 'operations_admin')
    )
  );

CREATE POLICY "Only admins can update contact messages"
  ON contact_messages FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('super_admin', 'platform_admin', 'operations_admin')
    )
  );
```

### 4. Click "Run" Button
- Wait for success message
- Done! ✅

---

## 🧪 Test It

1. **Submit Form**: Go to `/contact` and submit a message
2. **Check Database**: Go to Supabase → Table Editor → contact_messages
3. **View Complaints**: Login as admin → Click "Complaints" in sidebar

---

## 📋 Table Structure

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Unique identifier |
| name | TEXT | User's full name |
| email | TEXT | User's email |
| message | TEXT | User's message |
| created_at | TIMESTAMPTZ | Submission time |
| read | BOOLEAN | Read status (default: false) |
| replied | BOOLEAN | Reply status (default: false) |

---

## 🔒 Security

- ✅ Anyone can submit contact form
- ✅ Only admins can view messages
- ✅ Only admins can update read status
- ✅ Row Level Security enabled

---

## ✨ Features

- Contact form on `/contact` page
- Complaints page at `/admin/complaints`
- Visible to super_admin and operations_admin
- Mark as read/unread functionality
- Statistics (Total, Unread, Read)
- Responsive design

---

## 📁 Files

- SQL: `Ecommerce/CREATE_CONTACT_MESSAGES_TABLE.sql`
- Guide: `Ecommerce/SETUP_COMPLAINTS_DATABASE.md`
- Page: `Ecommerce/app/(admin)/admin/complaints/page.tsx`
- API: `Ecommerce/app/api/admin/complaints/route.ts`
