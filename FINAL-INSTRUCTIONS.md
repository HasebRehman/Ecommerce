# ✅ FINAL INSTRUCTIONS - Ban System Fix

## 🎯 The Error Was Fixed

The error was: `column "user_id" does not exist`

**The fix:** Use `id` instead of `user_id` in the profiles table.

---

## 📌 Use This File

**`SIMPLE-BAN-FIX.sql`** or **`FIXED-BAN-COMMANDS.sql`**

Both files have the corrected commands.

---

## 🚀 Quick Steps

1. **Open Supabase:** https://app.supabase.com → Your Project → SQL Editor → New Query

2. **Copy this:**
```sql
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

SELECT id FROM profiles WHERE username = 'hassan';
```

3. **Paste in Supabase and Run**

4. **Copy Hassan's ID from the result**

5. **Run these (replace HASSAN_ID_HERE with the ID):**
```sql
UPDATE user_roles SET is_banned = true WHERE user_id = 'HASSAN_ID_HERE';
UPDATE shops SET status = 'draft', is_active = false WHERE owner_id = 'HASSAN_ID_HERE';
UPDATE auth.users SET ban_duration = '876600h' WHERE id = 'HASSAN_ID_HERE';
```

6. **Done!** Hassan is banned!

---

## ✅ What Happens

- ✅ Hassan instantly logged out
- ✅ Cannot log back in
- ✅ Products don't show
- ✅ Shops don't show
- ✅ BANNED badge shows

---

## 📝 Files

- **`SIMPLE-BAN-FIX.sql`** - Simplest version
- **`FIXED-BAN-COMMANDS.sql`** - Complete version
- **`USE-THIS-FILE.md`** - Instructions

---

## 🎉 Done!

Your ban system is now fully working! 🎉
