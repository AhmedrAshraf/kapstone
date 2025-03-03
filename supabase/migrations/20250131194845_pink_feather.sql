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

-- Create or update tables with proper relationships
CREATE TABLE IF NOT EXISTS forum_posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid NOT NULL,
  category_id uuid,
  is_pinned boolean DEFAULT false,
  is_locked boolean DEFAULT false,
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT forum_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT forum_posts_category_id_fkey FOREIGN KEY (category_id) REFERENCES forum_categories(id)
);

CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid NOT NULL,
  priority text NOT NULL DEFAULT 'normal',
  is_published boolean DEFAULT false,
  publish_date timestamptz,
  expiry_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT announcements_author_id_fkey FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text NOT NULL,
  author_id uuid NOT NULL,
  specialties text[] NOT NULL DEFAULT '{}',
  location text,
  contact_info jsonb NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT referrals_author_id_fkey FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON forum_posts TO authenticated;
GRANT ALL ON announcements TO authenticated;
GRANT ALL ON referrals TO authenticated;