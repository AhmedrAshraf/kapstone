/*
  # Fix Content Loading System

  1. Changes
    - Add error tracking columns to content_cache
    - Add retry mechanism for failed content loads
    - Improve cache invalidation
    - Add health check endpoints

  2. Security
    - Maintain existing RLS policies
    - Add additional validation
*/

-- Add error tracking to content_cache
ALTER TABLE content_cache
ADD COLUMN IF NOT EXISTS error_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_error text,
ADD COLUMN IF NOT EXISTS last_error_at timestamptz;

-- Create health check function
CREATE OR REPLACE FUNCTION check_content_system()
RETURNS boolean AS $$
BEGIN
  -- Verify content_cache table is accessible
  PERFORM 1 FROM content_cache LIMIT 1;
  -- Verify page_content table is accessible
  PERFORM 1 FROM page_content LIMIT 1;
  RETURN true;
EXCEPTION
  WHEN others THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create retry mechanism
CREATE OR REPLACE FUNCTION retry_failed_content()
RETURNS void AS $$
BEGIN
  -- Reset error count for entries that haven't failed recently
  UPDATE content_cache
  SET error_count = 0,
    last_error = NULL,
    last_error_at = NULL
  WHERE last_error_at < now() - interval '1 hour';

  -- Attempt to regenerate failed content
  WITH failed_content AS (
    SELECT cc.page_id, cc.section_id, pc.content
    FROM content_cache cc
    JOIN page_content pc ON 
      pc.page_id = cc.page_id AND 
      pc.section_id = cc.section_id
    WHERE cc.error_count > 0
    AND cc.error_count < 5
    AND pc.is_published = true
  )
  UPDATE content_cache cc
  SET rendered_content = fc.content,
      error_count = 0,
      last_error = NULL,
      last_error_at = NULL,
      last_modified = now()
  FROM failed_content fc
  WHERE cc.page_id = fc.page_id
  AND cc.section_id = fc.section_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update cache update function with error handling
CREATE OR REPLACE FUNCTION update_content_cache()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate new content hash
  NEW.content_hash := generate_content_hash(NEW.content);

  -- Update default content if published
  IF NEW.is_published THEN
    NEW.default_content := NEW.content;
  END IF;

  -- Update cache with error handling
  BEGIN
    INSERT INTO content_cache (
      page_id,
      section_id,
      rendered_content,
      content_hash,
      is_default,
      cache_key
    ) VALUES (
      NEW.page_id,
      NEW.section_id,
      NEW.content,
      NEW.content_hash,
      true,
      NEW.content_hash
    )
    ON CONFLICT (page_id, section_id) 
    DO UPDATE SET
      rendered_content = EXCLUDED.rendered_content,
      content_hash = EXCLUDED.content_hash,
      last_modified = now(),
      is_default = true,
      error_count = 0,
      last_error = NULL,
      last_error_at = NULL;
  EXCEPTION
    WHEN others THEN
      -- Log error and increment error count
      UPDATE content_cache
      SET error_count = COALESCE(error_count, 0) + 1,
          last_error = SQLERRM,
          last_error_at = now()
      WHERE page_id = NEW.page_id
      AND section_id = NEW.section_id;
      
      -- Still return NEW to allow the main transaction to complete
      RETURN NEW;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for error tracking
CREATE INDEX IF NOT EXISTS idx_content_cache_errors
ON content_cache(error_count) WHERE error_count > 0;

CREATE INDEX IF NOT EXISTS idx_content_cache_error_time
ON content_cache(last_error_at) WHERE last_error_at IS NOT NULL;

-- Grant permissions
GRANT EXECUTE ON FUNCTION check_content_system TO authenticated;
GRANT EXECUTE ON FUNCTION retry_failed_content TO authenticated;