-- Insert initial content for all pages
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
('home', 'feature-3-content', 'Access comprehensive resources, case studies, and latest research in ketamine-assisted psychotherapy.', 'text', 1, true, now()),

-- For Patients Page
('for-patients', 'hero-title', 'Begin Your Journey to Healing', 'text', 1, true, now()),
('for-patients', 'hero-subtitle', 'Thank you for taking this important step in learning more about ketamine treatment. We understand that seeking help for mental health challenges requires courage, and we''re here to provide you with clear, comprehensive information about how Ketamine-Assisted Psychotherapy (KAP) might help you or your loved ones.', 'text', 1, true, now()),

-- For Professionals Page
('for-professionals', 'hero-title', 'Join the Gold Standard in Ketamine-Assisted Psychotherapy', 'text', 1, true, now()),
('for-professionals', 'hero-subtitle', 'Joining Kapstone Clinics opens the door to a host of benefits for member clinics, creating a partnership rooted in excellence and innovation.', 'text', 1, true, now()),
('for-professionals', 'intro-text', 'As part of our network, your clinic becomes part of a community of dedicated professionals committed to raising the standard of mental health care by creating a collective voice for conscientious treatment with ketamine in a field that, to date risks.', 'text', 1, true, now()),

-- Contact Page
('contact', 'hero-title', 'Get in Touch', 'text', 1, true, now()),
('contact', 'hero-subtitle', 'Have a question or want to learn more? We''re here to help.', 'text', 1, true, now()),

-- Privacy Page
('privacy', 'title', 'Privacy Policy', 'text', 1, true, now()),
('privacy', 'intro', 'KAPstone Clinics is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.', 'text', 1, true, now()),

-- Terms Page
('terms', 'title', 'Terms of Service', 'text', 1, true, now()),
('terms', 'intro', 'By accessing or using KAPstone Clinics'' website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations.', 'text', 1, true, now());

-- Update RLS policies
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