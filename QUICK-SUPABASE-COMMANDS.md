# ⚡ Quick Supabase Commands - Copy & Paste

## 🚀 Run These Commands in Order

### Command 1: Check if is_banned Column Exists
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_roles' AND column_name = 'is_banned';
```

**If you get 0 rows → Column doesn't exist → Run Command 2**
**If you get 1 row → Column exists → Run Command 3**

---

### Command 2: Add is_banned Column (IF NEEDED)
```sql
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS user_roles_is_banned_idx 
ON public.user_roles(is_banned) WHERE is_banned = TRUE;
```

**After running this, go to Command 3**

---

### Command 3: Check if Hassan is Banned
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

**If is_banned = true → He's banned in DB**
**If is_banned = false or NULL → He's NOT banned → Run Command 4**

---

### Command 4: Manually Ban Hassan (IF NEEDED)
```sql
-- First, find hassan's user_id
SELECT user_id FROM profiles WHERE username = 'hassan';
```

**Copy the user_id from the result, then run:**
```sql
-- Replace 'PASTE_USER_ID_HERE' with the actual ID
UPDATE user_roles 
SET is_banned = true 
WHERE user_id = 'PASTE_USER_ID_HERE';

-- Set his shops to draft
UPDATE shops 
SET status = 'draft', is_active = false 
WHERE owner_id = 'PASTE_USER_ID_HERE';

-- Verify
SELECT * FROM user_roles WHERE user_id = 'PASTE_USER_ID_HERE';
```

---

### Command 5: Check Hassan's Shops
```sql
SELECT 
  s.id,
  s.name,
  s.status,
  s.is_active,
  s.owner_id
FROM shops s
WHERE s.owner_id IN (
  SELECT user_id FROM profiles WHERE username = 'hassan'
);
```

**Expected: status = 'draft' and is_active = false**

---

### Command 6: List ALL Banned Users
```sql
SELECT 
  ur.user_id,
  ur.role,
  ur.is_banned,
  p.full_name,
  p.username
FROM user_roles ur
LEFT JOIN profiles p ON p.id = ur.user_id
WHERE ur.is_banned = true;
```

---

### Command 7: Check Reports Status
```sql
SELECT 
  r.id,
  r.reason,
  r.status,
  p.username as reporter,
  s.name as shop_name
FROM reports r
LEFT JOIN profiles p ON p.id = r.user_id
LEFT JOIN shops s ON s.id = r.shops
WHERE r.status = 'seller_banned'
LIMIT 10;
```

---

## 📋 Checklist

After running all commands, verify:

- [ ] Command 1: is_banned column exists (1 row returned)
- [ ] Command 3: Hassan is_banned = true
- [ ] Command 5: Hassan's shops have status = 'draft' and is_active = false
- [ ] Command 6: Hassan appears in banned users list
- [ ] Command 7: Reports show seller_banned status

---

## 🎯 What to Share With Me

After running these commands, please share:

1. **Result of Command 1** (does column exist?)
2. **Result of Command 3** (is hassan banned?)
3. **Result of Command 5** (what's hassan's shop status?)
4. **Result of Command 6** (list of all banned users)

This will help me identify the exact issue!

---

## 🔧 If Something Goes Wrong

### Error: "column is_banned does not exist"
→ Run Command 2 to add the column

### Error: "relation user_roles does not exist"
→ Check if table name is correct (should be `user_roles`)

### No results from Command 3
→ Hassan might not exist or username is different

### Hassan is_banned = false
→ Run Command 4 to manually ban him

---

## ✅ Success Indicators

After all commands:
- ✅ is_banned column exists in user_roles
- ✅ Hassan has is_banned = true
- ✅ Hassan's shops are draft/inactive
- ✅ Hassan appears in banned users list
- ✅ Reports show seller_banned status

**Then the ban system will work!** 🎉
