-- Insert email templates for membership notifications
INSERT INTO email_templates (name, subject, html_content, variables) VALUES
-- Membership Welcome Email
('membership_welcome', 'Welcome to KAPstone Clinics!', '
<h2>Welcome to KAPstone Clinics!</h2>
<p>Dear {{name}},</p>
<p>Thank you for joining KAPstone Clinics as a {{membershipType}} member. We''re excited to have you as part of our community of dedicated professionals committed to advancing ketamine-assisted psychotherapy.</p>
<p>Your membership has been successfully activated, and you now have access to all member resources and benefits.</p>
<p>To get started:</p>
<ol>
  <li>Visit the Member Hub to access exclusive resources</li>
  <li>Complete your profile</li>
  <li>Connect with other members in our forum</li>
  <li>Explore our comprehensive resource library</li>
</ol>
<p>If you have any questions, our support team is here to help.</p>
<p>Best regards,<br>The KAPstone Clinics Team</p>
', '["name", "membershipType"]'),

-- Past Due Notification
('subscription_past_due', 'Action Required: Subscription Payment Past Due', '
<h2>Action Required: Update Payment Information</h2>
<p>Dear {{name}},</p>
<p>We noticed that your recent membership payment was unsuccessful. To maintain your access to KAPstone Clinics resources and benefits, please update your payment information as soon as possible.</p>
<p>You can update your payment details here:</p>
<a href="{{updateUrl}}" style="display: inline-block; padding: 12px 24px; background-color: #8BA888; color: white; text-decoration: none; border-radius: 4px;">Update Payment Method</a>
<p>If you need assistance, please don''t hesitate to contact our support team.</p>
<p>Best regards,<br>The KAPstone Clinics Team</p>
', '["name", "updateUrl"]'),

-- Cancellation Notification
('subscription_canceled', 'KAPstone Clinics Membership Canceled', '
<h2>Membership Cancellation Confirmation</h2>
<p>Dear {{name}},</p>
<p>We''re sorry to see you go. Your KAPstone Clinics membership has been canceled as requested.</p>
<p>If you change your mind, you''re always welcome to rejoin our community. If you have any feedback about your experience, we''d love to hear from you.</p>
<p>Best regards,<br>The KAPstone Clinics Team</p>
', '["name"]')

ON CONFLICT (name) DO UPDATE
SET 
  subject = EXCLUDED.subject,
  html_content = EXCLUDED.html_content,
  variables = EXCLUDED.variables;