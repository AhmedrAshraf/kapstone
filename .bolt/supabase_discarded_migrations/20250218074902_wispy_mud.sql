-- Drop existing tables and functions
DO $$ 
BEGIN
  -- Drop tables if they exist
  DROP TABLE IF EXISTS blog_content_cache CASCADE;
  DROP TABLE IF EXISTS blog_posts CASCADE;
  DROP TABLE IF EXISTS blogs CASCADE;

  -- Drop functions if they exist
  DROP FUNCTION IF EXISTS generate_unique_slug(text);
  DROP FUNCTION IF EXISTS auto_generate_blog_slug();
  DROP FUNCTION IF EXISTS update_blog_cache();
  
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_function THEN NULL;
END $$;

-- Create blog_posts table
CREATE TABLE blog_posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  description text,
  meta_title text,
  meta_description text,
  schema_markup text,
  featured_image text,
  categories text[] DEFAULT ARRAY[]::text[],
  published boolean DEFAULT false,
  author_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT blog_posts_categories_check CHECK (array_position(categories, NULL) IS NULL)
);

-- Create blog_content_cache table
CREATE TABLE blog_content_cache (
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

-- Create RLS policies
CREATE POLICY "Anyone can view published posts"
  ON blog_posts FOR SELECT
  USING (published = true);

CREATE POLICY "Super admins can manage all posts"
  ON blog_posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "Anyone can view cached content"
  ON blog_content_cache FOR SELECT
  USING (true);

CREATE POLICY "Super admins can manage cached content"
  ON blog_content_cache FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Create indexes
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(published);
CREATE INDEX idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_categories ON blog_posts USING gin(categories);
CREATE INDEX idx_blog_content_cache_post ON blog_content_cache(post_id);
CREATE INDEX idx_blog_content_cache_hash ON blog_content_cache(content_hash);

-- Create function to generate unique slugs
CREATE OR REPLACE FUNCTION generate_unique_slug(title text)
RETURNS text AS $$
DECLARE
  base_slug text;
  new_slug text;
  counter integer := 1;
BEGIN
  -- Convert title to lowercase and replace non-alphanumeric chars with hyphens
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

-- Create function to update cache
CREATE OR REPLACE FUNCTION update_blog_cache()
RETURNS TRIGGER AS $$
BEGIN
  -- Store content in cache
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
    last_modified = now(),
    error_count = 0,
    last_error = NULL,
    last_error_at = NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER auto_generate_blog_slug_trigger
  BEFORE INSERT ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_blog_slug();

CREATE TRIGGER update_blog_cache_trigger
  AFTER INSERT OR UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_cache();

CREATE TRIGGER update_blog_posts_timestamp
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_posts_updated_at();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON blog_posts TO authenticated;
GRANT ALL ON blog_content_cache TO authenticated;
GRANT EXECUTE ON FUNCTION generate_unique_slug TO authenticated;
GRANT EXECUTE ON FUNCTION auto_generate_blog_slug TO authenticated;
GRANT EXECUTE ON FUNCTION update_blog_cache TO authenticated;