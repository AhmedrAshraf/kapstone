-- Remove old SMTP configuration
DELETE FROM secrets 
WHERE key IN (
  'SMTP_HOSTNAME',
  'SMTP_PORT',
  'SMTP_USERNAME',
  'SMTP_PASSWORD',
  'SMTP_FROM'
);

-- Update email templates to use Resend branding
UPDATE email_templates 
SET html_content = REPLACE(
  html_content,
  'style="display: inline-block; padding: 12px 24px; background-color: #8BA888;',
  'style="display: inline-block; padding: 12px 24px; background-color: #4A3B7C;'
)
WHERE html_content LIKE '%style="display: inline-block; padding: 12px 24px; background-color: #8BA888;%';