# 🧪 Ban System Verification Guide

## Quick Test Checklist

### ✅ Step 1: Verify Database Column Exists
Run this SQL in Supabase SQL Editor:
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_roles' AND column_name = 'is_banned';
```

**Expected Result:** Should return one row showing `is_banned` column exists.

---

### ✅ Step 2: Check Current Banned Users
```sql
SELECT ur.user_id, ur.role, ur.is_banned, p.full_name, p.username
FROM user_roles ur
LEFT JOIN profiles p ON p.id = ur.user_id
WHERE ur.is_banned = true;
```

**Expected Result:** Should show the user "hassan" (or whoever you banned).

---

### ✅ Step 3: Verify Shops Are Set to Draft
```sql
SELECT s.id, s.name, s.status, s.is_active, s.owner_id, p.username
FROM shops s
LEFT JOIN profiles p ON p.id = s.owner_id
LEFT JOIN user_roles ur ON ur.user_id = s.owner_id
WHERE ur.is_banned = true;
```

**Expected Result:** All shops should have `status = 'draft'` and `is_active = false`.

---

### ✅ Step 4: Test Login Prevention

**Method 1: Using Browser**
1. Open incognito/private window
2. Go to login page
3. Enter banned user credentials
4. Click login
5. **Expected:** Error toast: "You have been permanently banned by the admin team."

**Method 2: Using API**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hassan@gmail.com","password":"YourPassword123"}'
```

**Expected Response:**
```json
{
  "error": "You have been permanently banned by the admin team."
}
```

---

### ✅ Step 5: Test Products Hidden from Homepage

**Check Featured Products:**
```bash
curl http://localhost:3000/api/store/products/featured
```

**Check All Products:**
```bash
curl http://localhost:3000/api/store/products
```

**Expected:** Response should NOT contain any products from banned seller's shops.

---

### ✅ Step 6: Test Shops Hidden

```bash
curl http://localhost:3000/api/store/shops
```

**Expected:** Response should NOT contain shops owned by banned sellers.

---

### ✅ Step 7: Verify BANNED Badge in Admin Panel

1. Login as Super Admin
2. Go to Admin → Users
3. Click on the banned user (hassan)
4. **Expected:** 
   - Red "BANNED" badge next to user's name in header
   - "BANNED" badge in Role field

---

### ✅ Step 8: Test Shop Products Route

```bash
curl http://localhost:3000/api/store/shops/[BANNED_SHOP_ID]/products
```

**Expected:** Should return empty products array `{"products": []}`.

---

## 🔧 Manual Ban Test

If you want to manually ban a user for testing:

```sql
-- Ban a user
UPDATE user_roles 
SET is_banned = true 
WHERE user_id = 'USER_ID_HERE';

-- Set their shops to draft
UPDATE shops 
SET status = 'draft', is_active = false 
WHERE owner_id = 'USER_ID_HERE';
```

---

## 🔄 Unban a User (For Testing)

```sql
-- Unban a user
UPDATE user_roles 
SET is_banned = false 
WHERE user_id = 'USER_ID_HERE';

-- Reactivate their shops (optional)
UPDATE shops 
SET status = 'live', is_active = true 
WHERE owner_id = 'USER_ID_HERE';
```

---

## 🐛 Common Issues

### Issue: User still logged in after ban
**Solution:** The user will be logged out on their next API call. To force immediate logout, they need to refresh the page or navigate to another page.

### Issue: Products still showing
**Check:**
1. Is `is_banned = true` in database?
2. Are shops set to `status = 'draft'`?
3. Clear browser cache
4. Check the specific API route response

### Issue: BANNED badge not showing
**Check:**
1. Is `is_banned = true` in database?
2. Refresh the admin user detail page
3. Check browser console for errors

---

## 📊 Database Verification Queries

### Count banned users:
```sql
SELECT COUNT(*) as banned_count 
FROM user_roles 
WHERE is_banned = true;
```

### List all banned sellers with their shops:
```sql
SELECT 
  p.full_name,
  p.username,
  ur.role,
  ur.is_banned,
  COUNT(s.id) as shop_count,
  COUNT(CASE WHEN s.status = 'live' THEN 1 END) as live_shops
FROM user_roles ur
LEFT JOIN profiles p ON p.id = ur.user_id
LEFT JOIN shops s ON s.owner_id = ur.user_id
WHERE ur.is_banned = true
GROUP BY p.full_name, p.username, ur.role, ur.is_banned;
```

### Check products from banned sellers:
```sql
SELECT 
  p.id,
  p.name,
  p.is_active,
  s.name as shop_name,
  s.status as shop_status,
  pr.username as seller_username,
  ur.is_banned
FROM products p
LEFT JOIN shops s ON s.id = (
  SELECT shop_id FROM shop_products WHERE product_id = p.id LIMIT 1
)
LEFT JOIN profiles pr ON pr.id = p.owner_id
LEFT JOIN user_roles ur ON ur.user_id = p.owner_id
WHERE ur.is_banned = true;
```

---

## ✅ Success Criteria

All of these should be TRUE:
- [ ] Banned user cannot log in
- [ ] Banned user's products don't show on homepage
- [ ] Banned user's products don't show in featured products
- [ ] Banned user's products don't show in discounted products
- [ ] Banned user's shops don't show in shops listing
- [ ] Banned user's shop products return empty array
- [ ] BANNED badge shows on admin user detail page
- [ ] Report status shows "Seller Banned"
- [ ] Cannot take action twice on same report

---

## 🎯 Quick Test Command

Run all API tests at once:
```bash
# Test login (should fail)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hassan@gmail.com","password":"Password123"}' && \

# Test products (should not include banned seller)
curl http://localhost:3000/api/store/products && \

# Test shops (should not include banned seller)
curl http://localhost:3000/api/store/shops
```

---

**All tests passing? The ban system is working perfectly! 🎉**
