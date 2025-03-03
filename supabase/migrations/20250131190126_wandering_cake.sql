-- Add content_html column to store rendered content
ALTER TABLE forum_posts 
ADD COLUMN IF NOT EXISTS content_html text;

ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS content_html text;

ALTER TABLE referrals 
ADD COLUMN IF NOT EXISTS content_html text;

ALTER TABLE case_reports 
ADD COLUMN IF NOT EXISTS content_html text;

-- Migrate existing content to content_html using DO blocks for safety
DO $$
BEGIN
  -- For forum_posts
  UPDATE forum_posts 
  SET content_html = content 
  WHERE content_html IS NULL 
  AND content IS NOT NULL;
EXCEPTION
  WHEN undefined_column THEN NULL;
END $$;

DO $$
BEGIN
  -- For announcements
  UPDATE announcements 
  SET content_html = content 
  WHERE content_html IS NULL 
  AND content IS NOT NULL;
EXCEPTION
  WHEN undefined_column THEN NULL;
END $$;

DO $$
BEGIN
  -- For referrals (using description instead of content)
  UPDATE referrals 
  SET content_html = description 
  WHERE content_html IS NULL 
  AND description IS NOT NULL;
EXCEPTION
  WHEN undefined_column THEN NULL;
END $$;

DO $$
BEGIN
  -- For case_reports
  UPDATE case_reports 
  SET content_html = content 
  WHERE content_html IS NULL 
  AND content IS NOT NULL;
EXCEPTION
  WHEN undefined_column THEN NULL;
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