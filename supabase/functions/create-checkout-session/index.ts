import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.11.0?target=deno';

// Initialize Stripe with error handling
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
if (!stripeSecretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

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
    // Parse and validate request body
    const body = await req.text();
    let requestData;
    try {
      requestData = JSON.parse(body);
    } catch (e) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          details: e.message
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const { priceId, email, metadata = {} } = requestData;

    // Validate required parameters
    if (!priceId || !email) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters',
          details: { 
            priceId: !priceId ? 'Price ID is required' : undefined,
            email: !email ? 'Email is required' : undefined
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Create Stripe checkout session
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: [metadata.paymentMethod === 'ach' ? 'us_bank_account' : 'card'],
        mode: 'subscription',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        customer_email: email,
        success_url: `${req.headers.get('origin')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get('origin')}/checkout/cancel`,
        metadata: {
          ...metadata,
          email,
        },
        payment_method_collection: 'if_required',
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        customer_creation: 'always',
        subscription_data: {
          metadata: {
            ...metadata,
            email,
          },
        },
      });

      return new Response(
        JSON.stringify({ sessionId: session.id }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (stripeError) {
      console.error('Stripe API error:', stripeError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create Stripe checkout session',
          details: stripeError.message
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }
  } catch (error) {
    console.error('Server error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});