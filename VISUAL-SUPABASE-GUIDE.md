# 📸 Visual Supabase Guide - Step by Step

## 🖼️ Step 1: Open Supabase SQL Editor

**Location:**
```
https://app.supabase.com
    ↓
Click your project
    ↓
Left sidebar → SQL Editor
    ↓
Click "New Query"
```

**You should see:**
```
┌─────────────────────────────────────────┐
│ SQL Editor                              │
├─────────────────────────────────────────┤
│                                         │
│  [Paste SQL here]                       │
│                                         │
│                                         │
│                                         │
│  [Run ▶️]  [Save]  [Format]             │
└─────────────────────────────────────────┘
```

---

## 🖼️ Step 2: Check if Column Exists

**Paste this:**
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'user_roles' AND column_name = 'is_banned';
```

**Click Run ▶️**

### Expected Result 1: Column EXISTS ✅
```
┌──────────────┬───────────┬────────────────┐
│ column_name  │ data_type │ column_default │
├──────────────┼───────────┼────────────────┤
│ is_banned    │ boolean   │ false          │
└──────────────┴───────────┴────────────────┘
```

**→ Go to Step 3**

### Expected Result 2: Column MISSING ❌
```
┌──────────────┬───────────┬────────────────┐
│ column_name  │ data_type │ column_default │
├──────────────┼───────────┼────────────────┤
│ (no rows)    │           │                │
└──────────────┴───────────┴────────────────┘
```

**→ Go to Step 2B**

---

## 🖼️ Step 2B: Add Missing Column

**Clear the previous query and paste this:**
```sql
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS user_roles_is_banned_idx 
ON public.user_roles(is_banned) WHERE is_banned = TRUE;
```

**Click Run ▶️**

### Expected Result:
```
┌─────────────────────────────────────────┐
│ Success                                 │
│ ALTER TABLE                             │
│ CREATE INDEX                            │
└─────────────────────────────────────────┘
```

**→ Go to Step 3**

---

## 🖼️ Step 3: Check if Hassan is Banned

**Clear and paste this:**
```sql
SELECT 
  ur.user_id,
  ur.role,
  ur.is_banned,
  p.full_name,
  p.username
FROM user_roles ur
LEFT JOIN profiles p ON p.id = ur.user_id
WHERE p.username = 'hassan';
```

**Click Run ▶️**

### Expected Result 1: Hassan IS BANNED ✅
```
┌──────────────────────┬──────────────┬──────────┬───────────┬──────────┐
│ user_id              │ role         │ is_banned│ full_name │ username │
├──────────────────────┼──────────────┼──────────┼───────────┼──────────┤
│ 87edb66a-7983-4dce..│ business_own │ true     │ Hassan    │ hassan   │
└──────────────────────┴──────────────┴──────────┴───────────┴──────────┘
```

**→ Go to Step 4**

### Expected Result 2: Hassan NOT BANNED ❌
```
┌──────────────────────┬──────────────┬──────────┬───────────┬──────────┐
│ user_id              │ role         │ is_banned│ full_name │ username │
├──────────────────────┼──────────────┼──────────┼───────────┼──────────┤
│ 87edb66a-7983-4dce..│ business_own │ false    │ Hassan    │ hassan   │
└──────────────────────┴──────────────┴──────────┴───────────┴──────────┘
```

**→ Go to Step 3B**

---

## 🖼️ Step 3B: Ban Hassan Manually

**First, get his user_id:**
```sql
SELECT user_id FROM profiles WHERE username = 'hassan';
```

**Click Run ▶️**

### Result:
```
┌──────────────────────┐
│ user_id              │
├──────────────────────┤
│ 87edb66a-7983-4dce..│
└──────────────────────┘
```

**Copy this ID (87edb66a-7983-4dce...)**

**Then paste this (replace USER_ID_HERE):**
```sql
UPDATE user_roles 
SET is_banned = true 
WHERE user_id = '87edb66a-7983-4dce...';

UPDATE shops 
SET status = 'draft', is_active = false 
WHERE owner_id = '87edb66a-7983-4dce...';
```

**Click Run ▶️**

### Expected Result:
```
┌─────────────────────────────────────────┐
│ Success                                 │
│ UPDATE 1                                │
│ UPDATE 2                                │
└─────────────────────────────────────────┘
```

**→ Go to Step 4**

---

## 🖼️ Step 4: Verify Hassan's Shops

**Clear and paste this:**
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

**Click Run ▶️**

### Expected Result: ✅
```
┌────────┬──────────────┬────────┬───────────┬──────────────────────┬──────────┐
│ id     │ name         │ status │ is_active │ owner_id             │ username │
├────────┼──────────────┼────────┼───────────┼──────────────────────┼──────────┤
│ shop1  │ digital shop │ draft  │ false     │ 87edb66a-7983-4dce..│ hassan   │
│ shop2  │ another shop │ draft  │ false     │ 87edb66a-7983-4dce..│ hassan   │
└────────┴──────────────┴────────┴───────────┴──────────────────────┴──────────┘
```

**Check:**
- ✅ status = 'draft'
- ✅ is_active = false

**If status = 'live' or is_active = true:** Run Step 3B again

---

## 🖼️ Step 5: Test Login

**In your browser (incognito window):**

1. Go to your login page
2. Enter email: `hassan@gmail.com`
3. Enter password: (hassan's password)
4. Click Login

### Expected Result: ❌ Login Fails
```
┌─────────────────────────────────────────┐
│ ❌ Error                                │
│                                         │
│ You have been permanently banned by     │
│ the admin team.                         │
│                                         │
│ [OK]                                    │
└─────────────────────────────────────────┘
```

---

## 🖼️ Step 6: Test Homepage

**In your browser (not logged in):**

1. Go to homepage
2. Scroll to "Featured Products"
3. Scroll to "Discounted Products"

### Expected Result: ✅ Hassan's Products NOT Showing
```
┌─────────────────────────────────────────┐
│ Featured Products                       │
├─────────────────────────────────────────┤
│                                         │
│  [Product 1]  [Product 2]  [Product 3] │
│  (from other sellers, NOT hassan)       │
│                                         │
└─────────────────────────────────────────┘
```

**Hassan's "digital shop" products should NOT appear**

---

## 🖼️ Step 7: Test Admin Panel

**In your browser (logged in as Super Admin):**

1. Go to Admin → Users
2. Click on Hassan

### Expected Result: ✅ BANNED Badge Shows
```
┌─────────────────────────────────────────┐
│ User Details                            │
├─────────────────────────────────────────┤
│                                         │
│  [Avatar]  Hassan  [BANNED]             │
│            @hassan                      │
│                                         │
│  Email: hassan@gmail.com                │
│  Role: Business Owner  [BANNED]         │
│                                         │
└─────────────────────────────────────────┘
```

**You should see:**
- ✅ Red "BANNED" badge next to name
- ✅ Red "BANNED" badge in Role field

---

## 📊 Complete Verification Table

After all steps, you should see:

| Check | Expected | Status |
|-------|----------|--------|
| is_banned column exists | ✅ 1 row | ? |
| Hassan is_banned = true | ✅ true | ? |
| Hassan's shops status | ✅ draft | ? |
| Hassan's shops is_active | ✅ false | ? |
| Login fails with error | ✅ Yes | ? |
| Products don't show | ✅ Yes | ? |
| BANNED badge shows | ✅ Yes | ? |

---

## 🎯 Success Indicators

All of these should be TRUE:
- ✅ Hassan cannot log in
- ✅ Hassan's products don't show on homepage
- ✅ BANNED badge shows on admin page
- ✅ Hassan's shops are draft/inactive
- ✅ Error message says "permanently banned"

**If all are TRUE, the ban system is working!** 🎉

---

## 🆘 Troubleshooting

### Issue: Column doesn't exist (Step 2 returns 0 rows)
**Solution:** Run Step 2B

### Issue: Hassan is_banned = false (Step 3 shows false)
**Solution:** Run Step 3B

### Issue: Hassan's shops are still live (Step 4 shows status = 'live')
**Solution:** Run Step 3B again

### Issue: Login succeeds (Step 5 doesn't show error)
**Solution:** Check `/api/auth/login/route.ts` file

### Issue: Products still show (Step 6 shows hassan's products)
**Solution:** Check `/api/store/products/route.ts` file

### Issue: BANNED badge doesn't show (Step 7)
**Solution:** 
1. Verify is_banned = true in database
2. Refresh admin page
3. Clear browser cache

---

## 📝 Share Screenshots

Please share:
1. Screenshot of Step 2 result
2. Screenshot of Step 3 result
3. Screenshot of Step 4 result
4. Screenshot of Step 5 error message
5. Screenshot of Step 7 BANNED badge

This will help me identify the exact issue!
