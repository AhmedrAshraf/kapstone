-- Fix the users relationship issue by specifying the correct foreign key
CREATE OR REPLACE FUNCTION get_forum_posts(post_id uuid DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  author_id uuid,
  category_id uuid,
  created_at timestamptz,
  author_name text,
  author_email text,
  category_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.content,
    p.author_id,
    p.category_id,
    p.created_at,
    u.full_name as author_name,
    u.email as author_email,
    c.name as category_name
  FROM forum_posts p
  LEFT JOIN users u ON u.id = p.author_id
  LEFT JOIN forum_categories c ON c.id = p.category_id
  WHERE (post_id IS NULL OR p.id = post_id);
END;
$$ LANGUAGE plpgsql;

-- Update forum_posts queries
DROP POLICY IF EXISTS "Members can view posts" ON forum_posts;
CREATE POLICY "Members can view posts"
  ON forum_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('professional', 'clinic_admin', 'super_admin')
    )
  );

-- Update referrals queries
DROP POLICY IF EXISTS "Members can view active referrals" ON referrals;
CREATE POLICY "Members can view active referrals"
  ON referrals FOR SELECT
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('professional', 'clinic_admin', 'super_admin')
    )
  );

-- Update announcements queries
DROP POLICY IF EXISTS "Members can view published announcements" ON announcements;
CREATE POLICY "Members can view published announcements"
  ON announcements FOR SELECT
  USING (
    is_published = true AND
    (publish_date IS NULL OR publish_date <= now()) AND
    (expiry_date IS NULL OR expiry_date > now()) AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('professional', 'clinic_admin', 'super_admin')
    )
  );

-- Fix the content/description field issues
ALTER TABLE forum_posts
  ADD COLUMN IF NOT EXISTS description text;

ALTER TABLE referrals
  ADD COLUMN IF NOT EXISTS content text;

-- Migrate data if needed
UPDATE forum_posts SET description = content WHERE description IS NULL;
UPDATE referrals SET content = description WHERE content IS NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_referrals_author ON referrals(author_id);
CREATE INDEX IF NOT EXISTS idx_announcements_author ON announcements(author_id);