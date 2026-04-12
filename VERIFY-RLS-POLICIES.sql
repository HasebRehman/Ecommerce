-- Run this to verify the RLS policies were created correctly

SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('user_roles', 'shops')
ORDER BY tablename, policyname;
