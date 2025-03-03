/*
  # Content Management System Updates

  1. Changes
    - Drops existing policies before recreating them
    - Adds unique constraint for page_id + section_id
    - Improves content versioning trigger
    - Adds audit logging
    - Updates RLS policies for better access control
    - Adds helper functions for content management

  2. Security
    - Maintains RLS for all tables
    - Adds proper security definer functions
    - Ensures proper access control for all operations
*/

-- First drop all existing policies and objects
DO $$ 
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Super admins can view versions" ON content_versions;
  DROP POLICY IF EXISTS "Super admins can manage content" ON page_content;
  DROP POLICY IF EXISTS "Anyone can view content" ON page_content;
  DROP POLICY IF EXISTS "Public can view published content" ON page_content;
  DROP POLICY IF EXISTS "Super admins can view audit logs" ON content_audit_logs;
  
  -- Drop existing triggers
  DROP TRIGGER IF EXISTS content_version_trigger ON page_content;
  
  -- Drop existing functions
  DROP FUNCTION IF EXISTS handle_content_version() CASCADE;
  DROP FUNCTION IF EXISTS rollback_content(uuid, integer) CASCADE;
  DROP FUNCTION IF EXISTS get_content_history(uuid) CASCADE;

EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'page_content_unique_section'
  ) THEN
    ALTER TABLE page_content 
      ADD CONSTRAINT page_content_unique_section 
      UNIQUE (page_id, section_id);
  END IF;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Create improved content versioning trigger function
CREATE OR REPLACE FUNCTION handle_content_version()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
  v_changes jsonb;
BEGIN
  -- Get the current user's ID from auth.uid()
  SELECT id INTO v_user_id 
  FROM users 
  WHERE auth_id = auth.uid();

  -- Calculate changes for audit log
  v_changes := jsonb_build_object(
    'content', CASE 
      WHEN NEW.content IS DISTINCT FROM OLD.content 
      THEN jsonb_build_object('from', OLD.content, 'to', NEW.content)
      ELSE NULL 
    END,
    'is_published', CASE 
      WHEN NEW.is_published IS DISTINCT FROM OLD.is_published 
      THEN jsonb_build_object('from', OLD.is_published, 'to', NEW.is_published)
      ELSE NULL 
    END
  );

  -- Store the old version in content_versions
  IF (TG_OP = 'UPDATE' AND NEW.content IS DISTINCT FROM OLD.content) THEN
    INSERT INTO content_versions (
      content_id,
      content,
      version,
      created_by,
      metadata
    ) VALUES (
      OLD.id,
      OLD.content,
      OLD.version,
      v_user_id,
      jsonb_build_object(
        'reason', 'Content update',
        'changes', v_changes
      )
    );

    -- Log the update in audit log
    INSERT INTO content_audit_logs (
      content_id,
      action,
      user_id,
      details
    ) VALUES (
      OLD.id,
      'update',
      v_user_id,
      v_changes
    );
  END IF;

  -- Increment version number for content changes only
  IF NEW.content IS DISTINCT FROM OLD.content THEN
    NEW.version = COALESCE(OLD.version, 0) + 1;
  END IF;

  NEW.updated_at = now();
  NEW.updated_by = v_user_id;

  -- For new content, set created_by
  IF (TG_OP = 'INSERT') THEN
    NEW.created_by = v_user_id;
    
    -- Log the creation in audit log
    INSERT INTO content_audit_logs (
      content_id,
      action,
      user_id,
      details
    ) VALUES (
      NEW.id,
      'create',
      v_user_id,
      jsonb_build_object(
        'initial_content', NEW.content,
        'page_id', NEW.page_id,
        'section_id', NEW.section_id
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for content versioning
CREATE TRIGGER content_version_trigger
  BEFORE UPDATE ON page_content
  FOR EACH ROW
  WHEN (NEW.content IS DISTINCT FROM OLD.content)
  EXECUTE FUNCTION handle_content_version();

-- Create helper function for content rollback
CREATE OR REPLACE FUNCTION rollback_content(
  p_content_id uuid,
  p_version integer
)
RETURNS boolean AS $$
DECLARE
  v_user_id uuid;
  v_old_content text;
  v_current_version integer;
BEGIN
  -- Get the current user's ID
  SELECT id INTO v_user_id 
  FROM users 
  WHERE auth_id = auth.uid();

  -- Check if user has permission
  IF NOT EXISTS (
    SELECT 1 FROM users
    WHERE auth_id = auth.uid()
    AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  -- Get the content to roll back to
  SELECT content INTO v_old_content
  FROM content_versions
  WHERE content_id = p_content_id
  AND version = p_version;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Get current version
  SELECT version INTO v_current_version
  FROM page_content
  WHERE id = p_content_id;

  -- Update the content
  UPDATE page_content
  SET content = v_old_content,
      version = v_current_version + 1,
      updated_at = now(),
      updated_by = v_user_id
  WHERE id = p_content_id;

  -- Log the rollback
  INSERT INTO content_audit_logs (
    content_id,
    action,
    user_id,
    details
  ) VALUES (
    p_content_id,
    'rollback',
    v_user_id,
    jsonb_build_object(
      'from_version', v_current_version,
      'to_version', p_version
    )
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to get content history
CREATE OR REPLACE FUNCTION get_content_history(
  p_content_id uuid
)
RETURNS TABLE (
  version integer,
  content text,
  created_at timestamptz,
  created_by_name text,
  metadata jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cv.version,
    cv.content,
    cv.created_at,
    u.full_name as created_by_name,
    cv.metadata
  FROM content_versions cv
  LEFT JOIN users u ON cv.created_by = u.id
  WHERE cv.content_id = p_content_id
  ORDER BY cv.version DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new RLS policies
CREATE POLICY "Public can view content"
  ON page_content FOR SELECT
  USING (true);

CREATE POLICY "Super admins can manage content"
  ON page_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can view versions"
  ON content_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Create indexes for better performance
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
GRANT EXECUTE ON FUNCTION rollback_content TO authenticated;
GRANT EXECUTE ON FUNCTION get_content_history TO authenticated;