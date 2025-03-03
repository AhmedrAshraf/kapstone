/*
  # Fix Database Relationships

  1. Changes
    - Drop existing constraints to avoid conflicts
    - Re-add foreign key relationships with proper naming
    - Add indexes for better performance
    - Update RLS policies
    - Add missing columns and constraints

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
*/

-- First drop existing constraints if they exist
DO $$ 
BEGIN
  -- Drop forum_posts constraints
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'forum_posts_author_id_fkey') THEN
    ALTER TABLE forum_posts DROP CONSTRAINT forum_posts_author_id_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'forum_posts_edited_by_fkey') THEN
    ALTER TABLE forum_posts DROP CONSTRAINT forum_posts_edited_by_fkey;
  END IF;

  -- Drop announcements constraints
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'announcements_author_id_fkey') THEN
    ALTER TABLE announcements DROP CONSTRAINT announcements_author_id_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'announcements_edited_by_fkey') THEN
    ALTER TABLE announcements DROP CONSTRAINT announcements_edited_by_fkey;
  END IF;

  -- Drop referrals constraints
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'referrals_author_id_fkey') THEN
    ALTER TABLE referrals DROP CONSTRAINT referrals_author_id_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'referrals_edited_by_fkey') THEN
    ALTER TABLE referrals DROP CONSTRAINT referrals_edited_by_fkey;
  END IF;
END $$;

-- Re-add foreign key relationships with proper naming
ALTER TABLE forum_posts
ADD CONSTRAINT forum_posts_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE forum_posts
ADD CONSTRAINT forum_posts_edited_by_fkey 
FOREIGN KEY (edited_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE announcements
ADD CONSTRAINT announcements_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE announcements
ADD CONSTRAINT announcements_edited_by_fkey 
FOREIGN KEY (edited_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE referrals
ADD CONSTRAINT referrals_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE referrals
ADD CONSTRAINT referrals_edited_by_fkey 
FOREIGN KEY (edited_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_posts_author_id ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_edited_by ON forum_posts(edited_by);
CREATE INDEX IF NOT EXISTS idx_announcements_author_id ON announcements(author_id);
CREATE INDEX IF NOT EXISTS idx_announcements_edited_by ON announcements(edited_by);
CREATE INDEX IF NOT EXISTS idx_referrals_author_id ON referrals(author_id);
CREATE INDEX IF NOT EXISTS idx_referrals_edited_by ON referrals(edited_by);

-- Update RLS policies
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Forum posts policies
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

DROP POLICY IF EXISTS "Members can create posts" ON forum_posts;
CREATE POLICY "Members can create posts"
ON forum_posts FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid()
    AND users.role IN ('professional', 'clinic_admin', 'super_admin')
  )
);

DROP POLICY IF EXISTS "Members can update own posts" ON forum_posts;
CREATE POLICY "Members can update own posts"
ON forum_posts FOR UPDATE
USING (
  (auth.uid() IN (
    SELECT id FROM users WHERE id = forum_posts.author_id
  ) AND 
  EXTRACT(EPOCH FROM (now() - created_at)) / 3600 <= 24)
  OR 
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.auth_id = auth.uid() 
    AND users.role = 'super_admin'
  )
);

-- Announcements policies
DROP POLICY IF EXISTS "Members can view announcements" ON announcements;
CREATE POLICY "Members can view announcements"
ON announcements FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid()
    AND users.role IN ('professional', 'clinic_admin', 'super_admin')
  )
  AND (
    is_published = true
    AND (publish_date IS NULL OR publish_date <= now())
    AND (expiry_date IS NULL OR expiry_date > now())
  )
);

DROP POLICY IF EXISTS "Super admins can manage announcements" ON announcements;
CREATE POLICY "Super admins can manage announcements"
ON announcements FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.auth_id = auth.uid() 
    AND users.role = 'super_admin'
  )
);

-- Referrals policies
DROP POLICY IF EXISTS "Members can view referrals" ON referrals;
CREATE POLICY "Members can view referrals"
ON referrals FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid()
    AND users.role IN ('professional', 'clinic_admin', 'super_admin')
  )
);

DROP POLICY IF EXISTS "Members can create referrals" ON referrals;
CREATE POLICY "Members can create referrals"
ON referrals FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid()
    AND users.role IN ('professional', 'clinic_admin', 'super_admin')
  )
);

DROP POLICY IF EXISTS "Members can update own referrals" ON referrals;
CREATE POLICY "Members can update own referrals"
ON referrals FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE id = referrals.author_id
  )
  OR 
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.auth_id = auth.uid() 
    AND users.role = 'super_admin'
  )
);