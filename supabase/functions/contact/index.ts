import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { Resend } from 'https://esm.sh/@resend/node@0.5.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      {
        auth: {
          persistSession: false
        }
      }
    );

    // Get Mailgun configuration from secrets
    const { data: adminEmails } = await supabaseAdmin
      .from('admin_emails')
      .select('email')
      .eq('is_active', true)
      .contains('notification_types', ['contact_form']);

    if (!adminEmails?.length) {
      throw new Error('No admin emails configured');
    }

    const { data: resendConfig, error: configError } = await supabaseAdmin
      .from('secrets')
      .select('key, value')
      .eq('key', 'RESEND_API_KEY')
      .single();

    if (configError || !resendConfig) {
      throw new Error('Resend configuration not found');
    }

    const resend = new Resend(resendConfig.value);

    // Validate request
    if (!req.body) {
      throw new Error('No request body');
    }

    const { name, email, phone, type, message } = await req.json();

    // Validate required fields
    if (!name || !email || !type || !message) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          code: 'VALIDATION_ERROR'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check rate limit
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    const { data: rateLimit, error: rateLimitError } = await supabaseAdmin.rpc(
      'check_rate_limit',
      { 
        p_ip_address: clientIp,
        p_endpoint: 'contact',
        p_max_requests: 5,
        p_window_minutes: 60
      }
    );

    if (rateLimitError) throw rateLimitError;
    
    if (!rateLimit) {
      return new Response(
        JSON.stringify({ 
          error: 'Too many requests. Please try again later.',
          code: 'RATE_LIMIT'
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check for email bounces
    const { data: bounces } = await supabaseAdmin
      .from('email_bounces')
      .select('*')
      .eq('email', email)
      .limit(1);

    if (bounces?.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: 'This email address cannot receive messages',
          code: 'EMAIL_BOUNCE'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Send emails using Resend
    const emailPromises = [
      // Send to all admin emails
      ...adminEmails.map(admin => 
        resend.emails.send({
          from: 'KAPstone Clinics <no-reply@mail.kapstoneclinics.com>',
          to: admin.email,
          subject: `New Contact Form Submission from ${name}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Type:</strong> ${type}</p>
            <p><strong>Message:</strong></p>
            <blockquote style="margin: 20px 0; padding: 10px 20px; border-left: 4px solid #4A3B7C; background-color: #f9f9f9;">
              ${message}
            </blockquote>
          `
        })
      ),
      // Send auto-reply to user
      resend.emails.send({
        from: 'KAPstone Clinics <no-reply@mail.kapstoneclinics.com>',
        to: email,
        subject: 'Thank You for Contacting KAPstone Clinics',
        html: `
          <h2>Thank You for Getting in Touch</h2>
          <p>Dear ${name},</p>
          <p>Thank you for contacting KAPstone Clinics. We have received your message and will get back to you as soon as possible.</p>
          <p>For your reference, here's a copy of your message:</p>
          <blockquote style="margin: 20px 0; padding: 10px 20px; border-left: 4px solid #4A3B7C; background-color: #f9f9f9;">
            ${message}
          </blockquote>
          <p>Best regards,<br>KAPstone Clinics Team</p>
        `
      })
    ];

    // Send all emails in parallel
    const results = await Promise.all(emailPromises);

    // Log successful emails
    for (const result of results) {
      await supabaseAdmin
        .from('email_logs')
        .insert({
          to_email: result.to,
          subject: result.subject,
          status: 'sent',
          metadata: {
            resend_id: result.id
          }
        });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error sending email:', error);

    // Log error
    try {
      await supabaseAdmin
        .from('email_logs')
        .insert({
        to_email: error.to || 'unknown',
        subject: error.subject || 'Contact Form Error',
        status: 'error',
        error_message: error.message,
        metadata: error.metadata || {}
      });
    } catch (logError) {
      console.error('Error logging failure:', logError);
    }

    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to send message. Please try again later.',
        code: error.code || 'UNKNOWN_ERROR'
      }),
      { 
        status: error.status || 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});