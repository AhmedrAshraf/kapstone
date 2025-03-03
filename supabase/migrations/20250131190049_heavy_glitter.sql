-- Add content_html column to forum_posts
ALTER TABLE forum_posts 
ADD COLUMN IF NOT EXISTS content_html text;

-- Add content_html column to announcements
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS content_html text;

-- Add content_html column to referrals
ALTER TABLE referrals 
ADD COLUMN IF NOT EXISTS content_html text;

-- Add content_html column to case_reports
ALTER TABLE case_reports 
ADD COLUMN IF NOT EXISTS content_html text;

-- Migrate existing content to content_html
DO $$
BEGIN
  -- For forum_posts
  UPDATE forum_posts 
  SET content_html = content 
  WHERE content_html IS NULL 
  AND content IS NOT NULL;
EXCEPTION
  WHEN undefined_column THEN
    NULL;
END $$;

DO $$
BEGIN
  -- For announcements
  UPDATE announcements 
  SET content_html = content 
  WHERE content_html IS NULL 
  AND content IS NOT NULL;
EXCEPTION
  WHEN undefined_column THEN
    NULL;
END $$;

DO $$
BEGIN
  -- For referrals (using description instead of content)
  UPDATE referrals 
  SET content_html = description 
  WHERE content_html IS NULL 
  AND description IS NOT NULL;
EXCEPTION
  WHEN undefined_column THEN
    NULL;
END $$;

DO $$
BEGIN
  -- For case_reports
  UPDATE case_reports 
  SET content_html = content 
  WHERE content_html IS NULL 
  AND content IS NOT NULL;
EXCEPTION
  WHEN undefined_column THEN
    NULL;
END $$;

-- Create function to handle content updates
CREATE OR REPLACE FUNCTION handle_content_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Store original content in content_html
  NEW.content_html = CASE 
    WHEN TG_TABLE_NAME = 'referrals' THEN NEW.description
    ELSE NEW.content
  END;
  
  -- Set content format if not set
  IF NEW.content_format IS NULL THEN
    NEW.content_format = 'markdown';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for content handling
DROP TRIGGER IF EXISTS forum_posts_content_update ON forum_posts;
CREATE TRIGGER forum_posts_content_update
  BEFORE INSERT OR UPDATE ON forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION handle_content_update();

DROP TRIGGER IF EXISTS announcements_content_update ON announcements;
CREATE TRIGGER announcements_content_update
  BEFORE INSERT OR UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION handle_content_update();

DROP TRIGGER IF EXISTS referrals_content_update ON referrals;
CREATE TRIGGER referrals_content_update
  BEFORE INSERT OR UPDATE ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION handle_content_update();

DROP TRIGGER IF EXISTS case_reports_content_update ON case_reports;
CREATE TRIGGER case_reports_content_update
  BEFORE INSERT OR UPDATE ON case_reports
  FOR EACH ROW
  EXECUTE FUNCTION handle_content_update();