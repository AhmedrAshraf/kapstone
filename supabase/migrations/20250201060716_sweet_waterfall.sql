-- Create email logs table
CREATE TABLE email_logs (
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

-- Create email bounces table
CREATE TABLE email_bounces (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text NOT NULL,
  reason text,
  bounce_type text,
  diagnostic_code text,
  created_at timestamptz DEFAULT now()
);

-- Create email templates table
CREATE TABLE email_templates (
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

-- Create policies
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

-- Create indexes
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at);
CREATE INDEX idx_email_bounces_email ON email_bounces(email);
CREATE INDEX idx_email_templates_name ON email_templates(name);

-- Insert default email templates
INSERT INTO email_templates (name, subject, html_content, variables) VALUES
-- Welcome Email
('welcome', 'Welcome to KAPstone Clinics', '
<h2>Welcome to KAPstone Clinics!</h2>
<p>Dear {{name}},</p>
<p>Thank you for joining KAPstone Clinics. We''re excited to have you as part of our community.</p>
<p>To get started, please verify your email address by clicking the button below:</p>
<a href="{{verificationUrl}}" style="display: inline-block; padding: 12px 24px; background-color: #8BA888; color: white; text-decoration: none; border-radius: 4px;">Verify Email</a>
<p>If you have any questions, please don''t hesitate to contact us.</p>
<p>Best regards,<br>KAPstone Clinics Team</p>
', '["name", "verificationUrl"]'),

-- Password Reset
('password_reset', 'Reset Your Password', '
<h2>Password Reset Request</h2>
<p>Hello,</p>
<p>We received a request to reset your password. Click the button below to create a new password:</p>
<a href="{{resetUrl}}" style="display: inline-block; padding: 12px 24px; background-color: #8BA888; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a>
<p>If you didn''t request this change, you can safely ignore this email.</p>
<p>Best regards,<br>KAPstone Clinics Team</p>
', '["resetUrl"]'),

-- Contact Form Auto-Reply
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

-- Contact Form Admin Notification
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
', '["name", "email", "phone", "type", "message"]');

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON email_logs TO authenticated;
GRANT ALL ON email_bounces TO authenticated;
GRANT ALL ON email_templates TO authenticated;