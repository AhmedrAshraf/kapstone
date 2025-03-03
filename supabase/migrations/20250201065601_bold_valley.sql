-- Add SendGrid API key to secrets
INSERT INTO secrets (key, value) VALUES
  ('SENDGRID_API_KEY', 'SG.YOUR_SENDGRID_API_KEY_HERE')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    updated_at = now();