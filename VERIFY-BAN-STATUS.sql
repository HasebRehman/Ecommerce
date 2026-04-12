-- ============================================
-- VERIFY BAN STATUS - Run this in Supabase
-- ============================================

-- 1. Check if abdur rehman is banned in user_roles
SELECT 
  ur.user_id,
  ur.is_banned,
  ur.is_active,
  p.username,
  p.full_name
FROM user_roles ur
LEFT JOIN profiles p ON p.id = ur.user_id
WHERE p.full_name LIKE '%abdur%' OR p.username LIKE '%abdur%';

-- Expected: is_banned should be TRUE
-- If FALSE: The ban didn't execute in user_roles

-- 2. Check abdur rehman's shops
SELECT 
  s.id,
  s.name,
  s.status,
  s.is_active,
  p.full_name
FROM shops s
LEFT JOIN profiles p ON p.id = s.owner_id
WHERE p.full_name LIKE '%abdur%';

-- Expected: status = 'draft' and is_active = false
-- If still 'live': The shops weren't updated

-- 3. Check the report status
SELECT 
  r.id,
  r.status,
  r.created_at,
  s.name as shop_name,
  p.full_name as seller_name
FROM reports r
LEFT JOIN shops s ON s.id = r.shops
LEFT JOIN profiles p ON p.id = s.owner_id
WHERE r.status = 'seller_banned'
ORDER BY r.created_at DESC
LIMIT 3;

-- This should show the report with status 'seller_banned'

-- 4. Get abdur rehman's user_id
SELECT id, username, full_name FROM profiles 
WHERE full_name LIKE '%abdur%';

-- Copy this ID and use it below

-- 5. MANUAL FIX - Ban abdur rehman (replace USER_ID)
-- Replace 'USER_ID_HERE' with the ID from query 4

UPDATE user_roles 
SET is_banned = true 
WHERE user_id = 'USER_ID_HERE';

UPDATE shops 
SET status = 'draft', is_active = false 
WHERE owner_id = 'USER_ID_HERE';

-- 6. Verify the manual fix worked
SELECT 
  ur.is_banned,
  p.full_name
FROM user_roles ur
LEFT JOIN profiles p ON p.id = ur.user_id
WHERE p.full_name LIKE '%abdur%';

-- Should show is_banned = true
