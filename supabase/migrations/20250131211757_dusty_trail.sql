-- Create storage bucket for attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('attachments', 'attachments', true);

-- Create file_attachments table
CREATE TABLE file_attachments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  storage_path text NOT NULL,
  content_type text NOT NULL,
  entity_type text NOT NULL, -- 'forum_post', 'announcement', 'case_report', 'referral'
  entity_id uuid NOT NULL,
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE file_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for file_attachments
CREATE POLICY "Members can view attachments"
  ON file_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('professional', 'clinic_admin', 'super_admin')
    )
  );

CREATE POLICY "Members can upload attachments"
  ON file_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('professional', 'clinic_admin', 'super_admin')
    )
  );

CREATE POLICY "Members can delete own attachments"
  ON file_attachments FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE id = file_attachments.author_id
    )
    OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

-- Create storage policies
CREATE POLICY "Members can upload files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'attachments' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Members can read files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'attachments' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Members can delete own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'attachments' AND
    auth.role() = 'authenticated' AND
    (auth.uid() = owner OR
      EXISTS (
        SELECT 1 FROM users
        WHERE users.auth_id = auth.uid()
        AND users.role = 'super_admin'
      )
    )
  );

-- Create indexes
CREATE INDEX idx_file_attachments_entity ON file_attachments(entity_type, entity_id);
CREATE INDEX idx_file_attachments_author ON file_attachments(author_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_file_attachments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_file_attachments_timestamp
  BEFORE UPDATE ON file_attachments
  FOR EACH ROW
  EXECUTE FUNCTION update_file_attachments_updated_at();

-- Grant permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON file_attachments TO authenticated;