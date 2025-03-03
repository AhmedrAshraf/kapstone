-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS forum_posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS case_reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add markdown content support to forum_posts
ALTER TABLE forum_posts 
ADD COLUMN IF NOT EXISTS markdown_content text,
ADD COLUMN IF NOT EXISTS content_format text DEFAULT 'markdown';

-- Add markdown content support to announcements
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS markdown_content text,
ADD COLUMN IF NOT EXISTS content_format text DEFAULT 'markdown';

-- Add markdown content support to referrals
ALTER TABLE referrals 
ADD COLUMN IF NOT EXISTS markdown_content text,
ADD COLUMN IF NOT EXISTS content_format text DEFAULT 'markdown';

-- Add markdown content support to case_reports
ALTER TABLE case_reports 
ADD COLUMN IF NOT EXISTS markdown_content text,
ADD COLUMN IF NOT EXISTS content_format text DEFAULT 'markdown';

-- Migrate existing content to markdown_content for forum_posts
DO $$
BEGIN
  UPDATE forum_posts 
  SET markdown_content = content 
  WHERE markdown_content IS NULL 
  AND content IS NOT NULL;
EXCEPTION
  WHEN undefined_column THEN
    NULL;
END $$;

-- Migrate existing content to markdown_content for announcements
DO $$
BEGIN
  UPDATE announcements 
  SET markdown_content = content 
  WHERE markdown_content IS NULL 
  AND content IS NOT NULL;
EXCEPTION
  WHEN undefined_column THEN
    NULL;
END $$;

-- Migrate existing content to markdown_content for referrals
DO $$
BEGIN
  UPDATE referrals 
  SET markdown_content = description 
  WHERE markdown_content IS NULL 
  AND description IS NOT NULL;
EXCEPTION
  WHEN undefined_column THEN
    NULL;
END $$;

-- Migrate existing content to markdown_content for case_reports
DO $$
BEGIN
  UPDATE case_reports 
  SET markdown_content = content 
  WHERE markdown_content IS NULL 
  AND content IS NOT NULL;
EXCEPTION
  WHEN undefined_column THEN
    NULL;
END $$;

-- Create function to handle markdown content updates
CREATE OR REPLACE FUNCTION handle_markdown_content()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.content_format = 'markdown' THEN
    NEW.markdown_content = CASE 
      WHEN TG_TABLE_NAME = 'referrals' THEN NEW.description
      ELSE NEW.content
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for markdown content
DROP TRIGGER IF EXISTS forum_posts_markdown ON forum_posts;
CREATE TRIGGER forum_posts_markdown
  BEFORE INSERT OR UPDATE ON forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION handle_markdown_content();

DROP TRIGGER IF EXISTS announcements_markdown ON announcements;
CREATE TRIGGER announcements_markdown
  BEFORE INSERT OR UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION handle_markdown_content();

DROP TRIGGER IF EXISTS referrals_markdown ON referrals;
CREATE TRIGGER referrals_markdown
  BEFORE INSERT OR UPDATE ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION handle_markdown_content();

DROP TRIGGER IF EXISTS case_reports_markdown ON case_reports;
CREATE TRIGGER case_reports_markdown
  BEFORE INSERT OR UPDATE ON case_reports
  FOR EACH ROW
  EXECUTE FUNCTION handle_markdown_content();