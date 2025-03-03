-- Create admin_emails table
CREATE TABLE admin_emails (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text NOT NULL,
  notification_types text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_emails ENABLE ROW LEVEL SECURITY;

-- Create policy for super admins
CREATE POLICY "Super admins can manage admin emails"
  ON admin_emails FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Insert initial admin email
INSERT INTO admin_emails (email, notification_types, is_active) VALUES
  ('peter@kapstone.com', ARRAY['contact_form', 'application', 'system'], true);

-- Create function to get admin emails by type
CREATE OR REPLACE FUNCTION get_admin_emails(notification_type text)
RETURNS TABLE (email text) AS $$
BEGIN
  RETURN QUERY
  SELECT ae.email
  FROM admin_emails ae
  WHERE ae.is_active = true
  AND (
    notification_type = ANY(ae.notification_types)
    OR 'all' = ANY(ae.notification_types)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update contact form function to use admin emails table
CREATE OR REPLACE FUNCTION send_contact_notification(
  p_name text,
  p_email text,
  p_phone text,
  p_type text,
  p_message text
) RETURNS void AS $$
DECLARE
  v_admin_email text;
BEGIN
  FOR v_admin_email IN SELECT email FROM get_admin_emails('contact_form')
  LOOP
    PERFORM send_email(
      v_admin_email,
      'New Contact Form Submission',
      'contact_form_admin',
      jsonb_build_object(
        'name', p_name,
        'email', p_email,
        'phone', p_phone,
        'type', p_type,
        'message', p_message
      )
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;