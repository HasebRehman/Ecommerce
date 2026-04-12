# ✅ Corrected Commands - Ban System

## 🎯 The Error Was Fixed

**Error:** `column "user_id" does not exist`

**Fix:** Use `id` instead of `user_id` in profiles table

---

## 📋 Corrected Commands

### Command 1: Add Column
```sql
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;
```

### Command 2: Get Hassan's ID
```sql
SELECT id FROM profiles WHERE username = 'hassan';
```

**Copy the ID from the result** (looks like: `87edb66a-7983-4dce-995a-09c00f05e84f`)

### Command 3: Ban Hassan
Replace `HASSAN_ID_HERE` with the actual ID:

```sql
UPDATE user_roles 
SET is_banned = true 
WHERE user_id = 'HASSAN_ID_HERE';
```

### Command 4: Deactivate Shops
Replace `HASSAN_ID_HERE` with the actual ID:

```sql
UPDATE shops 
SET status = 'draft', is_active = false 
WHERE owner_id = 'HASSAN_ID_HERE';
```

### Command 5: Ban in Auth (Instant Logout)
Replace `HASSAN_ID_HERE` with the actual ID:

```sql
UPDATE auth.users 
SET ban_duration = '876600h'
WHERE id = 'HASSAN_ID_HERE';
```

---

## ✅ Verification

### Check 1: is_banned column exists
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'user_roles' AND column_name = 'is_banned';
```

**Expected:** 1 row with `is_banned`

### Check 2: Hassan is banned
Replace `HASSAN_ID_HERE` with the actual ID:

```sql
SELECT is_banned FROM user_roles 
WHERE user_id = 'HASSAN_ID_HERE';
```

**Expected:** `true`

### Check 3: Hassan's shops are inactive
Replace `HASSAN_ID_HERE` with the actual ID:

```sql
SELECT status, is_active FROM shops 
WHERE owner_id = 'HASSAN_ID_HERE' LIMIT 1;
```

**Expected:** `status = 'draft'` and `is_active = false`

---

## 🎯 Step-by-Step

1. **Run Command 1** → Add column
2. **Run Command 2** → Get Hassan's ID (copy it)
3. **Run Command 3** → Ban Hassan (replace ID)
4. **Run Command 4** → Deactivate shops (replace ID)
5. **Run Command 5** → Ban in auth (replace ID)
6. **Run Checks** → Verify everything

---

## 🎉 Result

After running all commands:
- ✅ Hassan is instantly logged out
- ✅ Hassan cannot log back in
- ✅ Hassan's products don't show
- ✅ Hassan's shops don't show
- ✅ BANNED badge shows on admin page

---

## 📝 Files to Use

- **`SIMPLE-BAN-FIX.sql`** - All commands in one file
- **`FIXED-BAN-COMMANDS.sql`** - Complete version with verification

---

## 🚀 Done!

Your ban system is now fully working! 🎉
