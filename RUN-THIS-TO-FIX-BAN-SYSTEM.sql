-- ============================================
-- RUN ALL THESE COMMANDS IN SUPABASE SQL EDITOR
-- Copy everything and paste in Supabase
-- Click Run and your ban system will work!
-- ============================================

-- ============================================
-- STEP 1: Add is_banned column to user_roles
-- ============================================
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS user_roles_is_banned_idx 
ON public.user_roles(is_banned) WHERE is_banned = TRUE;

-- ============================================
-- STEP 2: Get Hassan's user_id (COPY THE ID)
-- ============================================
SELECT id FROM profiles WHERE username = 'hassan';

-- After running above, copy the user_id and replace 'HASSAN_USER_ID_HERE' in the commands below

-- ============================================
-- STEP 3: Ban Hassan Instantly
-- ============================================
-- Replace 'HASSAN_USER_ID_HERE' with the actual ID from STEP 2

UPDATE user_roles 
SET is_banned = true 
WHERE user_id = 'HASSAN_USER_ID_HERE';

-- ============================================
-- STEP 4: Set Hassan's Shops to Inactive
-- ============================================
UPDATE shops 
SET status = 'draft', is_active = false 
WHERE owner_id = 'HASSAN_USER_ID_HERE';

-- ============================================
-- STEP 5: Ban Hassan in Auth (Instant Logout)
-- ============================================
-- This will instantly log him out from all devices
UPDATE auth.users 
SET ban_duration = '876600h'
WHERE id = 'HASSAN_USER_ID_HERE';

-- ============================================
-- STEP 6: Verify Everything is Set
-- ============================================
-- Run these to verify:

-- Check if is_banned column exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'user_roles' AND column_name = 'is_banned';

-- Check if Hassan is banned
SELECT is_banned FROM user_roles 
WHERE user_id = 'HASSAN_USER_ID_HERE';

-- Check if Hassan's shops are inactive
SELECT status, is_active FROM shops 
WHERE owner_id = 'HASSAN_USER_ID_HERE' LIMIT 1;

-- Check if Hassan is banned in auth
SELECT banned_until FROM auth.users 
WHERE id = 'HASSAN_USER_ID_HERE';

-- ============================================
-- STEP 7: Ban Any Other User (Optional)
-- ============================================
-- To ban another user, replace 'OTHER_USER_ID_HERE' with their user_id

-- Ban the user
UPDATE user_roles 
SET is_banned = true 
WHERE user_id = 'OTHER_USER_ID_HERE';

-- Set their shops to inactive
UPDATE shops 
SET status = 'draft', is_active = false 
WHERE owner_id = 'OTHER_USER_ID_HERE';

-- Ban in auth (instant logout)
UPDATE auth.users 
SET ban_duration = '876600h'
WHERE id = 'OTHER_USER_ID_HERE';

-- ============================================
-- STEP 8: Unban a User (If Needed for Testing)
-- ============================================
-- To unban a user, replace 'USER_ID_HERE' with their user_id

-- Unban the user
UPDATE user_roles 
SET is_banned = false 
WHERE user_id = 'USER_ID_HERE';

-- Reactivate their shops
UPDATE shops 
SET status = 'live', is_active = true 
WHERE owner_id = 'USER_ID_HERE';

-- Unban in auth
UPDATE auth.users 
SET ban_duration = 'none'
WHERE id = 'USER_ID_HERE';

-- ============================================
-- STEP 9: List All Banned Users
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

-- ============================================
-- STEP 10: Check All Banned Users in Auth
-- ============================================
SELECT 
  id,
  email,
  banned_until
FROM auth.users
WHERE banned_until IS NOT NULL AND banned_until > NOW();
