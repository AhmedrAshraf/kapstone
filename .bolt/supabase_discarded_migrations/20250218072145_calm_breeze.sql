-- Create blog_posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  content text NOT NULL,
  content_format text DEFAULT 'markdown',
  meta_title text,
  meta_description text,
  schema_markup text,
  featured_image text,
  categories text[] DEFAULT ARRAY[]::text[],
  published boolean DEFAULT false,
  author_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create blog_content_cache table if it doesn't exist
CREATE TABLE IF NOT EXISTS blog_content_cache (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  rendered_content text NOT NULL,
  content_hash text NOT NULL,
  cache_key text NOT NULL,
  last_modified timestamptz DEFAULT now(),
  error_count integer DEFAULT 0,
  last_error text,
  last_error_at timestamptz,
  UNIQUE(post_id)
);

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_content_cache ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "blog_posts_public_view" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_admin_all" ON blog_posts;
DROP POLICY IF EXISTS "allow_public_view_published_posts" ON blog_posts;
DROP POLICY IF EXISTS "allow_admin_manage_all_posts" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_select_published" ON blog_posts;
DROP POLICY IF EXISTS "blog_posts_admin_manage" ON blog_posts;

-- Create new policies with unique names
CREATE POLICY "blog_posts_view_published_v1"
  ON blog_posts FOR SELECT
  USING (published = true);

CREATE POLICY "blog_posts_admin_all_v1"
  ON blog_posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Create policies for content cache
CREATE POLICY "blog_cache_view_v1"
  ON blog_content_cache FOR SELECT
  USING (true);

CREATE POLICY "blog_cache_admin_v1"
  ON blog_content_cache FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_categories ON blog_posts USING gin(categories);
CREATE INDEX IF NOT EXISTS idx_blog_content_cache_hash ON blog_content_cache(content_hash);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_blog_posts_timestamp
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_posts_updated_at();

-- Create function to generate unique slugs
CREATE OR REPLACE FUNCTION generate_unique_slug(title text)
RETURNS text AS $$
DECLARE
  base_slug text;
  new_slug text;
  counter integer := 1;
BEGIN
  -- Convert title to lowercase and replace spaces/special chars with hyphens
  base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  
  -- Try the base slug first
  new_slug := base_slug;
  
  -- Keep trying with incrementing numbers until we find a unique slug
  WHILE EXISTS (SELECT 1 FROM blog_posts WHERE slug = new_slug) LOOP
    counter := counter + 1;
    new_slug := base_slug || '-' || counter::text;
  END LOOP;
  
  RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-generate slug
CREATE OR REPLACE FUNCTION auto_generate_blog_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_unique_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating slugs
DROP TRIGGER IF EXISTS auto_generate_blog_slug_trigger ON blog_posts;
CREATE TRIGGER auto_generate_blog_slug_trigger
  BEFORE INSERT ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_blog_slug();

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
      encode(sha256(NEW.content::bytea), 'hex'),
      encode(sha256(NEW.content::bytea), 'hex')
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
DROP TRIGGER IF EXISTS blog_markdown_trigger ON blog_posts;
CREATE TRIGGER blog_markdown_trigger
  AFTER INSERT OR UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION handle_blog_markdown();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON blog_posts TO authenticated;
GRANT ALL ON blog_content_cache TO authenticated;