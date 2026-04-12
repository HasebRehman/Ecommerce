# ✅ Ban System Setup Checklist

## 🎯 Your Task

Complete these steps in order. Check off each one as you go.

---

## 📋 Phase 1: Database Setup

### Step 1: Open Supabase
- [ ] Go to https://app.supabase.com
- [ ] Click your project
- [ ] Click "SQL Editor" (left sidebar)
- [ ] Click "New Query"

### Step 2: Check if Column Exists
- [ ] Copy this command:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'user_roles' AND column_name = 'is_banned';
```
- [ ] Paste in SQL Editor
- [ ] Click Run ▶️
- [ ] Check result:
  - [ ] If 1 row → Column exists ✅ Go to Step 3
  - [ ] If 0 rows → Column missing ❌ Go to Step 2B

### Step 2B: Add Column (IF MISSING)
- [ ] Copy this command:
```sql
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS user_roles_is_banned_idx 
ON public.user_roles(is_banned) WHERE is_banned = TRUE;
```
- [ ] Paste in SQL Editor
- [ ] Click Run ▶️
- [ ] Check for success message
- [ ] Go to Step 3

### Step 3: Check if Hassan is Banned
- [ ] Copy this command:
```sql
SELECT is_banned FROM user_roles 
WHERE user_id = (SELECT user_id FROM profiles WHERE username = 'hassan');
```
- [ ] Paste in SQL Editor
- [ ] Click Run ▶️
- [ ] Check result:
  - [ ] If true → Hassan is banned ✅ Go to Step 4
  - [ ] If false or NULL → Hassan not banned ❌ Go to Step 3B

### Step 3B: Ban Hassan (IF NEEDED)
- [ ] First, get his user_id:
```sql
SELECT user_id FROM profiles WHERE username = 'hassan';
```
- [ ] Copy the user_id from result
- [ ] Run this (replace USER_ID_HERE):
```sql
UPDATE user_roles 
SET is_banned = true 
WHERE user_id = 'USER_ID_HERE';

UPDATE shops 
SET status = 'draft', is_active = false 
WHERE owner_id = 'USER_ID_HERE';
```
- [ ] Click Run ▶️
- [ ] Check for success message
- [ ] Go to Step 4

### Step 4: Verify Hassan's Shops
- [ ] Copy this command:
```sql
SELECT status, is_active FROM shops 
WHERE owner_id = (SELECT user_id FROM profiles WHERE username = 'hassan')
LIMIT 1;
```
- [ ] Paste in SQL Editor
- [ ] Click Run ▶️
- [ ] Check result:
  - [ ] status = 'draft' ✅
  - [ ] is_active = false ✅
  - [ ] If not, run Step 3B again

---

## 🧪 Phase 2: Testing

### Test 1: Login Prevention
- [ ] Open incognito/private window
- [ ] Go to login page
- [ ] Enter email: `hassan@gmail.com`
- [ ] Enter password: (hassan's password)
- [ ] Click Login
- [ ] Check result:
  - [ ] Login fails ✅
  - [ ] Error message shows: "You have been permanently banned by the admin team." ✅

### Test 2: Products Hidden
- [ ] Go to homepage (not logged in)
- [ ] Scroll to "Featured Products"
- [ ] Check if hassan's products appear:
  - [ ] Hassan's products NOT showing ✅
  - [ ] Other sellers' products showing ✅
- [ ] Scroll to "Discounted Products"
- [ ] Check if hassan's products appear:
  - [ ] Hassan's products NOT showing ✅

### Test 3: Shops Hidden
- [ ] Go to shops page
- [ ] Check if hassan's shops appear:
  - [ ] Hassan's shops NOT showing ✅
  - [ ] Other sellers' shops showing ✅

### Test 4: BANNED Badge
- [ ] Login as Super Admin
- [ ] Go to Admin → Users
- [ ] Click on Hassan
- [ ] Check for BANNED badge:
  - [ ] Red "BANNED" badge next to name ✅
  - [ ] Red "BANNED" badge in Role field ✅

---

## 📊 Final Verification

### Database Verification
- [ ] is_banned column exists
- [ ] Hassan is_banned = true
- [ ] Hassan's shops status = 'draft'
- [ ] Hassan's shops is_active = false

### Application Verification
- [ ] Hassan cannot log in
- [ ] Hassan's products don't show on homepage
- [ ] Hassan's shops don't show on shops page
- [ ] BANNED badge shows on admin page

### All Tests Passing?
- [ ] Test 1: Login fails ✅
- [ ] Test 2: Products hidden ✅
- [ ] Test 3: Shops hidden ✅
- [ ] Test 4: BANNED badge shows ✅

---

## 🎉 Success!

If all checkboxes are checked:
- ✅ Ban system is fully working
- ✅ Banned users cannot log in
- ✅ Banned users' content is hidden
- ✅ BANNED badge shows on admin page

**Congratulations! The ban system is complete!** 🎉

---

## 🆘 If Something Fails

### Failed: Column doesn't exist (Step 2)
- [ ] Run Step 2B to add column

### Failed: Hassan not banned (Step 3)
- [ ] Run Step 3B to ban him

### Failed: Shops still live (Step 4)
- [ ] Run Step 3B again

### Failed: Login succeeds (Test 1)
- [ ] Check `/api/auth/login/route.ts`
- [ ] Verify is_banned = true in database

### Failed: Products still showing (Test 2)
- [ ] Check `/api/store/products/route.ts`
- [ ] Verify shops are draft/inactive

### Failed: BANNED badge not showing (Test 4)
- [ ] Refresh admin page
- [ ] Clear browser cache
- [ ] Verify is_banned = true in database

---

## 📝 Share Results

If you need help, share:
1. [ ] Screenshot of Step 2 result
2. [ ] Screenshot of Step 3 result
3. [ ] Screenshot of Step 4 result
4. [ ] Screenshot of Test 1 error message
5. [ ] Screenshot of Test 4 BANNED badge

---

## ⏱️ Time Estimate

- Database setup: 5 minutes
- Testing: 5 minutes
- **Total: 10 minutes**

**Let's do this!** 💪
