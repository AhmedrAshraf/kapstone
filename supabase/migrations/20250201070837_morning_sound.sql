-- Add Mailgun configuration to secrets
INSERT INTO secrets (key, value) VALUES
  ('MAILGUN_API_KEY', 'YOUR_MAILGUN_API_KEY_HERE'),
  ('MAILGUN_DOMAIN', 'YOUR_MAILGUN_DOMAIN_HERE')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    updated_at = now();