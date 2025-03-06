const express = require('express');
const stripe = require('stripe')('sk_test_51I5T0LAPOlDLh3vrH9SCfa11zu6IowKl8gp039L3TP0C0Lc7ObAaJ1YUzQlIgotdmzDWz5vFH0FehElL7pQtPSYj00s4HBElDS');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

app.post("/api/create-ach-checkout-session", async (req, res) => {
    try {
      const { priceId, userId } = req.body;
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
