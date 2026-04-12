-- ============================================
-- BAN SYSTEM DIAGNOSTIC QUERIES
-- Run these in Supabase SQL Editor
-- ============================================

-- 1. CHECK IF is_banned COLUMN EXISTS
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_roles' 
  AND column_name = 'is_banned'
ORDER BY ordinal_position;

-- 2. CHECK ALL COLUMNS IN user_roles TABLE
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_roles'
ORDER BY ordinal_position;

-- 3. CHECK IF HASSAN IS BANNED
SELECT 
  ur.user_id,
  ur.role,
  ur.is_active,
  ur.is_banned,
  p.full_name,
  p.username,
  p.email
FROM user_roles ur
LEFT JOIN profiles p ON p.id = ur.user_id
WHERE p.username = 'hassan' OR p.full_name LIKE '%hassan%'
LIMIT 10;

-- 4. LIST ALL BANNED USERS
SELECT 
  ur.user_id,
  ur.role,
  ur.is_active,
  ur.is_banned,
  p.full_name,
  p.username
FROM user_roles ur
LEFT JOIN profiles p ON p.id = ur.user_id
WHERE ur.is_banned = true
ORDER BY ur.created_at DESC;

-- 5. CHECK HASSAN'S SHOPS
SELECT 
  s.id,
  s.name,
  s.status,
  s.is_active,
  s.owner_id,
  p.username
FROM shops s
LEFT JOIN profiles p ON p.id = s.owner_id
WHERE s.owner_id IN (
  SELECT user_id FROM profiles WHERE username = 'hassan'
)
ORDER BY s.created_at DESC;

-- 6. CHECK HASSAN'S PRODUCTS
SELECT 
  p.id,
  p.name,
  p.is_active,
  p.owner_id,
  pr.username,
  COUNT(sp.product_id) as in_shops
FROM products p
LEFT JOIN profiles pr ON pr.id = p.owner_id
LEFT JOIN shop_products sp ON sp.product_id = p.id
WHERE p.owner_id IN (
  SELECT user_id FROM profiles WHERE username = 'hassan'
)
GROUP BY p.id, p.name, p.is_active, p.owner_id, pr.username
ORDER BY p.created_at DESC;

-- 7. CHECK REPORTS TABLE FOR HASSAN'S REPORTS
SELECT 
  r.id,
  r.reason,
  r.status,
  r.created_at,
  p.username as reporter,
  s.name as shop_name
FROM reports r
LEFT JOIN profiles p ON p.id = r.user_id
LEFT JOIN shops s ON s.id = r.shops
WHERE r.status IN ('seller_banned', 'warning_issued', 'neglected')
ORDER BY r.created_at DESC
LIMIT 20;

-- 8. CHECK user_roles TABLE STRUCTURE
SELECT *
FROM user_roles
LIMIT 1;

-- 9. COUNT TOTAL USERS AND BANNED USERS
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN is_banned = true THEN 1 END) as banned_users,
  COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_users
FROM user_roles;

-- 10. CHECK IF HASSAN'S ACCOUNT IS BANNED IN AUTH
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  banned_until
FROM auth.users
WHERE email LIKE '%hassan%'
LIMIT 5;
