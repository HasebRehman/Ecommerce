-- ============================================
-- SIMPLE BAN FIX - COPY & PASTE THIS
-- ============================================

-- 1. Add column
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

-- 2. Get Hassan's ID (COPY THE ID)
SELECT id FROM profiles WHERE username = 'hassan';

-- 3. Ban Hassan (replace HASSAN_ID_HERE with the ID from step 2)
UPDATE user_roles SET is_banned = true WHERE user_id = 'HASSAN_ID_HERE';
UPDATE shops SET status = 'draft', is_active = false WHERE owner_id = 'HASSAN_ID_HERE';
UPDATE auth.users SET ban_duration = '876600h' WHERE id = 'HASSAN_ID_HERE';

-- 4. Verify
SELECT is_banned FROM user_roles WHERE user_id = 'HASSAN_ID_HERE';
SELECT status, is_active FROM shops WHERE owner_id = 'HASSAN_ID_HERE' LIMIT 1;
