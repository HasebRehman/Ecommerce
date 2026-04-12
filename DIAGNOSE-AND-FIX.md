# 🔍 Diagnose and Fix - Ban System

## 🎯 Current Situation

You ran the SQL command and the column was added, but:
- ❌ Seller is not logged out
- ❌ Products still showing
- ❌ BANNED badge not showing

---

## 📋 Step 1: Check if Ban Actually Happened

Run this in Supabase SQL Editor:

```sql
-- Check the most recent business owner
SELECT 
  ur.user_id,
  ur.role,
  ur.is_banned,
  p.full_name,
  p.username
FROM user_roles ur
LEFT JOIN profiles p ON p.id = ur.user_id
WHERE ur.role = 'business_owner'
ORDER BY ur.created_at DESC
LIMIT 5;
```

**Look for your new seller. Is `is_banned = true`?**

- ✅ If YES → Go to Step 2
- ❌ If NO → Go to Step 3

---

## 📋 Step 2: Check if Shops Were Set to Inactive

```sql
-- Check recent shops
SELECT 
  s.id,
  s.name,
  s.status,
  s.is_active,
  s.owner_id,
  p.username
FROM shops s
LEFT JOIN profiles p ON p.id = s.owner_id
ORDER BY s.created_at DESC
LIMIT 5;
```

**Look for your seller's shop. Is `status = 'draft'` and `is_active = false`?**

- ✅ If YES → Go to Step 4
- ❌ If NO → Go to Step 3

---

## 📋 Step 3: The Ban Didn't Work - Fix the Code

**The issue:** The regular Supabase client doesn't have permission to update `user_roles`.

**The fix:** I've already updated the code to use the admin client.

**What I changed:**
- File: `app/api/admin/reports/[id]/route.ts`
- Changed: Use `adminClient` instead of `supabase` for ban operations

**Now restart your app:**
```bash
# Stop your dev server (Ctrl+C)
# Start it again
npm run dev
```

**Then try banning again:**
1. Go to Admin → Reports
2. Open the report
3. Select "Ban Seller"
4. Click Save

**Then run Step 1 again to verify**

---

## 📋 Step 4: Ban Worked, But Seller Still Logged In

**This is normal!** The seller will be logged out on:
- Next page refresh
- Next navigation
- Next API call

**To force logout:**
1. Have the seller refresh the page
2. Or have them navigate to another page
3. They will be logged out automatically

**To test login prevention:**
1. Open incognito window
2. Try to login as the banned seller
3. Should see error: "You have been permanently banned by the admin team."

---

## 📋 Step 5: Products Still Showing

**Check if shops are inactive:**

```sql
-- Replace 'SELLER_USERNAME' with actual username
SELECT 
  s.id,
  s.name,
  s.status,
  s.is_active
FROM shops s
LEFT JOIN profiles p ON p.id = s.owner_id
WHERE p.username = 'SELLER_USERNAME';
```

**If shops are still `status = 'live'` or `is_active = true`:**

The ban didn't execute properly. Restart your app and try again.

**If shops are `status = 'draft'` and `is_active = false`:**

Clear your browser cache and refresh the homepage.

---

## 📋 Step 6: BANNED Badge Not Showing

**Check if user is actually banned:**

```sql
-- Replace 'SELLER_USERNAME' with actual username
SELECT 
  ur.is_banned,
  p.username
FROM user_roles ur
LEFT JOIN profiles p ON p.id = ur.user_id
WHERE p.username = 'SELLER_USERNAME';
```

**If `is_banned = true`:**

1. Go to Admin → Users
2. Click on the seller
3. Refresh the page (Ctrl+F5 or Cmd+Shift+R)
4. Clear browser cache
5. The BANNED badge should appear

**If `is_banned = false`:**

The ban didn't work. Restart your app and try again.

---

## 🔧 Quick Fix Commands

### If Ban Didn't Work - Manual Fix

```sql
-- Replace 'SELLER_USER_ID' with the actual user_id
UPDATE user_roles 
SET is_banned = true 
WHERE user_id = 'SELLER_USER_ID';

UPDATE shops 
SET status = 'draft', is_active = false 
WHERE owner_id = 'SELLER_USER_ID';
```

### Get Seller's User ID

```sql
-- Replace 'SELLER_USERNAME' with actual username
SELECT id FROM profiles WHERE username = 'SELLER_USERNAME';
```

---

## ✅ Verification Checklist

After fixing, verify:

- [ ] Run Step 1: `is_banned = true` ✅
- [ ] Run Step 2: `status = 'draft'` and `is_active = false` ✅
- [ ] Seller cannot login (error message) ✅
- [ ] Products don't show on homepage ✅
- [ ] BANNED badge shows on admin page ✅

---

## 🎯 Most Likely Issue

**The code wasn't using the admin client.**

**I've fixed this.** Now:
1. Restart your app
2. Try banning again
3. It should work!

---

## 📞 If Still Not Working

Run the diagnostic queries in `CHECK-BAN-STATUS.sql` and share the results:

1. Is `is_banned = true`?
2. Is `status = 'draft'` and `is_active = false`?
3. What's the report status?

This will help me identify the exact issue!
