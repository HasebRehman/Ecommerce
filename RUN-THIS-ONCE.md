# ⚡ RUN THIS ONCE - Ban System Fix

## 🎯 The Issue

The ban system code is **already in your application**, but the database column is missing.

---

## ✅ The Fix (2 Minutes)

### Step 1: Open Supabase
```
https://app.supabase.com → Your Project → SQL Editor → New Query
```

### Step 2: Copy & Paste This
```sql
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS user_roles_is_banned_idx 
ON public.user_roles(is_banned) WHERE is_banned = TRUE;
```

### Step 3: Click Run ▶️

### Step 4: Done!

---

## 🎉 What Happens Now

After running the SQL:

✅ **Admin can ban sellers from the frontend**
- Go to Admin → Reports
- Open a report
- Select "Ban Seller"
- Click Save

✅ **Seller is instantly logged out**
- All sessions invalidated
- Cannot log back in

✅ **Seller's products/shops don't show**
- Homepage: No products
- Featured: No products
- Shops: No shops

✅ **BANNED badge shows**
- Admin → Users → Click seller
- Red "BANNED" badge appears

---

## 🧪 Test It

1. **Ban a seller:**
   - Admin → Reports → Open report → Ban Seller → Save

2. **Try to login as that seller:**
   - Should see error: "You have been permanently banned by the admin team."

3. **Check homepage:**
   - Seller's products should NOT appear

4. **Check admin page:**
   - Admin → Users → Click seller → Should see BANNED badge

---

## ✨ Summary

**Run the SQL once** → Ban system works forever!

No more manual database work needed! 🎉
