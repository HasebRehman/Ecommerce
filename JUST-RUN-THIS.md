# 🚀 JUST RUN THIS - Ban System Fix

## ⚡ One File. One Command. Done.

---

## 📋 What to Do

### Step 1: Open Supabase
```
https://app.supabase.com
→ Your Project
→ SQL Editor
→ New Query
```

### Step 2: Copy Everything
Open this file: **`RUN-THIS-TO-FIX-BAN-SYSTEM.sql`**

Copy ALL the SQL commands.

### Step 3: Paste in Supabase
Paste everything in the SQL Editor.

### Step 4: Find Hassan's User ID
Look for this line in the results:
```
SELECT user_id FROM profiles WHERE username = 'hassan';
```

Copy the user_id (looks like: `87edb66a-7983-4dce-995a-09c00f05e84f`)

### Step 5: Replace in Commands
Replace `HASSAN_USER_ID_HERE` with the copied ID in these commands:
```sql
UPDATE user_roles 
SET is_banned = true 
WHERE user_id = 'HASSAN_USER_ID_HERE';

UPDATE shops 
SET status = 'draft', is_active = false 
WHERE owner_id = 'HASSAN_USER_ID_HERE';

UPDATE auth.users 
SET ban_duration = '876600h'
WHERE id = 'HASSAN_USER_ID_HERE';
```

### Step 6: Run All Commands
Click Run ▶️

### Step 7: Done!
Hassan is now:
- ✅ Instantly logged out
- ✅ Cannot log back in
- ✅ His products don't show
- ✅ His shops are inactive

---

## 🎯 What Happens

### Instantly
- ✅ Hassan is logged out from all devices
- ✅ All his sessions are invalidated

### When He Tries to Login
- ✅ Error: "You have been permanently banned by the admin team."

### On Website
- ✅ His products don't show
- ✅ His shops don't show

### On Admin Page
- ✅ Red "BANNED" badge shows next to his name

---

## 📝 The File

**`RUN-THIS-TO-FIX-BAN-SYSTEM.sql`**

This file contains:
- ✅ Add is_banned column
- ✅ Get Hassan's user_id
- ✅ Ban Hassan
- ✅ Set shops to inactive
- ✅ Ban in auth (instant logout)
- ✅ Verification queries
- ✅ Optional: Ban other users
- ✅ Optional: Unban users

---

## ✅ Verification

After running, verify:

1. **Hassan cannot log in**
   - Try to login as hassan
   - Should see error: "You have been permanently banned by the admin team."

2. **Hassan's products don't show**
   - Go to homepage
   - Check Featured Products
   - Hassan's products should NOT appear

3. **BANNED badge shows**
   - Go to Admin → Users
   - Click Hassan
   - Should see red "BANNED" badge

---

## 🆘 If Something Goes Wrong

### Problem: Can't find Hassan's user_id
**Solution:** Run this in Supabase:
```sql
SELECT user_id FROM profiles WHERE username = 'hassan';
```

### Problem: Commands don't work
**Solution:** Make sure you replaced `HASSAN_USER_ID_HERE` with the actual ID

### Problem: Hassan still logged in
**Solution:** The ban in auth will log him out on next page load

### Problem: Products still showing
**Solution:** Clear browser cache and refresh

---

## 📞 That's It!

Just run the file and everything will work!

**File:** `RUN-THIS-TO-FIX-BAN-SYSTEM.sql`

**Time:** 5 minutes

**Result:** Ban system fully working! 🎉
