-- First, clean up any duplicate content
DELETE FROM page_content a USING page_content b
WHERE a.ctid < b.ctid 
  AND a.page_id = b.page_id 
  AND a.section_id = b.section_id;

-- Add a unique constraint to prevent future duplicates
ALTER TABLE page_content 
  ADD CONSTRAINT page_content_unique_section 
  UNIQUE (page_id, section_id);

-- Update RLS policies to be more specific
DROP POLICY IF EXISTS "Anyone can view content" ON page_content;
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

-- Update the content with ON CONFLICT clause to handle duplicates
INSERT INTO page_content (
  page_id,
  section_id,
  content,
  content_type,
  version,
  is_published,
  published_at
) VALUES
-- Home Page
('home', 'hero-title', 'Expert Guidance in Ketamine-Assisted Psychotherapy', 'text', 1, true, now()),
('home', 'hero-subtitle', 'Connecting patients with trusted clinics and advancing the field through professional collaboration.', 'text', 1, true, now()),
('home', 'feature-1-title', 'Find Trusted Clinics', 'text', 1, true, now()),
('home', 'feature-1-content', 'Access our curated directory of verified ketamine-assisted psychotherapy clinics across the US.', 'text', 1, true, now()),
('home', 'feature-2-title', 'Professional Network', 'text', 1, true, now()),
('home', 'feature-2-content', 'Connect with fellow practitioners, share experiences, and advance your practice through collaboration.', 'text', 1, true, now()),
('home', 'feature-3-title', 'Educational Resources', 'text', 1, true, now()),
('home', 'feature-3-content', 'Access comprehensive resources, case studies, and latest research in ketamine-assisted psychotherapy.', 'text', 1, true, now())
ON CONFLICT (page_id, section_id) 
DO UPDATE SET 
  content = EXCLUDED.content,
  version = page_content.version + 1,
  updated_at = now();