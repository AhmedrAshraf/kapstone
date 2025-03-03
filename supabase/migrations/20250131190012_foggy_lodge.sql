-- Add editing tracking columns to forum_posts
ALTER TABLE forum_posts 
ADD COLUMN IF NOT EXISTS last_edited_at timestamptz,
ADD COLUMN IF NOT EXISTS edited_by uuid REFERENCES users(id);

-- Add editing tracking columns to announcements
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS last_edited_at timestamptz,
ADD COLUMN IF NOT EXISTS edited_by uuid REFERENCES users(id);

-- Add editing tracking columns to referrals
ALTER TABLE referrals 
ADD COLUMN IF NOT EXISTS last_edited_at timestamptz,
ADD COLUMN IF NOT EXISTS edited_by uuid REFERENCES users(id);

-- Add editing tracking columns to case_reports
ALTER TABLE case_reports 
ADD COLUMN IF NOT EXISTS last_edited_at timestamptz,
ADD COLUMN IF NOT EXISTS edited_by uuid REFERENCES users(id);

-- Update forum posts policies
DROP POLICY IF EXISTS "users_can_edit_own_posts" ON forum_posts;
CREATE POLICY "users_can_edit_own_posts" ON forum_posts
FOR UPDATE USING (
  (auth.uid() = author_id AND 
   EXTRACT(EPOCH FROM (now() - created_at)) / 3600 <= 24) -- 24 hours
  OR 
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.auth_id = auth.uid() 
    AND users.role = 'super_admin'
  )
);

-- Update announcements policies
DROP POLICY IF EXISTS "super_admin_can_edit_announcements" ON announcements;
CREATE POLICY "super_admin_can_edit_announcements" ON announcements
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.auth_id = auth.uid() 
    AND users.role = 'super_admin'
  )
);

-- Update referrals policies
DROP POLICY IF EXISTS "users_can_edit_own_referrals" ON referrals;
CREATE POLICY "users_can_edit_own_referrals" ON referrals
FOR UPDATE USING (
  auth.uid() = author_id
  OR 
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.auth_id = auth.uid() 
    AND users.role = 'super_admin'
  )
);

-- Update case reports policies
DROP POLICY IF EXISTS "users_can_edit_own_case_reports" ON case_reports;
CREATE POLICY "users_can_edit_own_case_reports" ON case_reports
FOR UPDATE USING (
  auth.uid() = author_id
  OR 
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.auth_id = auth.uid() 
    AND users.role = 'super_admin'
  )
);

-- Create function to update last_edited fields
CREATE OR REPLACE FUNCTION update_last_edited()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_edited_at = now();
  NEW.edited_by = (SELECT id FROM users WHERE auth_id = auth.uid());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add triggers for tracking edits
DROP TRIGGER IF EXISTS forum_posts_last_edited ON forum_posts;
CREATE TRIGGER forum_posts_last_edited
  BEFORE UPDATE ON forum_posts
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION update_last_edited();

DROP TRIGGER IF EXISTS announcements_last_edited ON announcements;
CREATE TRIGGER announcements_last_edited
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION update_last_edited();

DROP TRIGGER IF EXISTS referrals_last_edited ON referrals;
CREATE TRIGGER referrals_last_edited
  BEFORE UPDATE ON referrals
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION update_last_edited();

DROP TRIGGER IF EXISTS case_reports_last_edited ON case_reports;
CREATE TRIGGER case_reports_last_edited
  BEFORE UPDATE ON case_reports
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION update_last_edited();