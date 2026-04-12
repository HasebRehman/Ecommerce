-- ============================================
-- COPY & PASTE THESE COMMANDS IN SUPABASE
-- ============================================

-- ============================================
-- COMMAND 1: Check if is_banned column exists
-- ============================================
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'user_roles' AND column_name = 'is_banned';

-- Expected: 1 row with is_banned column
-- If 0 rows: Column doesn't exist, run COMMAND 2


-- ============================================
-- COMMAND 2: Add is_banned column (IF NEEDED)
-- ============================================
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS user_roles_is_banned_idx 
ON public.user_roles(is_banned) WHERE is_banned = TRUE;

-- Verify it was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_roles' AND column_name = 'is_banned';


-- ============================================
-- COMMAND 3: Check if Hassan is banned
-- ============================================
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
WHERE p.username = 'hassan';

-- Expected: is_banned = true
-- If is_banned = false or NULL: Hassan is NOT banned, run COMMAND 4


-- ============================================
-- COMMAND 4A: Find Hassan's user_id
-- ============================================
SELECT user_id FROM profiles WHERE username = 'hassan';

-- Copy the user_id from result, then use it in COMMAND 4B


-- ============================================
-- COMMAND 4B: Ban Hassan (REPLACE USER_ID_HERE)
-- ============================================
-- Replace 'USER_ID_HERE' with the actual ID from COMMAND 4A

UPDATE user_roles 
SET is_banned = true 
WHERE user_id = 'USER_ID_HERE';

UPDATE shops 
SET status = 'draft', is_active = false 
WHERE owner_id = 'USER_ID_HERE';

-- Verify
SELECT * FROM user_roles WHERE user_id = 'USER_ID_HERE';
SELECT * FROM shops WHERE owner_id = 'USER_ID_HERE';


-- ============================================
-- COMMAND 5: Check Hassan's shops status
-- ============================================
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
);

-- Expected: status = 'draft' and is_active = false


-- ============================================
-- COMMAND 6: List all banned users
-- ============================================
SELECT 
  ur.user_id,
  ur.role,
  ur.is_banned,
  p.full_name,
  p.username
FROM user_roles ur
LEFT JOIN profiles p ON p.id = ur.user_id
WHERE ur.is_banned = true;

-- Expected: Hassan should be in this list


-- ============================================
-- COMMAND 7: Check reports with actions
-- ============================================
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

-- Expected: Reports should show seller_banned status


-- ============================================
-- COMMAND 8: Check Hassan's products
-- ============================================
SELECT 
  p.id,
  p.name,
  p.is_active,
  p.owner_id,
  pr.username
FROM products p
LEFT JOIN profiles pr ON pr.id = p.owner_id
WHERE p.owner_id IN (
  SELECT user_id FROM profiles WHERE username = 'hassan'
);

-- Expected: Hassan's products should exist (but shops are inactive)


-- ============================================
-- COMMAND 9: Verify all columns in user_roles
-- ============================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_roles'
ORDER BY ordinal_position;

-- Expected: Should include is_banned column


-- ============================================
-- COMMAND 10: Count banned users
-- ============================================
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN is_banned = true THEN 1 END) as banned_users,
  COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_users
FROM user_roles;

-- Expected: banned_users should be > 0


-- ============================================
-- TROUBLESHOOTING: If something is wrong
-- ============================================

-- If Hassan's shops are still live, run this:
UPDATE shops 
SET status = 'draft', is_active = false 
WHERE owner_id = (SELECT user_id FROM profiles WHERE username = 'hassan');

-- If Hassan is not banned, run this:
UPDATE user_roles 
SET is_banned = true 
WHERE user_id = (SELECT user_id FROM profiles WHERE username = 'hassan');

-- If you need to unban Hassan (for testing), run this:
UPDATE user_roles 
SET is_banned = false 
WHERE user_id = (SELECT user_id FROM profiles WHERE username = 'hassan');

UPDATE shops 
SET status = 'live', is_active = true 
WHERE owner_id = (SELECT user_id FROM profiles WHERE username = 'hassan');
