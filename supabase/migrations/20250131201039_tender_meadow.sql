-- First drop any existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Members can view replies" ON forum_replies;
  DROP POLICY IF EXISTS "Members can create replies" ON forum_replies;
  DROP POLICY IF EXISTS "Members can update own replies" ON forum_replies;
  DROP POLICY IF EXISTS "Members can delete own replies" ON forum_replies;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Drop and recreate the table to ensure clean state
DROP TABLE IF EXISTS forum_replies CASCADE;

-- Create forum_replies table
CREATE TABLE forum_replies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES forum_replies(id) ON DELETE CASCADE,
  content text NOT NULL,
  edited_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Members can view replies"
  ON forum_replies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('professional', 'clinic_admin', 'super_admin')
    )
  );

CREATE POLICY "Members can create replies"
  ON forum_replies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('professional', 'clinic_admin', 'super_admin')
    )
  );

CREATE POLICY "Members can update own replies"
  ON forum_replies FOR UPDATE
  USING (
    (auth.uid() IN (
      SELECT id FROM users WHERE id = forum_replies.author_id
    ) AND 
    EXTRACT(EPOCH FROM (now() - created_at)) / 3600 <= 24)
    OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "Members can delete own replies"
  ON forum_replies FOR DELETE
  USING (
    (auth.uid() IN (
      SELECT id FROM users WHERE id = forum_replies.author_id
    ) AND 
    EXTRACT(EPOCH FROM (now() - created_at)) / 3600 <= 24)
    OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_replies_post_id ON forum_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_author_id ON forum_replies(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_parent_id ON forum_replies(parent_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_edited_by ON forum_replies(edited_by);
CREATE INDEX IF NOT EXISTS idx_forum_replies_created_at ON forum_replies(created_at);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_forum_replies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_forum_replies_timestamp ON forum_replies;
CREATE TRIGGER update_forum_replies_timestamp
  BEFORE UPDATE ON forum_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_forum_replies_updated_at();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON forum_replies TO authenticated;