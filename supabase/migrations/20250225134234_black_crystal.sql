-- Update email configuration in secrets table
INSERT INTO secrets (key, value) VALUES
  ('RESEND_API_KEY', 'YOUR_RESEND_API_KEY_HERE'),
  ('RESEND_FROM_EMAIL', 'no-reply@mail.kapstoneclinics.com'),
  ('RESEND_FROM_NAME', 'KAPstone Clinics')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    updated_at = now();

-- Update email templates to use new branding
UPDATE email_templates 
SET html_content = REPLACE(
  html_content, 
  'style="display: inline-block; padding: 12px 24px; background-color: #8BA888;',
  'style="display: inline-block; padding: 12px 24px; background-color: #4A3B7C;'
)
WHERE html_content LIKE '%style="display: inline-block; padding: 12px 24px; background-color: #8BA888;%';