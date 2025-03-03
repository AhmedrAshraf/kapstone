/*
  # Content Management System Policy Updates

  1. Changes
    - Drops and recreates policies with proper error handling
    - Maintains all existing functionality
    - Fixes policy naming conflicts
    - Improves error handling
    - Updates permissions

  2. Security
    - Maintains RLS for all tables
    - Ensures proper access control
*/

-- First drop all existing policies
DO $$ 
BEGIN
  -- Drop existing policies with proper error handling
  DROP POLICY IF EXISTS "Public can view content" ON page_content;
  DROP POLICY IF EXISTS "Super admins can manage content" ON page_content;
  DROP POLICY IF EXISTS "Super admins can view versions" ON content_versions;
  DROP POLICY IF EXISTS "Super admins can view audit logs" ON content_audit_logs;
  DROP POLICY IF EXISTS "Anyone can view content" ON page_content;
  DROP POLICY IF EXISTS "Public can view published content" ON page_content;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new RLS policies with unique names
CREATE POLICY "content_view_policy"
  ON page_content FOR SELECT
  USING (true);

CREATE POLICY "content_admin_policy"
  ON page_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "versions_view_policy"
  ON content_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "audit_logs_view_policy"
  ON content_audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Create indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_page_content_lookup 
ON page_content(page_id, section_id);

CREATE INDEX IF NOT EXISTS idx_content_versions_lookup 
ON content_versions(content_id, version);

CREATE INDEX IF NOT EXISTS idx_content_audit_logs_lookup 
ON content_audit_logs(content_id, created_at);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON page_content TO authenticated;
GRANT ALL ON content_versions TO authenticated;
GRANT ALL ON content_audit_logs TO authenticated;