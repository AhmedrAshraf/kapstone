-- Create secrets table if it doesn't exist
CREATE TABLE IF NOT EXISTS secrets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;

-- Create policy for super admins
CREATE POLICY "Super admins can manage secrets"
  ON secrets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Insert or update email configuration
INSERT INTO secrets (key, value) VALUES
  ('SMTP_HOSTNAME', 'smtp.gmail.com'),
  ('SMTP_PORT', '587'),
  ('SMTP_USERNAME', 'kapstoneclinics@gmail.com'),
  ('SMTP_PASSWORD', '#8aXd&KB4DYAbobbgtLSM7S$&TH6CfbTNRxgee#y'),
  ('SMTP_FROM', 'kapstoneclinics@gmail.com'),
  ('ADMIN_EMAIL', 'kapstoneclinics@gmail.com')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    updated_at = now();

-- Create index
CREATE INDEX IF NOT EXISTS idx_secrets_key ON secrets(key);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON secrets TO authenticated;