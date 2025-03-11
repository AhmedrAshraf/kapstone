const express = require('express');
const stripe = require('stripe')('pk_live_51QooVgJD6UP0gmmKgPV2FZpfGppfdot7t26GXRckyo4KGNdhItcoCYu4joT4uSOZL5TjSea7GJIFxbzVNyQCae5z00QuAytbQR');
const app = express();
const cors = require('cors')
app.use(cors());
app.use(express.json());

app.post('/api/create-checkout-session', async (req, res) => {
const { priceId, userId } = req.body;
console.log("🚀 ~ app.post ~ req.body:", req.body)
try {
  if (!priceId || !userId) {
    return res.status(400).json({ error: "Price ID is missing." });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { priceId},
    mode: "subscription",
    // live links
    success_url: `https://kapstone-sandy.vercel.app/api/success-payment?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `https://kapstone-sandy.vercel.app/cancel`,

    // success_url: `http://localhost:8100/api/success-payment?session_id={CHECKOUT_SESSION_ID}`,
    // cancel_url: `http://localhost:8200/cancel`,
    client_reference_id: userId
  });

  console.log("Session Created:", session);
  res.json({ id: session.id, url: session.url });
} catch (error) {
  console.error("Error creating checkout session:", error);
  res.status(500).json({ error: error.message });
}
});


app.listen(8000, () =>{
    console.log(`running on 8000`);
})