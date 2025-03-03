/*
  # Content Caching System

  1. New Tables
    - `content_cache`
      - `id` (uuid, primary key)
      - `page_id` (text)
      - `section_id` (text)
      - `rendered_content` (text)
      - `cache_key` (text)
      - `last_modified` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for super admins
*/

-- Create content_cache table
CREATE TABLE IF NOT EXISTS content_cache (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id text NOT NULL,
  section_id text NOT NULL,
  rendered_content text NOT NULL,
  cache_key text NOT NULL,
  last_modified timestamptz DEFAULT now(),
  UNIQUE(page_id, section_id)
);

-- Enable RLS
ALTER TABLE content_cache ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view cached content"
  ON content_cache FOR SELECT
  USING (true);

CREATE POLICY "Super admins can manage cached content"
  ON content_cache FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Create indexes
CREATE INDEX idx_content_cache_lookup 
ON content_cache(page_id, section_id);

CREATE INDEX idx_content_cache_key 
ON content_cache(cache_key);

-- Create function to update cache
CREATE OR REPLACE FUNCTION update_content_cache()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate cache key using content hash
  INSERT INTO content_cache (
    page_id,
    section_id,
    rendered_content,
    cache_key
  ) VALUES (
    NEW.page_id,
    NEW.section_id,
    NEW.content,
    encode(sha256(NEW.content::bytea), 'hex')
  )
  ON CONFLICT (page_id, section_id) 
  DO UPDATE SET
    rendered_content = EXCLUDED.rendered_content,
    cache_key = EXCLUDED.cache_key,
    last_modified = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update cache
CREATE TRIGGER update_content_cache_trigger
  AFTER INSERT OR UPDATE ON page_content
  FOR EACH ROW
  WHEN (NEW.is_published = true)
  EXECUTE FUNCTION update_content_cache();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON content_cache TO authenticated;