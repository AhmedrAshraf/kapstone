import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Resend } from 'https://esm.sh/@resend/node@0.5.2';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    
    // Check rate limit (10 emails per hour)
    const { data: rateLimit, error: rateLimitError } = await supabase.rpc(
      'check_rate_limit',
      { 
        p_ip_address: clientIp,
        p_endpoint: 'send-email',
        p_max_requests: 10,
        p_window_minutes: 60
      }
    );

    if (rateLimitError) throw rateLimitError;
    
    if (!rateLimit) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429,
        }
      );
    }

    const { to, subject, html, template, metadata = {} } = await req.json();

    // Check for bounces
    const { data: bounces } = await supabase
      .from('email_bounces')
      .select('*')
      .eq('email', to)
      .order('created_at', { ascending: false })
      .limit(1);

    if (bounces && bounces.length > 0) {
      throw new Error('Email address has previously bounced');
    }

    // Get template if specified
    let emailHtml = html;
    let emailSubject = subject;

    if (template) {
      const { data: templateData } = await supabase
        .from('email_templates')
        .select('*')
        .eq('name', template)
        .single();

      if (templateData) {
        emailHtml = templateData.html_content;
        emailSubject = templateData.subject;

        // Replace variables
        Object.entries(metadata).forEach(([key, value]) => {
          emailHtml = emailHtml.replace(new RegExp(`{{${key}}}`, 'g'), value);
        });
      }
    }

    // Send email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'KAPstone Clinics <no-reply@mail.kapstoneclinics.com>',
      to,
      subject: emailSubject,
      html: emailHtml,
      tags: [
        {
          name: 'template',
          value: template || 'custom'
        }
      ]
    });

    if (emailError) throw emailError;

    // Log successful email
    await supabase
      .from('email_logs')
      .insert([{
        to_email: to,
        subject: emailSubject,
        template_name: template,
        status: 'sent',
        metadata: {
          ...metadata,
          resend_id: emailData.id
        }
      }]);

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error sending email:', error);

    // Log error
    try {
      await supabase
        .from('email_logs')
        .insert([{
          to_email: to,
          subject: subject,
          template_name: template,
          status: 'error',
          error_message: error.message,
          metadata: metadata
        }]);

      // Log bounce if it's a bounce error
      if (error.message.includes('bounce')) {
        await supabase
          .from('email_bounces')
          .insert([{
            email: to,
            reason: error.message,
            bounce_type: 'hard',
            diagnostic_code: error.code
          }]);
      }
    } catch (logError) {
      console.error('Error logging failure:', logError);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.status || 500,
      }
    );
  }
});