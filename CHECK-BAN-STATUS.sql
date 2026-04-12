-- ============================================
-- CHECK BAN STATUS - Run this in Supabase
-- ============================================

-- 1. Check if is_banned column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'user_roles' AND column_name = 'is_banned';

-- Expected: 1 row with is_banned column

-- 2. List ALL users with their ban status
SELECT 
  ur.user_id,
  ur.role,
  ur.is_banned,
  ur.is_active,
  p.full_name,
  p.username,
  p.email
FROM user_roles ur
LEFT JOIN profiles p ON p.id = ur.user_id
WHERE ur.role = 'business_owner'
ORDER BY ur.created_at DESC
LIMIT 10;

-- Check if the new seller you created has is_banned = true

-- 3. Check reports table
SELECT 
  r.id,
  r.reason,
  r.status,
  r.created_at,
  s.name as shop_name,
  s.owner_id as seller_id
FROM reports r
LEFT JOIN shops s ON s.id = r.shops
ORDER BY r.created_at DESC
LIMIT 5;

-- Check if the report status is 'seller_banned'

-- 4. Check shops status
SELECT 
  s.id,
  s.name,
  s.status,
  s.is_active,
  s.owner_id,
  p.username
FROM shops s
LEFT JOIN profiles p ON p.id = s.owner_id
ORDER BY s.created_at DESC
LIMIT 5;

-- Check if the banned seller's shops have status = 'draft' and is_active = false

-- 5. Check if seller is banned in user_roles
-- Replace 'SELLER_USERNAME_HERE' with the actual username
SELECT 
  ur.user_id,
  ur.role,
  ur.is_banned,
  p.username
FROM user_roles ur
LEFT JOIN profiles p ON p.id = ur.user_id
WHERE p.username = 'SELLER_USERNAME_HERE';

-- Expected: is_banned = true
