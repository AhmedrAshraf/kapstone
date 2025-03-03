-- First, let's create a function to help us debug the issue
CREATE OR REPLACE FUNCTION debug_announcement_access(p_user_id uuid)
RETURNS TABLE (
  auth_id uuid,
  role text,
  can_view boolean,
  reason text
) AS $$
BEGIN
  RETURN QUERY
  WITH user_check AS (
    SELECT 
      u.auth_id,
      u.role,
      EXISTS (
        SELECT 1 FROM users 
        WHERE users.auth_id = u.auth_id
        AND users.role IN ('professional', 'clinic_admin', 'super_admin')
      ) as has_valid_role
    FROM users u
    WHERE u.id = p_user_id
  )
  SELECT 
    uc.auth_id,
    uc.role,
    uc.has_valid_role,
    CASE 
      WHEN uc.auth_id IS NULL THEN 'User not found'
      WHEN NOT uc.has_valid_role THEN 'Invalid role'
      ELSE 'Should have access'
    END as reason
  FROM user_check uc;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop all existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can view announcements" ON announcements;
  DROP POLICY IF EXISTS "Members can view announcements" ON announcements;
  DROP POLICY IF EXISTS "Super admins can manage announcements" ON announcements;
  DROP POLICY IF EXISTS "Members can view published announcements" ON announcements;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Disable RLS temporarily to ensure it's properly re-enabled
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Create new simplified policies
CREATE POLICY "Allow all authenticated users to view announcements"
  ON announcements FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Super admins can manage announcements"
  ON announcements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

-- Ensure proper grants
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON announcements TO authenticated;
GRANT EXECUTE ON FUNCTION debug_announcement_access TO authenticated;

-- Add an index to help with role checks
CREATE INDEX IF NOT EXISTS idx_users_auth_id_role ON users(auth_id, role);