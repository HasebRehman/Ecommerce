# 🔄 Restart and Test - Ban System

## 🎯 What I Fixed

I updated the code to use the **admin client** instead of the regular client for ban operations.

**File changed:** `app/api/admin/reports/[id]/route.ts`

---

## ✅ Step 1: Restart Your App

```bash
# Stop your dev server (Ctrl+C or Cmd+C)

# Start it again
npm run dev
```

**Wait for the app to fully start**

---

## ✅ Step 2: Test Banning

1. **Login as Super Admin**
2. **Go to:** Admin → Reports
3. **Click:** On the report you created
4. **Select:** "Ban Seller" from dropdown
5. **Click:** Save

**Expected:** Success message "Action applied successfully"

---

## ✅ Step 3: Verify in Database

Run this in Supabase SQL Editor:

```sql
-- Check if seller is banned
SELECT 
  ur.user_id,
  ur.is_banned,
  p.username
FROM user_roles ur
LEFT JOIN profiles p ON p.id = ur.user_id
WHERE ur.role = 'business_owner'
ORDER BY ur.created_at DESC
LIMIT 3;
```

**Expected:** Your new seller should have `is_banned = true`

---

## ✅ Step 4: Test Login Prevention

1. **Open incognito window**
2. **Go to login page**
3. **Enter:** Banned seller's email and password
4. **Click:** Login

**Expected:** Error message "You have been permanently banned by the admin team."

---

## ✅ Step 5: Test Products Hidden

1. **Go to homepage** (not logged in)
2. **Scroll to:** Featured Products
3. **Check:** Banned seller's products should NOT appear

---

## ✅ Step 6: Test BANNED Badge

1. **Login as Super Admin**
2. **Go to:** Admin → Users
3. **Click:** On the banned seller
4. **Refresh page** (Ctrl+F5 or Cmd+Shift+R)

**Expected:** Red "BANNED" badge next to seller's name

---

## 🎯 If It Still Doesn't Work

Run the diagnostic queries in `CHECK-BAN-STATUS.sql` and check:

1. **Is `is_banned = true`?**
   - If NO → The ban didn't execute
   - Check server console for errors

2. **Is `status = 'draft'` and `is_active = false`?**
   - If NO → The shops weren't updated
   - Check server console for errors

3. **Can seller still login?**
   - If YES → Clear browser cache and try again
   - Or wait a moment and try again

---

## 📝 Summary

1. ✅ Restart app
2. ✅ Ban seller from admin panel
3. ✅ Verify in database
4. ✅ Test login prevention
5. ✅ Test products hidden
6. ✅ Test BANNED badge

**If all tests pass, the ban system is working!** 🎉
