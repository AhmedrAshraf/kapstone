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

-- Migrate existing content to markdown_content using DO blocks for safety
DO $$
BEGIN
  -- For forum_posts
  UPDATE forum_posts 
  SET markdown_content = content 
  WHERE markdown_content IS NULL 
  AND content IS NOT NULL;
EXCEPTION
  WHEN undefined_column THEN NULL;
END $$;

DO $$
BEGIN
  -- For announcements
  UPDATE announcements 
  SET markdown_content = content 
  WHERE markdown_content IS NULL 
  AND content IS NOT NULL;
EXCEPTION
  WHEN undefined_column THEN NULL;
END $$;

DO $$
BEGIN
  -- For referrals (using description instead of content)
  UPDATE referrals 
  SET markdown_content = description 
  WHERE markdown_content IS NULL 
  AND description IS NOT NULL;
EXCEPTION
  WHEN undefined_column THEN NULL;
END $$;

DO $$
BEGIN
  -- For case_reports
  UPDATE case_reports 
  SET markdown_content = content 
  WHERE markdown_content IS NULL 
  AND content IS NOT NULL;
EXCEPTION
  WHEN undefined_column THEN NULL;
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