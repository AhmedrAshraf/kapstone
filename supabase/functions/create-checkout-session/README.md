# Create Checkout Session Function

This Edge Function creates a Stripe Checkout session for KAPstone Clinics memberships.

## Environment Variables Required

- `STRIPE_SECRET_KEY`: Your Stripe secret key

## Deployment

Deploy this function to your Supabase project:

```bash
supabase functions deploy create-checkout-session --project-ref your-project-ref
```

## Usage

The function expects a POST request with the following body:

```json
{
  "priceId": "price_...",
  "email": "customer@example.com",
  "metadata": {
    "membershipType": "clinic|solo|affiliate",
    "billingInterval": "monthly|annual",
    "paymentMethod": "ach|card",
    "name": "Customer Name",
    "location": "City, State"
  }
}
```

## Response

Success:
```json
{
  "sessionId": "cs_..."
}
```

Error:
```json
{
  "error": "Error message"
}
```