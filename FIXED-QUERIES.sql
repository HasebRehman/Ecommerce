-- ============================================
-- FIXED QUERIES - Use These Instead
-- ============================================

-- 1. Check if is_banned column exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'user_roles' AND column_name = 'is_banned';

-- 2. Check recent business owners (FIXED - no created_at)
SELECT 
  ur.user_id,
  ur.is_banned,
  p.username,
  p.full_name
FROM user_roles ur
LEFT JOIN profiles p ON p.id = ur.user_id
WHERE ur.role = 'business_owner'
LIMIT 5;

-- 3. Check ALL columns in user_roles table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_roles'
ORDER BY ordinal_position;

-- 4. Check if specific seller is banned (replace 'SELLER_USERNAME')
SELECT 
  ur.user_id,
  ur.is_banned,
  ur.is_active,
  p.username
FROM user_roles ur
LEFT JOIN profiles p ON p.id = ur.user_id
WHERE p.username = 'SELLER_USERNAME';

-- 5. Check shops status for a seller (replace 'SELLER_USERNAME')
SELECT 
  s.id,
  s.name,
  s.status,
  s.is_active,
  p.username
FROM shops s
LEFT JOIN profiles p ON p.id = s.owner_id
WHERE p.username = 'SELLER_USERNAME';

-- 6. List ALL banned users
SELECT 
  ur.user_id,
  ur.is_banned,
  p.username,
  p.full_name
FROM user_roles ur
LEFT JOIN profiles p ON p.id = ur.user_id
WHERE ur.is_banned = true;

-- 7. Check recent reports
SELECT 
  r.id,
  r.status,
  r.created_at,
  s.name as shop_name
FROM reports r
LEFT JOIN shops s ON s.id = r.shops
ORDER BY r.created_at DESC
LIMIT 5;
