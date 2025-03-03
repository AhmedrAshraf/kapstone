-- Create function to handle content versioning
CREATE OR REPLACE FUNCTION handle_content_version()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get the current user's ID from auth.uid()
  SELECT id INTO v_user_id FROM users WHERE auth_id = auth.uid();

  -- Store the old version in content_versions if this is an update
  IF (TG_OP = 'UPDATE') THEN
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
        'previous_version', OLD.version,
        'previous_content', OLD.content
      )
    );
  END IF;

  -- Increment version number
  NEW.version = COALESCE(OLD.version, 0) + 1;
  NEW.updated_at = now();
  NEW.updated_by = v_user_id;

  -- For new content, set created_by
  IF (TG_OP = 'INSERT') THEN
    NEW.created_by = v_user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for content versioning
DROP TRIGGER IF EXISTS content_version_trigger ON page_content;
CREATE TRIGGER content_version_trigger
  BEFORE UPDATE ON page_content
  FOR EACH ROW
  EXECUTE FUNCTION handle_content_version();

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_page_content_section_lookup 
ON page_content(page_id, section_id);

CREATE INDEX IF NOT EXISTS idx_content_versions_content_lookup 
ON content_versions(content_id, version);

-- Update RLS policies for better access control
DROP POLICY IF EXISTS "Anyone can view content" ON page_content;
CREATE POLICY "Anyone can view content"
  ON page_content FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Super admins can manage content" ON page_content;
CREATE POLICY "Super admins can manage content"
  ON page_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Create function to get content with version history
CREATE OR REPLACE FUNCTION get_content_with_history(
  p_page_id text,
  p_section_id text
) RETURNS TABLE (
  content text,
  version integer,
  created_at timestamptz,
  updated_at timestamptz,
  created_by text,
  updated_by text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.content,
    pc.version,
    pc.created_at,
    pc.updated_at,
    creator.full_name as created_by,
    updater.full_name as updated_by
  FROM page_content pc
  LEFT JOIN users creator ON pc.created_by = creator.id
  LEFT JOIN users updater ON pc.updated_by = updater.id
  WHERE pc.page_id = p_page_id
  AND pc.section_id = p_section_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON page_content TO authenticated;
GRANT ALL ON content_versions TO authenticated;
GRANT EXECUTE ON FUNCTION get_content_with_history TO authenticated;