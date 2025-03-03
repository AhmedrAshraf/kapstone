-- Add parent_id column to forum_replies table
ALTER TABLE forum_replies
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES forum_replies(id) ON DELETE SET NULL;

-- Create index for better performance on parent_id lookups
CREATE INDEX IF NOT EXISTS idx_forum_replies_parent ON forum_replies(parent_id);

-- Update RLS policies to include parent_id
DROP POLICY IF EXISTS "Members can view replies" ON forum_replies;
DROP POLICY IF EXISTS "Members can create replies" ON forum_replies;

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