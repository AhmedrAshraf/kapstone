import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.11.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

serve(async (req) => {
  try {
    // Get the signature from headers
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('No signature provided');
    }

    // Get the raw body
    const body = await req.text();
    
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
    );

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const metadata = session.metadata || {};
        const customerEmail = session.customer_email;
        const subscriptionId = session.subscription;

        if (!customerEmail) {
          throw new Error('No customer email found in session');
        }

        // Get user by email
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, auth_id, role')
          .eq('email', customerEmail)
          .single();

        if (userError) throw userError;

        // Update user role based on membership type
        const newRole = metadata.membershipType === 'affiliate' 
          ? 'professional'
          : 'clinic_admin';

        await supabase
          .from('users')
          .update({ 
            role: newRole,
            subscription_id: subscriptionId,
            subscription_status: 'active'
          })
          .eq('id', userData.id);

        // Send welcome email
        await supabase.functions.invoke('send-email', {
          body: {
            to: customerEmail,
            template: 'membership_welcome',
            subject: 'Welcome to KAPstone Clinics!',
            metadata: {
              name: metadata.name || 'Member',
              membershipType: metadata.membershipType,
              location: metadata.location
            }
          }
        });

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Get customer email
        const customer = await stripe.customers.retrieve(customerId as string);
        const customerEmail = customer.email;

        if (!customerEmail) break;

        // Update subscription status
        await supabase
          .from('users')
          .update({ 
            subscription_status: subscription.status,
            subscription_updated_at: new Date().toISOString()
          })
          .eq('email', customerEmail);

        // Send notification if subscription becomes past due
        if (subscription.status === 'past_due') {
          await supabase.functions.invoke('send-email', {
            body: {
              to: customerEmail,
              template: 'subscription_past_due',
              subject: 'Action Required: Subscription Payment Past Due',
              metadata: {
                name: customer.name || 'Member',
                updateUrl: `https://billing.stripe.com/p/session/${subscription.id}`
              }
            }
          });
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Get customer email
        const customer = await stripe.customers.retrieve(customerId as string);
        const customerEmail = customer.email;

        if (!customerEmail) break;

        // Update user role and subscription status
        await supabase
          .from('users')
          .update({ 
            role: 'professional',
            subscription_status: 'canceled',
            subscription_ended_at: new Date().toISOString()
          })
          .eq('email', customerEmail);

        // Send cancellation email
        await supabase.functions.invoke('send-email', {
            body: {
              to: customerEmail,
              template: 'subscription_canceled',
              subject: 'KAPstone Clinics Membership Canceled',
              metadata: {
                name: customer.name || 'Member'
              }
            }
          });

        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});