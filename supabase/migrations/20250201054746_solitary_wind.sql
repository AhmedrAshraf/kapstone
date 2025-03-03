-- Drop and recreate forum tables with proper relationships
DO $$ 
BEGIN
  -- Drop existing tables if they exist
  DROP TABLE IF EXISTS forum_replies CASCADE;
  DROP TABLE IF EXISTS forum_posts CASCADE;
  DROP TABLE IF EXISTS forum_categories CASCADE;

  -- Create forum_categories table
  CREATE TABLE forum_categories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    description text,
    slug text UNIQUE NOT NULL,
    order_index integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
  );

  -- Create forum_posts table
  CREATE TABLE forum_posts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    title text NOT NULL,
    content text NOT NULL,
    author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id uuid REFERENCES forum_categories(id) ON DELETE SET NULL,
    is_pinned boolean DEFAULT false,
    is_locked boolean DEFAULT false,
    view_count integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  -- Create forum_replies table
  CREATE TABLE forum_replies (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id uuid NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content text NOT NULL,
    parent_id uuid REFERENCES forum_replies(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  -- Enable RLS
  ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
  ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
  ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

  -- Create policies
  CREATE POLICY "Members can view categories"
    ON forum_categories FOR SELECT
    USING (true);

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

  -- Create indexes
  CREATE INDEX idx_forum_posts_author_id ON forum_posts(author_id);
  CREATE INDEX idx_forum_posts_category_id ON forum_posts(category_id);
  CREATE INDEX idx_forum_replies_post_id ON forum_replies(post_id);
  CREATE INDEX idx_forum_replies_author_id ON forum_replies(author_id);
  CREATE INDEX idx_forum_replies_parent_id ON forum_replies(parent_id);

  -- Insert initial categories if they don't exist
  INSERT INTO forum_categories (name, description, slug, order_index) VALUES
    ('General Discussion', 'General discussion about ketamine-assisted psychotherapy', 'general-discussion', 1),
    ('Clinical Questions', 'Questions and discussions about clinical practices', 'clinical-questions', 2),
    ('Case Discussions', 'Discuss specific cases and treatment approaches', 'case-discussions', 3),
    ('Research & Literature', 'Share and discuss research papers and literature', 'research-literature', 4),
    ('Practice Management', 'Discuss clinic operations and management', 'practice-management', 5),
    ('Integration Techniques', 'Share and discuss integration methods', 'integration-techniques', 6),
    ('Professional Development', 'Training opportunities and career development', 'professional-development', 7),
    ('Technology & Tools', 'Discuss technology and tools for practice', 'technology-tools', 8)
  ON CONFLICT (slug) DO NOTHING;

END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON forum_categories TO authenticated;
GRANT ALL ON forum_posts TO authenticated;
GRANT ALL ON forum_replies TO authenticated;