-- Add description column to blog_posts
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS description text;

-- Add content_format column to blog_posts
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS content_format text DEFAULT 'markdown';

-- Drop existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "blog_posts_public_view" ON blog_posts;
  DROP POLICY IF EXISTS "blog_posts_admin_all" ON blog_posts;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new policies with better names
CREATE POLICY "allow_public_view_published_posts"
  ON blog_posts FOR SELECT
  USING (published = true);

CREATE POLICY "allow_admin_manage_all_posts"
  ON blog_posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Create function to handle markdown content
CREATE OR REPLACE FUNCTION handle_blog_markdown()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.content_format = 'markdown' THEN
    -- Store rendered content in cache
    INSERT INTO blog_content_cache (
      post_id,
      rendered_content,
      content_hash,
      cache_key
    ) VALUES (
      NEW.id,
      NEW.content,
      generate_blog_content_hash(NEW.content),
      generate_blog_content_hash(NEW.content)
    )
    ON CONFLICT (post_id) 
    DO UPDATE SET
      rendered_content = EXCLUDED.rendered_content,
      content_hash = EXCLUDED.content_hash,
      last_modified = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for markdown handling
CREATE TRIGGER blog_markdown_trigger
  AFTER INSERT OR UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION handle_blog_markdown();

-- Grant necessary permissions
GRANT ALL ON blog_posts TO authenticated;