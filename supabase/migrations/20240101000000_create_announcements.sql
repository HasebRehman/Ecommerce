-- Migration: Create announcements table
-- Feature: Announcement Management System

CREATE TABLE IF NOT EXISTS announcements (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  subject      TEXT        NOT NULL CHECK (subject <> ''),
  message      TEXT        NOT NULL CHECK (message <> ''),
  scheduled_at TIMESTAMPTZ NOT NULL,
  status       TEXT        NOT NULL DEFAULT 'scheduled'
                           CHECK (status IN ('scheduled', 'published')),
  target_roles TEXT[]      NOT NULL CHECK (array_length(target_roles, 1) > 0),
  created_by   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for cron job: quickly find scheduled announcements past their time
CREATE INDEX IF NOT EXISTS idx_announcements_status_scheduled_at
  ON announcements (status, scheduled_at)
  WHERE status = 'scheduled';

-- Index for active announcements query
CREATE INDEX IF NOT EXISTS idx_announcements_status_target_roles
  ON announcements (status)
  WHERE status = 'published';
