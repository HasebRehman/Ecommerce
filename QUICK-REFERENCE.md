# 🚀 Quick Reference - Ban System

## 📌 One File. One Command. Done.

---

## 🎯 The Main File

**`RUN-THIS-TO-FIX-BAN-SYSTEM.sql`**

Copy everything from this file and paste in Supabase SQL Editor.

---

## ⚡ Quick Steps

1. **Open:** https://app.supabase.com → Your Project → SQL Editor → New Query
2. **Copy:** All commands from `RUN-THIS-TO-FIX-BAN-SYSTEM.sql`
3. **Paste:** In Supabase SQL Editor
4. **Run:** Click Run ▶️
5. **Get ID:** Copy Hassan's user_id from results
6. **Replace:** Replace `HASSAN_USER_ID_HERE` with actual ID
7. **Run:** Click Run ▶️ again
8. **Done:** Hassan is banned!

---

## ✅ What Happens

```
Admin bans Hassan
        ↓
is_banned = true
        ↓
Shops set to draft/inactive
        ↓
Ban in auth (instant logout)
        ↓
Hassan logged out from all devices
        ↓
Cannot log back in
        ↓
Products don't show on website
        ↓
BANNED badge shows on admin page
```

---

## 🎯 Expected Results

| Action | Result |
|--------|--------|
| Try to login | ❌ Error: "permanently banned" |
| Check homepage | ❌ No hassan products |
| Check admin page | ✅ Red BANNED badge |
| Check shops | ❌ No hassan shops |

---

## 📋 The Commands (Summary)

```sql
-- 1. Add column
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

-- 2. Get user ID
SELECT user_id FROM profiles WHERE username = 'hassan';

-- 3. Ban user
UPDATE user_roles SET is_banned = true 
WHERE user_id = 'HASSAN_USER_ID_HERE';

-- 4. Deactivate shops
UPDATE shops SET status = 'draft', is_active = false 
WHERE owner_id = 'HASSAN_USER_ID_HERE';

-- 5. Ban in auth (instant logout)
UPDATE auth.users SET ban_duration = '876600h' 
WHERE id = 'HASSAN_USER_ID_HERE';
```

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't find user ID | Run: `SELECT user_id FROM profiles WHERE username = 'hassan';` |
| Commands don't work | Replace `HASSAN_USER_ID_HERE` with actual ID |
| Still logged in | Refresh page |
| Products still showing | Clear cache and refresh |
| BANNED badge not showing | Refresh admin page |

---

## ⏱️ Time

- Reading: 2 minutes
- Running SQL: 3 minutes
- Testing: 5 minutes
- **Total: 10 minutes**

---

## 🎉 Success Indicators

- ✅ Hassan cannot log in
- ✅ Hassan's products don't show
- ✅ BANNED badge shows
- ✅ Hassan's shops are inactive

---

## 📞 Files

| File | Purpose |
|------|---------|
| `RUN-THIS-TO-FIX-BAN-SYSTEM.sql` | **Main file - Run this!** |
| `JUST-RUN-THIS.md` | Simple instructions |
| `STEP-BY-STEP-FIX.md` | Detailed instructions |
| `FINAL-FIX-INSTRUCTIONS.md` | Complete guide |
| `QUICK-REFERENCE.md` | This file |

---

## 🚀 Next Step

**Open `RUN-THIS-TO-FIX-BAN-SYSTEM.sql` and run it now!**

Your ban system will be fully working in 10 minutes! 🎉
