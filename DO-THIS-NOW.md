# ⚡ DO THIS NOW - Simple Steps

## 1️⃣ Verify Database (30 seconds)

**Open Supabase SQL Editor**

**Run:**
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'user_roles' AND column_name = 'is_banned';
```

**Result:**
- ✅ 1 row → Good, go to step 2
- ❌ 0 rows → Run this first:
```sql
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;
```

---

## 2️⃣ Restart App (10 seconds)

```bash
# Stop: Ctrl+C
# Start:
npm run dev
```

---

## 3️⃣ Test Ban (1 minute)

1. Login as Super Admin
2. Admin → Reports → Click report
3. Select "Ban Seller"
4. Click Save

**Did you see "Action applied successfully"?**
- ✅ YES → Go to step 4
- ❌ NO → Check terminal for errors, share with me

---

## 4️⃣ Verify Ban Worked (30 seconds)

**Run in Supabase:**
```sql
SELECT ur.is_banned, p.username
FROM user_roles ur
LEFT JOIN profiles p ON p.id = ur.user_id
WHERE ur.role = 'business_owner'
ORDER BY ur.created_at DESC
LIMIT 3;
```

**Is your seller's `is_banned = true`?**
- ✅ YES → It worked! Test login
- ❌ NO → Share terminal errors with me

---

## 5️⃣ Test Login (30 seconds)

1. Open incognito window
2. Try to login as banned seller
3. Should see error: "permanently banned"

**Did it work?**
- ✅ YES → Success! 🎉
- ❌ NO → Share what happened

---

## 🆘 If Nothing Works

Run this and share results:

```sql
SELECT 
  ur.user_id,
  ur.is_banned,
  p.username,
  s.status as shop_status,
  s.is_active as shop_active
FROM user_roles ur
LEFT JOIN profiles p ON p.id = ur.user_id
LEFT JOIN shops s ON s.owner_id = ur.user_id
WHERE ur.role = 'business_owner'
ORDER BY ur.created_at DESC
LIMIT 3;
```

**Share:**
1. The query results
2. Any errors from terminal
3. What happened when you clicked "Ban Seller"

I'll fix it immediately!
