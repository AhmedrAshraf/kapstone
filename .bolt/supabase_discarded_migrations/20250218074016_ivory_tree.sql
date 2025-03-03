-- Drop existing blog-related tables if they exist
DO $$ 
BEGIN
  DROP TABLE IF EXISTS blogs CASCADE;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- Create blogs table
CREATE TABLE blogs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title varchar(255) NOT NULL,
  content text NOT NULL,
  author_id uuid REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  slug varchar(255) UNIQUE NOT NULL,
  featured_image varchar(255),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Enable RLS
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_blogs_author ON blogs(author_id);
CREATE INDEX idx_blogs_status ON blogs(status);
CREATE INDEX idx_blogs_created_at ON blogs(created_at);
CREATE INDEX idx_blogs_deleted_at ON blogs(deleted_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_blogs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_blogs_timestamp
  BEFORE UPDATE ON blogs
  FOR EACH ROW
  EXECUTE FUNCTION update_blogs_updated_at();

-- Create RLS policies
CREATE POLICY "Anyone can view published blogs"
  ON blogs FOR SELECT
  USING (
    status = 'published' 
    AND deleted_at IS NULL
  );

CREATE POLICY "Authors can manage own blogs"
  ON blogs FOR ALL
  USING (
    author_id = auth.uid()
    AND deleted_at IS NULL
  );

CREATE POLICY "Super admins can manage all blogs"
  ON blogs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON blogs TO authenticated;