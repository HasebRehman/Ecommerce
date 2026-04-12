-- Add is_banned column to user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

-- Create index for faster banned user lookups
CREATE INDEX IF NOT EXISTS user_roles_is_banned_idx ON public.user_roles(is_banned) WHERE is_banned = TRUE;