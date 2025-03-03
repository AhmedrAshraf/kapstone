import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

interface EmailData {
  to: string;
  subject: string;
  html: string;
  template?: string;
  metadata?: Record<string, any>;
}

export async function sendEmail(data: EmailData) {
  try {
    // Create email log entry
    const { data: logEntry, error: logError } = await supabaseAdmin
      .from('email_logs')
      .insert([{
        to_email: data.to,
        subject: data.subject,
        template_name: data.template,
        metadata: data.metadata || {},
        status: 'pending'
      }])
      .select()
      .single();

    if (logError) throw logError;

    // Send email
    const { error } = await supabaseAdmin.functions.invoke('send-email', {
      body: JSON.stringify(data)
    });

    if (error) throw error;

    // Update log status
    await supabaseAdmin
      .from('email_logs')
      .update({ status: 'sent' })
      .eq('id', logEntry.id);

    return { success: true, logId: logEntry.id };
  } catch (error) {
    console.error('Error sending email:', error);

    // Log error if we have a log entry
    if (logEntry?.id) {
      await supabaseAdmin
        .from('email_logs')
        .update({
          status: 'error',
          error_message: error.message
        })
        .eq('id', logEntry.id);
    }

    throw error;
  }
}

export async function sendContactForm(formData: {
  name: string;
  email: string;
  phone: string;
  type: string;
  message: string;
}) {
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

  // Send admin notification
  await sendEmail({
    to: adminEmail,
    template: 'contact_form_admin',
    subject: `New Contact Form Submission from ${formData.name}`,
    html: '', // Will be generated from template
    metadata: formData
  });

  // Send auto-reply to user
  await sendEmail({
    to: formData.email,
    template: 'contact_form_reply',
    subject: 'Thank You for Contacting KAPstone Clinics',
    html: '', // Will be generated from template
    metadata: {
      name: formData.name,
      message: formData.message
    }
  });

  return { success: true };
}

export async function checkEmailBounces(email: string): Promise<boolean> {
  const { data: bounces } = await supabaseAdmin
    .from('email_bounces')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false })
    .limit(1);

  return bounces && bounces.length > 0;
}

export async function getEmailTemplate(name: string, variables: Record<string, any> = {}) {
  const { data: template, error } = await supabaseAdmin
    .from('email_templates')
    .select('*')
    .eq('name', name)
    .single();

  if (error) throw error;

  let html = template.html_content;
  
  // Replace variables
  Object.entries(variables).forEach(([key, value]) => {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });

  return {
    subject: template.subject,
    html
  };
}