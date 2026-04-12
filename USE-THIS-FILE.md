# 🚀 USE THIS FILE - Ban System Fix

## ⚡ One File. Copy & Paste. Done.

---

## 📌 The File

**`FIXED-BAN-COMMANDS.sql`**

This is the corrected file with all the right commands.

---

## 🎯 Steps

### Step 1: Open Supabase
```
https://app.supabase.com
→ Your Project
→ SQL Editor
→ New Query
```

### Step 2: Copy Everything
Open: **`FIXED-BAN-COMMANDS.sql`**

Copy ALL the SQL commands.

### Step 3: Paste in Supabase
Paste everything in the SQL Editor.

### Step 4: Run
Click Run ▶️

### Step 5: Get Hassan's ID
Look at the results for:
```
SELECT id FROM profiles WHERE username = 'hassan';
```

You'll see something like:
```
id
87edb66a-7983-4dce-995a-09c00f05e84f
```

**Copy this ID**

### Step 6: Replace in Commands
Replace `HASSAN_ID_HERE` with the copied ID in these commands:

```sql
UPDATE user_roles 
SET is_banned = true 
WHERE user_id = '87edb66a-7983-4dce-995a-09c00f05e84f';

UPDATE shops 
SET status = 'draft', is_active = false 
WHERE owner_id = '87edb66a-7983-4dce-995a-09c00f05e84f';

UPDATE auth.users 
SET ban_duration = '876600h'
WHERE id = '87edb66a-7983-4dce-995a-09c00f05e84f';
```

### Step 7: Run Again
Click Run ▶️

### Step 8: Done!
Hassan is now:
- ✅ Instantly logged out
- ✅ Cannot log back in
- ✅ His products don't show
- ✅ His shops are inactive

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

## 🎉 That's It!

Just run the file and everything will work!

**File:** `FIXED-BAN-COMMANDS.sql`

**Time:** 5 minutes

**Result:** Ban system fully working! 🎉
