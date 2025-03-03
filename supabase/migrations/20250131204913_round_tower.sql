-- Add markdown support to announcements
ALTER TABLE announcements
ADD COLUMN IF NOT EXISTS markdown_content text,
ADD COLUMN IF NOT EXISTS content_format text DEFAULT 'markdown';

-- Create function to handle markdown content
CREATE OR REPLACE FUNCTION handle_announcements_markdown()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.content_format = 'markdown' THEN
    NEW.markdown_content = NEW.content;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for markdown content
DROP TRIGGER IF EXISTS announcements_markdown ON announcements;
CREATE TRIGGER announcements_markdown
  BEFORE INSERT OR UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION handle_announcements_markdown();