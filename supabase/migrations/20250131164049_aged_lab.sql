-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create forum_categories table
CREATE TABLE IF NOT EXISTS forum_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create forum_posts table
CREATE TABLE IF NOT EXISTS forum_posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id uuid REFERENCES forum_categories(id) ON DELETE CASCADE,
  author_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  is_pinned boolean DEFAULT false,
  is_locked boolean DEFAULT false,
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create forum_replies table
CREATE TABLE IF NOT EXISTS forum_replies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES forum_posts(id) ON DELETE CASCADE,
  author_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_solution boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "anyone_view_categories"
  ON forum_categories FOR SELECT
  USING (true);

CREATE POLICY "members_view_posts"
  ON forum_posts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid()
    AND users.role IN ('professional', 'clinic_admin', 'super_admin')
  ));

CREATE POLICY "members_create_posts"
  ON forum_posts FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM users
    WHERE users.auth_id = auth.uid()
    AND users.role IN ('professional', 'clinic_admin', 'super_admin')
  ));

CREATE POLICY "members_update_own_posts"
  ON forum_posts FOR UPDATE
  USING (author_id = auth.uid());

-- Insert initial categories
INSERT INTO forum_categories (name, description, slug) VALUES
('General Discussion', 'General discussion about ketamine-assisted psychotherapy', 'general-discussion'),
('Clinical Questions', 'Questions and discussions about clinical practices', 'clinical-questions'),
('Case Discussions', 'Discuss specific cases and treatment approaches', 'case-discussions'),
('Research & Literature', 'Share and discuss research papers and literature', 'research-literature'),
('Practice Management', 'Discuss clinic operations and management', 'practice-management'),
('Integration Techniques', 'Share and discuss integration methods', 'integration-techniques'),
('Professional Development', 'Training opportunities and career development', 'professional-development'),
('Technology & Tools', 'Discuss technology and tools for practice', 'technology-tools');