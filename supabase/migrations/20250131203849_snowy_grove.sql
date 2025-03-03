-- Drop existing objects first
DO $$ 
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Members can view published announcements" ON announcements;
  DROP POLICY IF EXISTS "Super admins can manage announcements" ON announcements;
  
  -- Drop existing trigger
  DROP TRIGGER IF EXISTS update_announcements_timestamp ON announcements;
  
  -- Drop existing function
  DROP FUNCTION IF EXISTS update_announcements_updated_at();

EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Drop and recreate the table
DROP TABLE IF EXISTS announcements CASCADE;

CREATE TABLE announcements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  priority text NOT NULL DEFAULT 'normal',
  is_published boolean DEFAULT false,
  publish_date timestamptz,
  expiry_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Members can view published announcements"
  ON announcements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('professional', 'clinic_admin', 'super_admin')
    )
    AND (
      is_published = true
      AND (publish_date IS NULL OR publish_date <= now())
      AND (expiry_date IS NULL OR expiry_date > now())
    )
  );

CREATE POLICY "Super admins can manage announcements"
  ON announcements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.auth_id = auth.uid() 
      AND users.role = 'super_admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_announcements_author_id ON announcements(author_id);
CREATE INDEX IF NOT EXISTS idx_announcements_publish_date ON announcements(publish_date);
CREATE INDEX IF NOT EXISTS idx_announcements_expiry_date ON announcements(expiry_date);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_announcements_timestamp
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_announcements_updated_at();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON announcements TO authenticated;