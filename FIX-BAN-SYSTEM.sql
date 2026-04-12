-- ============================================
-- FIX BAN SYSTEM - RUN THIS IN SUPABASE SQL EDITOR
-- ============================================
-- This script fixes RLS policies to allow service role to ban users

-- Step 1: Check current RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('user_roles', 'shops');

-- Step 2: Add policies to allow service role to update user_roles
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Service role can update user_roles" ON user_roles;

-- Create new policy for service role
CREATE POLICY "Service role can update user_roles"
ON user_roles
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Step 3: Add policies to allow service role to update shops
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Service role can update shops" ON shops;

-- Create new policy for service role
CREATE POLICY "Service role can update shops"
ON shops
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Step 4: Verify policies were created
SELECT 
  tablename,
  policyname,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('user_roles', 'shops')
  AND 'service_role' = ANY(roles);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all users and their ban status
SELECT 
  p.full_name,
  p.username,
  ur.role,
  ur.is_banned,
  ur.is_active
FROM profiles p
JOIN user_roles ur ON p.id = ur.user_id
ORDER BY ur.created_at DESC;

-- Check shops of banned users
SELECT 
  s.id,
  s.name,
  s.status,
  s.is_active,
  s.owner_id,
  p.full_name as owner_name
FROM shops s
JOIN profiles p ON s.owner_id = p.id
JOIN user_roles ur ON s.owner_id = ur.user_id
WHERE ur.is_banned = true;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
-- If you see the policies created above, the ban system should now work!
-- Try banning a user from the admin panel and check if:
-- 1. is_banned becomes true in user_roles
-- 2. shops status becomes 'draft' and is_active becomes false
-- 3. User gets logged out instantly
-- 4. User cannot log back in
