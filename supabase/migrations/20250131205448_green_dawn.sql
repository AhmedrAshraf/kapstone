-- Add markdown support to referrals
ALTER TABLE referrals
ADD COLUMN IF NOT EXISTS markdown_content text,
ADD COLUMN IF NOT EXISTS content_format text DEFAULT 'markdown';

-- Create function to handle markdown content
CREATE OR REPLACE FUNCTION handle_referrals_markdown()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.content_format = 'markdown' THEN
    NEW.markdown_content = NEW.description;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for markdown content
DROP TRIGGER IF EXISTS referrals_markdown ON referrals;
CREATE TRIGGER referrals_markdown
  BEFORE INSERT OR UPDATE ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION handle_referrals_markdown();