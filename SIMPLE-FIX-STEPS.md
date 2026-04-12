# ⚡ SIMPLE FIX STEPS - Ban System

## Step 1: Check Column Exists

Run this in Supabase:

```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'user_roles' AND column_name = 'is_banned';
```

**Expected:** 1 row

**If 0 rows, run:**
```sql
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;
```

---

## Step 2: Check Current Sellers

Run this:

```sql
SELECT 
  ur.user_id,
  ur.is_banned,
  p.username,
  p.full_name
FROM user_roles ur
LEFT JOIN profiles p ON p.id = ur.user_id
WHERE ur.role = 'business_owner'
LIMIT 5;
```

**Write down the usernames you see.**

---

## Step 3: Restart Your App

```bash
# Stop: Ctrl+C
npm run dev
```

---

## Step 4: Ban a Seller

1. Login as Super Admin
2. Admin → Reports
3. Click a report
4. Select "Ban Seller"
5. Click Save

**Did you see "Action applied successfully"?**

---

## Step 5: Check if Ban Worked

Run this (replace 'SELLER_USERNAME' with actual username):

```sql
SELECT 
  ur.is_banned,
  p.username
FROM user_roles ur
LEFT JOIN profiles p ON p.id = ur.user_id
WHERE p.username = 'SELLER_USERNAME';
```

**Is `is_banned = true`?**
- ✅ YES → It worked!
- ❌ NO → Go to Step 6

---

## Step 6: Check Shops

Run this (replace 'SELLER_USERNAME'):

```sql
SELECT 
  s.status,
  s.is_active,
  p.username
FROM shops s
LEFT JOIN profiles p ON p.id = s.owner_id
WHERE p.username = 'SELLER_USERNAME';
```

**Is `status = 'draft'` and `is_active = false`?**
- ✅ YES → Good
- ❌ NO → Ban didn't execute properly

---

## Step 7: Test Login

1. Open incognito window
2. Try to login as banned seller
3. Should see: "You have been permanently banned by the admin team."

---

## 🆘 If It Doesn't Work

**Tell me:**
1. What did you see in Step 4? (success message or error?)
2. What's the result of Step 5? (is_banned = true or false?)
3. What's the result of Step 6? (shop status?)
4. Any errors in your terminal?

I'll fix it immediately!
