-- Drop existing objects first
DO $$ 
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Members can view case reports" ON case_reports;
  DROP POLICY IF EXISTS "Members can create case reports" ON case_reports;
  DROP POLICY IF EXISTS "Members can update own case reports" ON case_reports;
  DROP POLICY IF EXISTS "Members can delete own case reports" ON case_reports;
  DROP POLICY IF EXISTS "Members can view case report replies" ON case_report_replies;
  DROP POLICY IF EXISTS "Members can create case report replies" ON case_report_replies;
  DROP POLICY IF EXISTS "Members can update own case report replies" ON case_report_replies;
  DROP POLICY IF EXISTS "Members can delete own case report replies" ON case_report_replies;

  -- Drop existing triggers
  DROP TRIGGER IF EXISTS update_case_reports_timestamp ON case_reports;
  DROP TRIGGER IF EXISTS update_case_report_replies_timestamp ON case_report_replies;
  
  -- Drop existing functions
  DROP FUNCTION IF EXISTS update_case_reports_updated_at();
  DROP FUNCTION IF EXISTS update_case_report_replies_updated_at();

EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Drop and recreate tables
DROP TABLE IF EXISTS case_report_replies CASCADE;
DROP TABLE IF EXISTS case_reports CASCADE;

-- Create case_reports table
CREATE TABLE case_reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_info jsonb NOT NULL DEFAULT '{
    "age": null,
    "gender": "",
    "presenting_issues": [],
    "medications": [],
    "previous_treatments": []
  }',
  assessment text,
  treatment_plan text,
  session_notes text,
  outcomes text,
  recommendations text,
  diagnostic_categories text[] DEFAULT '{}',
  keywords text[] DEFAULT '{}',
  is_published boolean DEFAULT false,
  content_format text DEFAULT 'markdown',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create case_report_replies table
CREATE TABLE case_report_replies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id uuid NOT NULL REFERENCES case_reports(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  parent_id uuid REFERENCES case_report_replies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE case_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_report_replies ENABLE ROW LEVEL SECURITY;

-- Create policies for case_reports
CREATE POLICY "Members can view case reports"
  ON case_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('professional', 'clinic_admin', 'super_admin')
    )
  );

CREATE POLICY "Members can create case reports"
  ON case_reports FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('professional', 'clinic_admin', 'super_admin')
    )
  );

CREATE POLICY "Members can update own case reports"
  ON case_reports FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE id = case_reports.author_id
    )
    OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "Members can delete own case reports"
  ON case_reports FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE id = case_reports.author_id
    )
    OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

-- Create policies for case_report_replies
CREATE POLICY "Members can view case report replies"
  ON case_report_replies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('professional', 'clinic_admin', 'super_admin')
    )
  );

CREATE POLICY "Members can create case report replies"
  ON case_report_replies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('professional', 'clinic_admin', 'super_admin')
    )
  );

CREATE POLICY "Members can update own case report replies"
  ON case_report_replies FOR UPDATE
  USING (
    (auth.uid() IN (
      SELECT id FROM users WHERE id = case_report_replies.author_id
    ) AND 
    EXTRACT(EPOCH FROM (now() - created_at)) / 3600 <= 24)
    OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "Members can delete own case report replies"
  ON case_report_replies FOR DELETE
  USING (
    (auth.uid() IN (
      SELECT id FROM users WHERE id = case_report_replies.author_id
    ) AND 
    EXTRACT(EPOCH FROM (now() - created_at)) / 3600 <= 24)
    OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_case_reports_author_id ON case_reports(author_id);
CREATE INDEX idx_case_reports_created_at ON case_reports(created_at);
CREATE INDEX idx_case_report_replies_report_id ON case_report_replies(report_id);
CREATE INDEX idx_case_report_replies_author_id ON case_report_replies(author_id);
CREATE INDEX idx_case_report_replies_parent_id ON case_report_replies(parent_id);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_case_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_case_reports_timestamp
  BEFORE UPDATE ON case_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_case_reports_updated_at();

CREATE OR REPLACE FUNCTION update_case_report_replies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_case_report_replies_timestamp
  BEFORE UPDATE ON case_report_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_case_report_replies_updated_at();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON case_reports TO authenticated;
GRANT ALL ON case_report_replies TO authenticated;