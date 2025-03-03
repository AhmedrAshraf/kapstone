-- First check and drop existing policies
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Members can view posts" ON forum_posts;
  DROP POLICY IF EXISTS "Members can create posts" ON forum_posts;
  DROP POLICY IF EXISTS "Members can update own posts" ON forum_posts;
  DROP POLICY IF EXISTS "Members can delete own posts" ON forum_posts;
  DROP POLICY IF EXISTS "Members can view announcements" ON announcements;
  DROP POLICY IF EXISTS "Super admins can manage announcements" ON announcements;
  DROP POLICY IF EXISTS "Members can view referrals" ON referrals;
  DROP POLICY IF EXISTS "Members can create referrals" ON referrals;
  DROP POLICY IF EXISTS "Members can update own referrals" ON referrals;
EXCEPTION
  WHEN undefined_table THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

-- Drop existing constraints if they exist
DO $$ 
BEGIN
  -- Drop forum_posts constraints
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'forum_posts_author_id_fkey') THEN
    ALTER TABLE forum_posts DROP CONSTRAINT forum_posts_author_id_fkey;
  END IF;

  -- Drop announcements constraints
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'announcements_author_id_fkey') THEN
    ALTER TABLE announcements DROP CONSTRAINT announcements_author_id_fkey;
  END IF;

  -- Drop referrals constraints
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'referrals_author_id_fkey') THEN
    ALTER TABLE referrals DROP CONSTRAINT referrals_author_id_fkey;
  END IF;
END $$;

-- Create or update tables with proper relationships
ALTER TABLE forum_posts
ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES forum_categories(id),
ADD COLUMN IF NOT EXISTS is_pinned boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_locked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0;

ALTER TABLE announcements
ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS publish_date timestamptz,
ADD COLUMN IF NOT EXISTS expiry_date timestamptz;

ALTER TABLE referrals
ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS specialties text[] NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS contact_info jsonb NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Enable RLS
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Create new policies
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
    AND (
      is_published = true
      AND (publish_date IS NULL OR publish_date <= now())
      AND (expiry_date IS NULL OR expiry_date > now())
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