-- Create admin_messages table for admin-to-admin messaging
CREATE TABLE IF NOT EXISTS admin_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message     text NOT NULL,
  is_read     boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_admin_messages_sender_receiver 
  ON admin_messages (sender_id, receiver_id);

CREATE INDEX IF NOT EXISTS idx_admin_messages_receiver_unread 
  ON admin_messages (receiver_id, is_read);

CREATE INDEX IF NOT EXISTS idx_admin_messages_created_at 
  ON admin_messages (created_at DESC);

-- Enable Row Level Security
ALTER TABLE admin_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read messages they sent or received
CREATE POLICY "Admins can read their messages" ON admin_messages
  FOR SELECT
  USING (
    sender_id = auth.uid() OR receiver_id = auth.uid()
  );

-- Policy: Admins can insert messages
CREATE POLICY "Admins can send messages" ON admin_messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
  );

-- Policy: Admins can update messages they received (mark as read)
CREATE POLICY "Admins can update received messages" ON admin_messages
  FOR UPDATE
  USING (
    receiver_id = auth.uid()
  );

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE admin_messages;
