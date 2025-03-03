-- Add categories column to blogs table
ALTER TABLE blogs
ADD COLUMN IF NOT EXISTS categories text[] DEFAULT ARRAY[]::text[];

-- Add comment explaining the column's purpose
COMMENT ON COLUMN blogs.categories IS 'Array of category names associated with the blog post';

-- Create index for categories search
CREATE INDEX IF NOT EXISTS idx_blogs_categories ON blogs USING gin(categories);

-- Update RLS policies to include categories in selection
DROP POLICY IF EXISTS "Anyone can view published blogs" ON blogs;
CREATE POLICY "Anyone can view published blogs"
  ON blogs FOR SELECT
  USING (
    status = 'published' 
    AND deleted_at IS NULL
  );

-- Grant array operators permission to authenticated users
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;