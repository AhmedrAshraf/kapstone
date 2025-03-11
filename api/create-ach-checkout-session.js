const express = require('express');
const stripe = require('stripe')('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');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

app.post('/api/create-ach-checkout-session', async (req, res) => {
  const { priceId, userId } = req.body;
    console.log("🚀 ~ app.post ~ req.body:", req.body)
    try {
      if (!priceId || !userId) {
        return res.status(400).json({ error: "Price ID is missing." });
      }
      
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["us_bank_account"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        // success_url: `http://localhost:8100/api/success-payment?session_id={CHECKOUT_SESSION_ID}`,
        success_url: `https://kapstone-sandy.vercel.app/api/success-payment?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://kapstone-sandy.vercel.app/cancel`,
        client_reference_id: userId
      });
      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating ACH checkout session:", error);
      res.status(500).json({ error: error.message });
    }
  });

app.listen(8400, () => {
  console.log("Server running on port 8400");
});
