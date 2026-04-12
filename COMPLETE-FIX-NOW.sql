-- ============================================
-- COMPLETE BAN SYSTEM FIX
-- Run this ONCE in Supabase SQL Editor
-- ============================================

-- STEP 1: Add is_banned column to user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

-- STEP 2: Create index for performance
CREATE INDEX IF NOT EXISTS user_roles_is_banned_idx 
ON public.user_roles(is_banned) WHERE is_banned = TRUE;

-- STEP 3: Verify column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'user_roles' AND column_name = 'is_banned';

-- Expected result: 1 row showing is_banned column

-- ============================================
-- VERIFICATION QUERIES (Run these to check)
-- ============================================

-- Check all columns in user_roles table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_roles'
ORDER BY ordinal_position;

-- Check if any users are currently banned
SELECT 
  ur.user_id,
  ur.role,
  ur.is_banned,
  p.full_name,
  p.username
FROM user_roles ur
LEFT JOIN profiles p ON p.id = ur.user_id
WHERE ur.is_banned = true;

-- Expected result: 0 rows (no one is banned yet)

-- ============================================
-- DONE! Now the admin can ban users from the frontend
-- ============================================

-- When admin clicks "Ban Seller" on a report:
-- 1. is_banned will be set to true
-- 2. Seller's shops will be set to draft/inactive
-- 3. Seller will be logged out instantly
-- 4. Seller cannot log back in
-- 5. Products/shops won't show on website
-- 6. BANNED badge will show on admin page
