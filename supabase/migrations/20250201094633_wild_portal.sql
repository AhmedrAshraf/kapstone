-- First, drop all existing announcement policies to start fresh
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Members can view announcements" ON announcements;
  DROP POLICY IF EXISTS "Super admins can manage announcements" ON announcements;
  DROP POLICY IF EXISTS "Members can view published announcements" ON announcements;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new simplified policies
CREATE POLICY "Members can view announcements"
  ON announcements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('professional', 'clinic_admin', 'super_admin')
    )
  );

CREATE POLICY "Super admins can manage announcements"
  ON announcements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Grant necessary permissions
GRANT ALL ON announcements TO authenticated;