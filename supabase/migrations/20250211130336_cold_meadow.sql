/*
  # CMS System Setup

  1. New Tables
    - `page_content`: Stores editable page content
    - `content_versions`: Version history for content
    - `content_audit_logs`: Audit trail for all content changes

  2. Security
    - Enable RLS on all tables
    - Restrict access to super admins
    - Add policies for content management

  3. Indexes
    - Add indexes for common queries
    - Add indexes for foreign key relationships
*/

-- Create page_content table
CREATE TABLE IF NOT EXISTS page_content (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id text NOT NULL,
  section_id text NOT NULL,
  content text NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('text', 'image')),
  version integer NOT NULL DEFAULT 1,
  is_published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL
);

-- Create content_versions table
CREATE TABLE IF NOT EXISTS content_versions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id uuid REFERENCES page_content(id) ON DELETE CASCADE,
  content text NOT NULL,
  version integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'
);

-- Create content_audit_logs table
CREATE TABLE IF NOT EXISTS content_audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id uuid REFERENCES page_content(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('create', 'update', 'publish', 'rollback', 'delete')),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for page_content
CREATE POLICY "Anyone can view published content"
  ON page_content FOR SELECT
  USING (is_published = true);

CREATE POLICY "Super admins can manage content"
  ON page_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Create policies for content_versions
CREATE POLICY "Super admins can view versions"
  ON content_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can create versions"
  ON content_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Create policies for content_audit_logs
CREATE POLICY "Super admins can view audit logs"
  ON content_audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "System can create audit logs"
  ON content_audit_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Create indexes
CREATE INDEX idx_page_content_page ON page_content(page_id);
CREATE INDEX idx_page_content_section ON page_content(section_id);
CREATE INDEX idx_page_content_published ON page_content(is_published);
CREATE INDEX idx_content_versions_content ON content_versions(content_id, version);
CREATE INDEX idx_content_audit_logs_content ON content_audit_logs(content_id);
CREATE INDEX idx_content_audit_logs_action ON content_audit_logs(action);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
CREATE TRIGGER update_page_content_updated_at
  BEFORE UPDATE ON page_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON page_content TO authenticated;
GRANT ALL ON content_versions TO authenticated;
GRANT ALL ON content_audit_logs TO authenticated;