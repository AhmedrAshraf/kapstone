-- Drop existing policies first
DROP POLICY IF EXISTS "Members can view replies" ON forum_replies;
DROP POLICY IF EXISTS "Members can create replies" ON forum_replies;
DROP POLICY IF EXISTS "Members can update own replies" ON forum_replies;
DROP POLICY IF EXISTS "Members can delete own replies" ON forum_replies;

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
    auth.uid() IN (
      SELECT id FROM users WHERE id = forum_replies.author_id
    )
    OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );