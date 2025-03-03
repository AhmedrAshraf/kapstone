-- Drop existing policies first to avoid conflicts
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Super admins can manage email logs" ON email_logs;
  DROP POLICY IF EXISTS "Super admins can manage email bounces" ON email_bounces;
  DROP POLICY IF EXISTS "Super admins can manage email templates" ON email_templates;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  to_email text NOT NULL,
  subject text NOT NULL,
  template_name text,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  metadata jsonb DEFAULT '{}',
  ip_address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_bounces (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text NOT NULL,
  reason text,
  bounce_type text,
  diagnostic_code text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  subject text NOT NULL,
  html_content text NOT NULL,
  text_content text,
  variables jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_bounces ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Super admins can manage email logs"
  ON email_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can manage email bounces"
  ON email_bounces FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can manage email templates"
  ON email_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_email_bounces_email ON email_bounces(email);
CREATE INDEX IF NOT EXISTS idx_email_templates_name ON email_templates(name);

-- Insert or update email templates
INSERT INTO email_templates (name, subject, html_content, variables) VALUES
('contact_form_reply', 'Thank You for Contacting KAPstone Clinics', '
<h2>Thank You for Getting in Touch</h2>
<p>Dear {{name}},</p>
<p>Thank you for contacting KAPstone Clinics. We have received your message and will get back to you as soon as possible.</p>
<p>For your reference, here''s a copy of your message:</p>
<blockquote style="margin: 20px 0; padding: 10px 20px; border-left: 4px solid #8BA888; background-color: #f9f9f9;">
  {{message}}
</blockquote>
<p>Best regards,<br>KAPstone Clinics Team</p>
', '["name", "message"]'),

('contact_form_admin', 'New Contact Form Submission', '
<h2>New Contact Form Submission</h2>
<p><strong>From:</strong> {{name}}</p>
<p><strong>Email:</strong> {{email}}</p>
<p><strong>Phone:</strong> {{phone}}</p>
<p><strong>Type:</strong> {{type}}</p>
<p><strong>Message:</strong></p>
<blockquote style="margin: 20px 0; padding: 10px 20px; border-left: 4px solid #8BA888; background-color: #f9f9f9;">
  {{message}}
</blockquote>
', '["name", "email", "phone", "type", "message"]')
ON CONFLICT (name) DO UPDATE
SET 
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  variables = EXCLUDED.variables;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS check_contact_rate_limit(text, integer, integer);

-- Create rate limiting function
CREATE OR REPLACE FUNCTION check_contact_rate_limit(
  p_ip_address text,
  p_max_requests integer DEFAULT 5,
  p_window_minutes integer DEFAULT 60
)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM email_logs
    WHERE ip_address = p_ip_address
    AND created_at > now() - (p_window_minutes || ' minutes')::interval
    GROUP BY ip_address
    HAVING count(*) < p_max_requests
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON email_logs TO authenticated;
GRANT ALL ON email_bounces TO authenticated;
GRANT ALL ON email_templates TO authenticated;
GRANT EXECUTE ON FUNCTION check_contact_rate_limit TO authenticated;