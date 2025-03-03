-- Drop existing policies and constraints
DO $$ 
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Members can view posts" ON forum_posts;
  DROP POLICY IF EXISTS "Members can create posts" ON forum_posts;
  DROP POLICY IF EXISTS "Members can update own posts" ON forum_posts;
  DROP POLICY IF EXISTS "Members can delete own posts" ON forum_posts;
  DROP POLICY IF EXISTS "Members can view announcements" ON announcements;
  DROP POLICY IF EXISTS "Super admins can manage announcements" ON announcements;
  DROP POLICY IF EXISTS "Members can view referrals" ON referrals;
  DROP POLICY IF EXISTS "Members can create referrals" ON referrals;
  DROP POLICY IF EXISTS "Members can update own referrals" ON referrals;

  -- Drop existing constraints
  ALTER TABLE forum_posts DROP CONSTRAINT IF EXISTS forum_posts_author_id_fkey;
  ALTER TABLE announcements DROP CONSTRAINT IF EXISTS announcements_author_id_fkey;
  ALTER TABLE referrals DROP CONSTRAINT IF EXISTS referrals_author_id_fkey;
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

-- Recreate foreign key relationships with explicit names
ALTER TABLE forum_posts
ADD CONSTRAINT forum_posts_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE announcements
ADD CONSTRAINT announcements_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE referrals
ADD CONSTRAINT referrals_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper user checks
CREATE POLICY "Members can view posts"
  ON forum_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('professional', 'clinic_admin', 'super_admin')
    )
  );

CREATE POLICY "Members can create posts"
  ON forum_posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('professional', 'clinic_admin', 'super_admin')
    )
  );

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

CREATE POLICY "Members can delete own posts"
  ON forum_posts FOR DELETE
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

CREATE POLICY "Members can view announcements"
  ON announcements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('professional', 'clinic_admin', 'super_admin')
    )
  );

CREATE POLICY "Super admins can manage announcements"
  ON announcements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "Members can view referrals"
  ON referrals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('professional', 'clinic_admin', 'super_admin')
    )
  );

CREATE POLICY "Members can create referrals"
  ON referrals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('professional', 'clinic_admin', 'super_admin')
    )
  );

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forum_posts_author_id ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category_id ON forum_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_announcements_author_id ON announcements(author_id);
CREATE INDEX IF NOT EXISTS idx_referrals_author_id ON referrals(author_id);