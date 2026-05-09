-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  read BOOLEAN DEFAULT false,
  replied BOOLEAN DEFAULT false
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_read ON contact_messages(read);

-- Enable Row Level Security
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (submit contact form)
CREATE POLICY "Anyone can submit contact form"
  ON contact_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Only admins can view contact messages
CREATE POLICY "Only admins can view contact messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('super_admin', 'platform_admin', 'operations_admin')
    )
  );

-- Policy: Only admins can update contact messages
CREATE POLICY "Only admins can update contact messages"
  ON contact_messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('super_admin', 'platform_admin', 'operations_admin')
    )
  );

-- Add comment
COMMENT ON TABLE contact_messages IS 'Stores contact form submissions from users';
