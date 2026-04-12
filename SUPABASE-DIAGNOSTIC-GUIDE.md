# 🔍 Supabase Diagnostic Guide - Ban System Issues

## 📋 Step-by-Step Instructions

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project: https://app.supabase.com
2. Click on your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**

---

### Step 2: Run Diagnostic Query 1 - Check if is_banned Column Exists

**Copy and paste this:**
```sql
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_roles' 
  AND column_name = 'is_banned'
ORDER BY ordinal_position;
```

**Click Run**

**Expected Result:**
- If column exists: You'll see 1 row with `is_banned` column details
- If column doesn't exist: You'll see 0 rows (THIS IS THE PROBLEM!)

**⚠️ If you get 0 rows, the column doesn't exist. Go to Step 3.**

---

### Step 3: Check All Columns in user_roles Table

**Copy and paste this:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_roles'
ORDER BY ordinal_position;
```

**Click Run**

**Expected Result:**
You should see columns like:
- id
- user_id
- role
- is_active
- is_banned ← **THIS SHOULD BE HERE**
- created_at
- updated_at

**⚠️ If `is_banned` is NOT in the list, you need to add it. Go to Step 4.**

---

### Step 4: Add is_banned Column (IF IT DOESN'T EXIST)

**Copy and paste this:**
```sql
-- Add is_banned column if it doesn't exist
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS user_roles_is_banned_idx 
ON public.user_roles(is_banned) WHERE is_banned = TRUE;
```

**Click Run**

**Expected Result:**
- Success message: "ALTER TABLE" and "CREATE INDEX"

**✅ Now the column exists!**

---

### Step 5: Check if Hassan is Banned

**Copy and paste this:**
```sql
SELECT 
  ur.user_id,
  ur.role,
  ur.is_active,
  ur.is_banned,
  p.full_name,
  p.username
FROM user_roles ur
LEFT JOIN profiles p ON p.id = ur.user_id
WHERE p.username = 'hassan' OR p.full_name LIKE '%hassan%'
LIMIT 10;
```

**Click Run**

**Expected Result:**
You should see hassan's record with:
- `is_banned` = **true** (if banned)
- `is_banned` = **false** (if not banned)

**⚠️ If `is_banned` is false or NULL, hassan is NOT banned in the database!**

---

### Step 6: List ALL Banned Users

**Copy and paste this:**
```sql
SELECT 
  ur.user_id,
  ur.role,
  ur.is_active,
  ur.is_banned,
  p.full_name,
  p.username
FROM user_roles ur
LEFT JOIN profiles p ON p.id = ur.user_id
WHERE ur.is_banned = true
ORDER BY ur.created_at DESC;
```

**Click Run**

**Expected Result:**
- If there are banned users, you'll see them listed
- If no results, NO USERS ARE BANNED

---

### Step 7: Check Hassan's Shops

**Copy and paste this:**
```sql
SELECT 
  s.id,
  s.name,
  s.status,
  s.is_active,
  s.owner_id,
  p.username
FROM shops s
LEFT JOIN profiles p ON p.id = s.owner_id
WHERE s.owner_id IN (
  SELECT user_id FROM profiles WHERE username = 'hassan'
)
ORDER BY s.created_at DESC;
```

**Click Run**

**Expected Result:**
- If hassan is banned, shops should have `status = 'draft'` and `is_active = false`
- If shops are still `status = 'live'` and `is_active = true`, they weren't set to draft

---

### Step 8: Check Hassan's Products

**Copy and paste this:**
```sql
SELECT 
  p.id,
  p.name,
  p.is_active,
  p.owner_id,
  pr.username,
  COUNT(sp.product_id) as in_shops
FROM products p
LEFT JOIN profiles pr ON pr.id = p.owner_id
LEFT JOIN shop_products sp ON sp.product_id = p.id
WHERE p.owner_id IN (
  SELECT user_id FROM profiles WHERE username = 'hassan'
)
GROUP BY p.id, p.name, p.is_active, p.owner_id, pr.username
ORDER BY p.created_at DESC;
```

**Click Run**

**Expected Result:**
- You should see hassan's products
- Check if they're still `is_active = true` (they should be, but shops should be inactive)

---

### Step 9: Check Reports Status

**Copy and paste this:**
```sql
SELECT 
  r.id,
  r.reason,
  r.status,
  r.created_at,
  p.username as reporter,
  s.name as shop_name
FROM reports r
LEFT JOIN profiles p ON p.id = r.user_id
LEFT JOIN shops s ON s.id = r.shops
WHERE r.status IN ('seller_banned', 'warning_issued', 'neglected')
ORDER BY r.created_at DESC
LIMIT 20;
```

**Click Run**

**Expected Result:**
- You should see reports with status `seller_banned`
- If no results, no reports have been actioned yet

---

### Step 10: Check Auth Users Table

**Copy and paste this:**
```sql
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  banned_until
FROM auth.users
WHERE email LIKE '%hassan%'
LIMIT 5;
```

**Click Run**

**Expected Result:**
- If hassan is banned, `banned_until` should be set to a future date
- If `banned_until` is NULL, he's not banned in auth

---

## 🔧 If is_banned Column Doesn't Exist

Run this complete migration:

```sql
-- 1. Add is_banned column
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

-- 2. Create index
CREATE INDEX IF NOT EXISTS user_roles_is_banned_idx 
ON public.user_roles(is_banned) WHERE is_banned = TRUE;

-- 3. Verify it was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_roles' 
  AND column_name = 'is_banned';
```

---

## 🔧 If Hassan is NOT Banned in Database

Run this to manually ban hassan:

```sql
-- Find hassan's user_id
SELECT user_id FROM profiles WHERE username = 'hassan';

-- Ban hassan (replace USER_ID with the actual ID from above)
UPDATE user_roles 
SET is_banned = true 
WHERE user_id = 'USER_ID_HERE';

-- Set his shops to draft
UPDATE shops 
SET status = 'draft', is_active = false 
WHERE owner_id = 'USER_ID_HERE';

-- Verify
SELECT * FROM user_roles WHERE user_id = 'USER_ID_HERE';
```

---

## 📊 Complete Diagnostic Summary

After running all queries, you should have:

| Check | Expected | Actual |
|-------|----------|--------|
| is_banned column exists | ✅ Yes | ? |
| Hassan is_banned = true | ✅ Yes | ? |
| Hassan's shops status = draft | ✅ Yes | ? |
| Hassan's shops is_active = false | ✅ Yes | ? |
| Reports show seller_banned status | ✅ Yes | ? |

---

## 🚨 Common Issues & Solutions

### Issue 1: is_banned column doesn't exist
**Solution:** Run the migration in Step 4

### Issue 2: Hassan is_banned = false
**Solution:** Run the manual ban command above

### Issue 3: Hassan's shops are still live
**Solution:** Run this:
```sql
UPDATE shops 
SET status = 'draft', is_active = false 
WHERE owner_id = (SELECT user_id FROM profiles WHERE username = 'hassan');
```

### Issue 4: Reports don't show seller_banned status
**Solution:** The report action might not have been executed. Try banning again from admin panel.

---

## 📝 Share Your Results

After running these queries, please share:
1. Results from Step 2 (all columns in user_roles)
2. Results from Step 5 (is hassan banned?)
3. Results from Step 6 (list of banned users)
4. Results from Step 7 (hassan's shops status)

This will help me identify exactly what's wrong and fix it!
