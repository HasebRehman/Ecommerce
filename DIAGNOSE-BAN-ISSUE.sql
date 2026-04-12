-- ============================================
-- DIAGNOSTIC QUERIES FOR BAN SYSTEM
-- Run these in Supabase SQL Editor
-- ============================================

-- 1. Check if is_banned column exists and current values
SELECT user_id, role, is_active, is_banned, created_at
FROM user_roles
ORDER BY created_at DESC
LIMIT 20;

-- 2. Check RLS policies on user_roles table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_roles';

-- 3. Check if service role can update (this should work)
-- Replace 'USER_ID_HERE' with actual banned user ID
-- UPDATE user_roles 
-- SET is_banned = true 
-- WHERE user_id = 'USER_ID_HERE';

-- 4. Verify shops table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'shops'
  AND column_name IN ('status', 'is_active', 'owner_id');

-- 5. Check RLS policies on shops table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'shops';

-- ============================================
-- POTENTIAL FIX: Disable RLS for service role
-- ============================================
-- If RLS is blocking service role, run these:

-- Option 1: Add policy to allow service role to update user_roles
-- CREATE POLICY "Service role can update user_roles"
-- ON user_roles
-- FOR UPDATE
-- TO service_role
-- USING (true)
-- WITH CHECK (true);

-- Option 2: Add policy to allow service role to update shops
-- CREATE POLICY "Service role can update shops"
-- ON shops
-- FOR UPDATE
-- TO service_role
-- USING (true)
-- WITH CHECK (true);

-- ============================================
-- MANUAL BAN (if needed)
-- ============================================
-- Replace with actual user ID
-- UPDATE user_roles SET is_banned = true WHERE user_id = 'USER_ID_HERE';
-- UPDATE shops SET status = 'draft', is_active = false WHERE owner_id = 'USER_ID_HERE';
