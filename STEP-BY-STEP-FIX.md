# 📋 Step-by-Step Ban System Fix

## 🎯 Follow These Steps Exactly

---

## ✅ Step 1: Open Supabase SQL Editor

1. Go to: https://app.supabase.com
2. Click your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**

**You should see a blank SQL editor**

---

## ✅ Step 2: Copy All Commands

1. Open file: **`RUN-THIS-TO-FIX-BAN-SYSTEM.sql`**
2. Select ALL text (Ctrl+A or Cmd+A)
3. Copy (Ctrl+C or Cmd+C)

---

## ✅ Step 3: Paste in Supabase

1. Click in the SQL editor
2. Paste (Ctrl+V or Cmd+V)
3. You should see all the SQL commands

---

## ✅ Step 4: Run the Commands

1. Click the **Run ▶️** button
2. Wait for results

**You should see results from the queries**

---

## ✅ Step 5: Find Hassan's User ID

Look at the results. Find this line:
```
SELECT user_id FROM profiles WHERE username = 'hassan';
```

You should see a result like:
```
user_id
87edb66a-7983-4dce-995a-09c00f05e84f
```

**Copy this ID** (the long string)

---

## ✅ Step 6: Replace in Commands

Now you need to replace `HASSAN_USER_ID_HERE` with the ID you copied.

Find these commands in the file:

### Command 1:
```sql
UPDATE user_roles 
SET is_banned = true 
WHERE user_id = 'HASSAN_USER_ID_HERE';
```

Replace with:
```sql
UPDATE user_roles 
SET is_banned = true 
WHERE user_id = '87edb66a-7983-4dce-995a-09c00f05e84f';
```

### Command 2:
```sql
UPDATE shops 
SET status = 'draft', is_active = false 
WHERE owner_id = 'HASSAN_USER_ID_HERE';
```

Replace with:
```sql
UPDATE shops 
SET status = 'draft', is_active = false 
WHERE owner_id = '87edb66a-7983-4dce-995a-09c00f05e84f';
```

### Command 3:
```sql
UPDATE auth.users 
SET ban_duration = '876600h'
WHERE id = 'HASSAN_USER_ID_HERE';
```

Replace with:
```sql
UPDATE auth.users 
SET ban_duration = '876600h'
WHERE id = '87edb66a-7983-4dce-995a-09c00f05e84f';
```

---

## ✅ Step 7: Run the Updated Commands

1. Clear the SQL editor
2. Paste the updated commands (with the actual ID)
3. Click **Run ▶️**

**You should see success messages**

---

## ✅ Step 8: Verify Everything

Run these verification commands:

### Check 1: is_banned column exists
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'user_roles' AND column_name = 'is_banned';
```

**Expected:** 1 row with `is_banned`

### Check 2: Hassan is banned
```sql
SELECT is_banned FROM user_roles 
WHERE user_id = '87edb66a-7983-4dce-995a-09c00f05e84f';
```

**Expected:** `true`

### Check 3: Hassan's shops are inactive
```sql
SELECT status, is_active FROM shops 
WHERE owner_id = '87edb66a-7983-4dce-995a-09c00f05e84f' LIMIT 1;
```

**Expected:** `status = 'draft'` and `is_active = false`

### Check 4: Hassan is banned in auth
```sql
SELECT banned_until FROM auth.users 
WHERE id = '87edb66a-7983-4dce-995a-09c00f05e84f';
```

**Expected:** A future date (like 2034-12-31)

---

## ✅ Step 9: Test in Your Application

### Test 1: Try to Login
1. Open incognito window
2. Go to login page
3. Enter: `hassan@gmail.com` and password
4. Click Login

**Expected:** Error message "You have been permanently banned by the admin team."

### Test 2: Check Homepage
1. Go to homepage (not logged in)
2. Scroll to Featured Products
3. Scroll to Discounted Products

**Expected:** Hassan's products should NOT appear

### Test 3: Check Admin Page
1. Login as Super Admin
2. Go to Admin → Users
3. Click Hassan

**Expected:** Red "BANNED" badge next to his name

---

## 🎉 Done!

If all tests pass:
- ✅ Hassan is instantly logged out
- ✅ Hassan cannot log back in
- ✅ Hassan's products don't show
- ✅ BANNED badge shows on admin page

**The ban system is fully working!** 🎉

---

## 🆘 Troubleshooting

### Problem: Can't find Hassan's user_id
**Solution:** Run this:
```sql
SELECT user_id FROM profiles WHERE username = 'hassan';
```

### Problem: Commands don't work
**Solution:** Make sure you replaced `HASSAN_USER_ID_HERE` with the actual ID

### Problem: Hassan still logged in
**Solution:** Refresh the page or wait a moment

### Problem: Products still showing
**Solution:** Clear browser cache and refresh

### Problem: BANNED badge not showing
**Solution:** Refresh admin page and clear cache

---

## 📝 Summary

1. ✅ Open Supabase SQL Editor
2. ✅ Copy commands from `RUN-THIS-TO-FIX-BAN-SYSTEM.sql`
3. ✅ Paste in Supabase
4. ✅ Run to get Hassan's user_id
5. ✅ Replace `HASSAN_USER_ID_HERE` with actual ID
6. ✅ Run the updated commands
7. ✅ Verify with check queries
8. ✅ Test in your application

**Total time: 10 minutes**

---

## 🚀 You're Done!

The ban system is now fully working! 🎉
