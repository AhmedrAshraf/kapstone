-- Create blog_content_cache table
CREATE TABLE IF NOT EXISTS blog_content_cache (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  rendered_content text NOT NULL,
  content_hash text NOT NULL,
  cache_key text NOT NULL,
  last_modified timestamptz DEFAULT now(),
  error_count integer DEFAULT 0,
  last_error text,
  last_error_at timestamptz
);

-- Enable RLS
ALTER TABLE blog_content_cache ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view cached blog content"
  ON blog_content_cache FOR SELECT
  USING (true);

CREATE POLICY "Super admins can manage cached blog content"
  ON blog_content_cache FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Create indexes
CREATE INDEX idx_blog_content_cache_post ON blog_content_cache(post_id);
CREATE INDEX idx_blog_content_cache_hash ON blog_content_cache(content_hash);

-- Create function to generate content hash
CREATE OR REPLACE FUNCTION generate_blog_content_hash(content text)
RETURNS text AS $$
BEGIN
  RETURN encode(sha256(content::bytea), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to update blog cache
CREATE OR REPLACE FUNCTION update_blog_content_cache()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate content hash
  NEW.content_hash := generate_blog_content_hash(NEW.content);

  -- Update cache
  INSERT INTO blog_content_cache (
    post_id,
    rendered_content,
    content_hash,
    cache_key
  ) VALUES (
    NEW.id,
    NEW.content,
    NEW.content_hash,
    NEW.content_hash
  )
  ON CONFLICT (post_id) 
  DO UPDATE SET
    rendered_content = EXCLUDED.rendered_content,
    content_hash = EXCLUDED.content_hash,
    last_modified = now(),
    error_count = 0,
    last_error = NULL,
    last_error_at = NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for content caching
CREATE TRIGGER update_blog_content_cache_trigger
  AFTER INSERT OR UPDATE ON blog_posts
  FOR EACH ROW
  WHEN (NEW.published = true)
  EXECUTE FUNCTION update_blog_content_cache();

-- Create function to validate blog cache
CREATE OR REPLACE FUNCTION validate_blog_cache()
RETURNS TABLE (
  post_id uuid,
  status text,
  error text
) AS $$
BEGIN
  RETURN QUERY
  WITH validation AS (
    SELECT 
      cc.post_id,
      CASE
        WHEN bp.id IS NULL THEN 'missing_post'
        WHEN cc.content_hash != generate_blog_content_hash(bp.content) THEN 'hash_mismatch'
        WHEN cc.error_count > 0 THEN 'has_errors'
        ELSE 'valid'
      END as status,
      CASE
        WHEN bp.id IS NULL THEN 'No matching post found'
        WHEN cc.content_hash != generate_blog_content_hash(bp.content) THEN 'Content hash mismatch'
        WHEN cc.error_count > 0 THEN cc.last_error
        ELSE NULL
      END as error
    FROM blog_content_cache cc
    LEFT JOIN blog_posts bp ON bp.id = cc.post_id
  )
  SELECT * FROM validation
  WHERE status != 'valid';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to repair invalid blog cache entries
CREATE OR REPLACE FUNCTION repair_blog_cache()
RETURNS void AS $$
BEGIN
  -- Update cache entries with mismatched content
  UPDATE blog_content_cache cc
  SET 
    rendered_content = bp.content,
    content_hash = generate_blog_content_hash(bp.content),
    error_count = 0,
    last_error = NULL,
    last_error_at = NULL,
    last_modified = now()
  FROM blog_posts bp
  WHERE bp.id = cc.post_id
  AND (cc.content_hash != generate_blog_content_hash(bp.content) OR cc.error_count > 0);

  -- Remove orphaned cache entries
  DELETE FROM blog_content_cache cc
  WHERE NOT EXISTS (
    SELECT 1 FROM blog_posts bp
    WHERE bp.id = cc.post_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add unique constraint
ALTER TABLE blog_content_cache 
ADD CONSTRAINT blog_content_cache_post_unique 
UNIQUE (post_id);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON blog_content_cache TO authenticated;
GRANT EXECUTE ON FUNCTION generate_blog_content_hash TO authenticated;
GRANT EXECUTE ON FUNCTION validate_blog_cache TO authenticated;
GRANT EXECUTE ON FUNCTION repair_blog_cache TO authenticated;