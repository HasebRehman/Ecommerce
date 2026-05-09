-- Migration: Create announcements table with RLS policies
-- Feature: Announcement Management System
-- Run this in Supabase SQL Editor

-- Drop table if exists (for clean setup)
DROP TABLE IF EXISTS announcements CASCADE;

-- Create announcements table
CREATE TABLE announcements (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  subject      TEXT        NOT NULL CHECK (subject <> ''),
  message      TEXT        NOT NULL CHECK (message <> ''),
  scheduled_at TIMESTAMPTZ NOT NULL,
  status       TEXT        NOT NULL DEFAULT 'scheduled'
                           CHECK (status IN ('scheduled', 'published')),
  target_roles TEXT[]      NOT NULL CHECK (array_length(target_roles, 1) > 0),
  created_by   UUID        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow service role to do everything (for admin operations)
CREATE POLICY "Service role has full access"
  ON announcements
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policy: Allow authenticated users to read published announcements
CREATE POLICY "Users can read published announcements"
  ON announcements
  FOR SELECT
  TO authenticated
  USING (status = 'published');

-- RLS Policy: Allow admins to read all announcements
CREATE POLICY "Admins can read all announcements"
  ON announcements
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('super_admin', 'platform_admin')
    )
  );

-- Index for cron job: quickly find scheduled announcements past their time
CREATE INDEX idx_announcements_status_scheduled_at
  ON announcements (status, scheduled_at)
  WHERE status = 'scheduled';

-- Index for active announcements query
CREATE INDEX idx_announcements_status_target_roles
  ON announcements (status)
  WHERE status = 'published';

-- Index for created_by lookups
CREATE INDEX idx_announcements_created_by
  ON announcements (created_by);

-- Grant permissions
GRANT ALL ON announcements TO service_role;
GRANT SELECT ON announcements TO authenticated;
