-- ============================================
-- COPY & PASTE ALL THIS IN SUPABASE SQL EDITOR
-- ============================================

-- STEP 1: Add is_banned column
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

-- STEP 2: Get Hassan's ID (COPY THE ID FROM RESULT)
SELECT id FROM profiles WHERE username = 'hassan';

-- ============================================
-- After getting the ID, replace 'HASSAN_ID_HERE' 
-- with the actual ID in the commands below
-- ============================================

-- STEP 3: Ban Hassan in user_roles
UPDATE user_roles 
SET is_banned = true 
WHERE user_id = 'HASSAN_ID_HERE';

-- STEP 4: Set Hassan's shops to inactive
UPDATE shops 
SET status = 'draft', is_active = false 
WHERE owner_id = 'HASSAN_ID_HERE';

-- STEP 5: Ban Hassan in auth (instant logout)
UPDATE auth.users 
SET ban_duration = '876600h'
WHERE id = 'HASSAN_ID_HERE';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check 1: is_banned column exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'user_roles' AND column_name = 'is_banned';

-- Check 2: Hassan is banned
SELECT is_banned FROM user_roles 
WHERE user_id = 'HASSAN_ID_HERE';

-- Check 3: Hassan's shops are inactive
SELECT status, is_active FROM shops 
WHERE owner_id = 'HASSAN_ID_HERE' LIMIT 1;

-- Check 4: Hassan is banned in auth
SELECT banned_until FROM auth.users 
WHERE id = 'HASSAN_ID_HERE';

-- ============================================
-- LIST ALL BANNED USERS
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
