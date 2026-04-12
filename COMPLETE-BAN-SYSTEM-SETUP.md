# 🔧 Complete Ban System Setup & Troubleshooting

## ⚠️ The Problem

You reported that:
1. ❌ Banned user (hassan) is still logged in
2. ❌ Banned user's products still show on website
3. ❌ BANNED badge not showing on admin page

**Root Cause:** The `is_banned` column might not exist in your Supabase database, OR the ban action wasn't properly executed.

---

## ✅ Complete Setup Steps

### Step 1: Verify Database Column Exists

**Go to Supabase → SQL Editor → Run this:**

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'user_roles' AND column_name = 'is_banned';
```

**Expected Result:**
```
column_name | data_type | column_default
is_banned   | boolean   | false
```

**If you get 0 rows:** The column doesn't exist. Go to Step 2.

---

### Step 2: Add is_banned Column (If Missing)

**Run this in Supabase SQL Editor:**

```sql
-- Add the column
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS user_roles_is_banned_idx 
ON public.user_roles(is_banned) WHERE is_banned = TRUE;

-- Verify it was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_roles' AND column_name = 'is_banned';
```

**Expected Result:** Last query returns 1 row with is_banned column.

---

### Step 3: Check if Hassan is Actually Banned

**Run this:**

```sql
SELECT 
  ur.user_id,
  ur.role,
  ur.is_active,
  ur.is_banned,
  p.full_name,
  p.username,
  p.email
FROM user_roles ur
LEFT JOIN profiles p ON p.id = ur.user_id
WHERE p.username = 'hassan';
```

**Expected Result:**
```
user_id | role | is_active | is_banned | full_name | username | email
...     | ... | true      | true      | Hassan    | hassan   | hassan@gmail.com
```

**If is_banned = false or NULL:** Hassan is NOT banned. Go to Step 4.

---

### Step 4: Manually Ban Hassan

**First, get his user_id:**

```sql
SELECT user_id FROM profiles WHERE username = 'hassan';
```

**Copy the user_id, then run (replace USER_ID_HERE):**

```sql
-- Ban the user
UPDATE user_roles 
SET is_banned = true 
WHERE user_id = 'USER_ID_HERE';

-- Set all his shops to draft/inactive
UPDATE shops 
SET status = 'draft', is_active = false 
WHERE owner_id = 'USER_ID_HERE';

-- Verify
SELECT * FROM user_roles WHERE user_id = 'USER_ID_HERE';
SELECT * FROM shops WHERE owner_id = 'USER_ID_HERE';
```

**Expected Result:**
- is_banned = true
- All shops have status = 'draft' and is_active = false

---

### Step 5: Verify Shops Are Inactive

**Run this:**

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
);
```

**Expected Result:**
```
id | name | status | is_active | owner_id | username
...| ...  | draft  | false     | ...      | hassan
```

**If status = 'live' or is_active = true:** Run Step 4 again.

---

### Step 6: Test Login Prevention

**In your browser (incognito window):**
1. Go to login page
2. Enter: `hassan@gmail.com` and password
3. Click Login

**Expected Result:**
- ❌ Login fails
- ✅ Error message: "You have been permanently banned by the admin team."

**If login succeeds:** The auth check isn't working. Check `/api/auth/login/route.ts`.

---

### Step 7: Test Products Hidden

**In your browser (not logged in):**
1. Go to homepage
2. Check "Featured Products" section
3. Check "Discounted Products" section

**Expected Result:**
- ✅ Hassan's products should NOT appear
- ✅ Hassan's shops should NOT appear

**If products still show:** The API filtering isn't working. Check `/api/store/products/route.ts`.

---

### Step 8: Test BANNED Badge

**In your browser (logged in as Super Admin):**
1. Go to Admin → Users
2. Click on Hassan
3. Look at the top section with his name

**Expected Result:**
- ✅ Red "BANNED" badge next to his name
- ✅ "BANNED" badge in Role field

**If badge doesn't show:** Check `/app/(admin)/admin/users/[id]/page.tsx`.

---

## 🔍 Diagnostic Queries

### Check All Columns in user_roles
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_roles'
ORDER BY ordinal_position;
```

### List All Banned Users
```sql
SELECT 
  ur.user_id,
  ur.role,
  ur.is_banned,
  p.full_name,
  p.username
FROM user_roles ur
LEFT JOIN profiles p ON p.id = ur.user_id
WHERE ur.is_banned = true;
```

### Check Reports with Actions
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
ORDER BY r.created_at DESC;
```

### Check Hassan's Products
```sql
SELECT 
  p.id,
  p.name,
  p.is_active,
  p.owner_id,
  pr.username
FROM products p
LEFT JOIN profiles pr ON pr.id = p.owner_id
WHERE p.owner_id IN (
  SELECT user_id FROM profiles WHERE username = 'hassan'
);
```

---

## 🚨 Troubleshooting

### Problem: is_banned column doesn't exist
**Solution:**
```sql
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;
```

### Problem: Hassan is_banned = false
**Solution:**
```sql
UPDATE user_roles 
SET is_banned = true 
WHERE user_id = (SELECT user_id FROM profiles WHERE username = 'hassan');
```

### Problem: Hassan's shops are still live
**Solution:**
```sql
UPDATE shops 
SET status = 'draft', is_active = false 
WHERE owner_id = (SELECT user_id FROM profiles WHERE username = 'hassan');
```

### Problem: BANNED badge not showing
**Solution:** Check if `is_banned = true` in database first. If yes, refresh admin page.

### Problem: Products still showing
**Solution:** 
1. Verify shops are draft/inactive
2. Clear browser cache
3. Check API response: `curl http://localhost:3000/api/store/products`

---

## 📊 Complete Verification Checklist

Run these queries and share results:

### Query 1: Column Exists?
```sql
SELECT COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'user_roles' AND column_name = 'is_banned';
```
**Expected: 1**

### Query 2: Hassan Banned?
```sql
SELECT is_banned FROM user_roles 
WHERE user_id = (SELECT user_id FROM profiles WHERE username = 'hassan');
```
**Expected: true**

### Query 3: Hassan's Shops Inactive?
```sql
SELECT COUNT(*) as inactive_shops
FROM shops 
WHERE owner_id = (SELECT user_id FROM profiles WHERE username = 'hassan')
  AND status = 'draft' AND is_active = false;
```
**Expected: > 0**

### Query 4: Any Banned Users?
```sql
SELECT COUNT(*) as banned_count
FROM user_roles WHERE is_banned = true;
```
**Expected: > 0**

---

## 🎯 What to Do Now

1. **Run Step 1** - Check if column exists
2. **If column missing, run Step 2** - Add column
3. **Run Step 3** - Check if hassan is banned
4. **If not banned, run Step 4** - Ban him manually
5. **Run Step 5** - Verify shops are inactive
6. **Run Step 6** - Test login
7. **Run Step 7** - Test products hidden
8. **Run Step 8** - Test BANNED badge

---

## 📝 Share These Results With Me

After running all steps, please share:

1. **Result of Step 1** - Does is_banned column exist?
2. **Result of Step 3** - Is hassan is_banned = true?
3. **Result of Step 5** - Are hassan's shops draft/inactive?
4. **Result of Step 6** - Does login fail with error message?
5. **Result of Step 7** - Do products not show?
6. **Result of Step 8** - Does BANNED badge show?

This will help me fix any remaining issues!

---

## ✨ Expected Final State

After all steps:
- ✅ is_banned column exists in user_roles
- ✅ Hassan has is_banned = true
- ✅ Hassan's shops have status = 'draft' and is_active = false
- ✅ Hassan cannot log in
- ✅ Hassan's products don't show on website
- ✅ BANNED badge shows on admin page
- ✅ Reports show "Seller Banned" status

**Then the ban system will be fully working!** 🎉
