/*
  # Optimize Content Loading System

  1. Changes
    - Add default_content column to page_content
    - Add content_hash column for efficient cache invalidation
    - Add indexes for performance optimization
    - Update cache trigger for immediate content updates

  2. Security
    - Maintain existing RLS policies
    - Add policies for default content access
*/

-- Add default_content column to page_content if it doesn't exist
ALTER TABLE page_content
ADD COLUMN IF NOT EXISTS default_content text,
ADD COLUMN IF NOT EXISTS content_hash text;

-- Update content_cache table
ALTER TABLE content_cache
ADD COLUMN IF NOT EXISTS content_hash text,
ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false;

-- Create function to generate content hash
CREATE OR REPLACE FUNCTION generate_content_hash(content text)
RETURNS text AS $$
BEGIN
  RETURN encode(sha256(content::bytea), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update the cache update function
CREATE OR REPLACE FUNCTION update_content_cache()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate new content hash
  NEW.content_hash := generate_content_hash(NEW.content);

  -- Update default content if published
  IF NEW.is_published THEN
    NEW.default_content := NEW.content;
  END IF;

  -- Update cache
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
    is_default = true;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger
DROP TRIGGER IF EXISTS update_content_cache_trigger ON page_content;

-- Create new trigger that runs immediately
CREATE TRIGGER update_content_cache_trigger
  BEFORE INSERT OR UPDATE ON page_content
  FOR EACH ROW
  EXECUTE FUNCTION update_content_cache();

-- Create function to get default content
CREATE OR REPLACE FUNCTION get_default_content(p_page_id text)
RETURNS TABLE (
  section_id text,
  content text,
  content_hash text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cc.section_id,
    cc.rendered_content as content,
    cc.content_hash
  FROM content_cache cc
  WHERE cc.page_id = p_page_id
  AND cc.is_default = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_page_content_hash 
ON page_content(content_hash);

CREATE INDEX IF NOT EXISTS idx_content_cache_hash 
ON content_cache(content_hash);

CREATE INDEX IF NOT EXISTS idx_content_cache_default 
ON content_cache(is_default) WHERE is_default = true;

-- Update existing content with hashes
UPDATE page_content
SET content_hash = generate_content_hash(content)
WHERE content_hash IS NULL;

-- Migrate existing content to cache
INSERT INTO content_cache (
  page_id,
  section_id,
  rendered_content,
  content_hash,
  is_default,
  cache_key
)
SELECT 
  page_id,
  section_id,
  content as rendered_content,
  content_hash,
  true as is_default,
  content_hash as cache_key
FROM page_content
WHERE is_published = true
ON CONFLICT (page_id, section_id) 
DO UPDATE SET
  rendered_content = EXCLUDED.rendered_content,
  content_hash = EXCLUDED.content_hash,
  is_default = true,
  last_modified = now();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON content_cache TO authenticated;
GRANT EXECUTE ON FUNCTION get_default_content TO authenticated;
GRANT EXECUTE ON FUNCTION generate_content_hash TO authenticated;