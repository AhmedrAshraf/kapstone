/*
  # Forum Replies Fix

  1. Changes
    - Add forum_replies table if not exists
    - Enable RLS on forum_replies table
    - Add policies for forum replies
    - Add indexes for better performance

  2. Security
    - Enable RLS
    - Add policies for authenticated users
    - Ensure proper access control
*/

-- Create forum_replies table if not exists
CREATE TABLE IF NOT EXISTS forum_replies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES forum_posts(id) ON DELETE CASCADE,
  author_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_solution boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

-- Create policies for forum replies
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

CREATE POLICY "Authors can update own replies"
  ON forum_replies FOR UPDATE
  USING (author_id = auth.uid());

CREATE POLICY "Authors can delete own replies"
  ON forum_replies FOR DELETE
  USING (author_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_replies_post ON forum_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_author ON forum_replies(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_created ON forum_replies(created_at);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_forum_replies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_forum_replies_timestamp ON forum_replies;
CREATE TRIGGER update_forum_replies_timestamp
  BEFORE UPDATE ON forum_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_forum_replies_updated_at();