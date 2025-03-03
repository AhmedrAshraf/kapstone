-- Insert initial content for the home page
INSERT INTO page_content (
  id,
  page_id,
  section_id,
  content,
  content_type,
  version,
  is_published,
  published_at
) VALUES
(
  '620aacae-cc9b-4b73-ad0a-01759ba4e027',
  'home',
  'hero-title',
  'Expert Guidance in Ketamine-Assisted Psychotherapy',
  'text',
  1,
  true,
  now()
),
(
  'f8b5c5a1-d3e4-4b5c-9c1a-2b3c4d5e6f7a',
  'home',
  'hero-subtitle',
  'Connecting patients with trusted clinics and advancing the field through professional collaboration.',
  'text',
  1,
  true,
  now()
);

-- Update RLS policies to be more permissive for initial setup
DROP POLICY IF EXISTS "Anyone can view published content" ON page_content;
DROP POLICY IF EXISTS "Super admins can manage content" ON page_content;

CREATE POLICY "Anyone can view content"
  ON page_content FOR SELECT
  USING (true);

CREATE POLICY "Super admins can manage content"
  ON page_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'super_admin'
    )
  );