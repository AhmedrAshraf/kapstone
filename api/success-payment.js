const express = require('express');
const stripe = require('stripe')('sk_test_51I5T0LAPOlDLh3vrH9SCfa11zu6IowKl8gp039L3TP0C0Lc7ObAaJ1YUzQlIgotdmzDWz5vFH0FehElL7pQtPSYj00s4HBElDS');
const app = express();
const cors = require('cors')
app.use(cors());
app.use(express.json());

app.get('/api/success-payment', async (req, res) => {
const { session_id } = req.query;
console.log("🚀 ~ app.post ~ req.query:", req.query)
try {
  if (!session_id) {
    return res.status(400).json({ error: "Price ID is missing." });
  }
  const session = await stripe.checkout.sessions.retrieve(session_id);
        
  // if (session.payment_status !== "active") {
  //     return res.status(400).json({ error: "Payment not completed" });
  // }
  const subscriptionId = session.subscription;
  
  if (!subscriptionId) {
    return res.status(400).json({ error: "No subscription found for this session." });
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  console.log("🚀 ~ app.get ~ subscription:", subscription)

  const currentPeriodEndDate = subscription.current_period_end;
  const endDate = new Date(currentPeriodEndDate * 1000);


  const uid = session.client_reference_id;
  res.redirect(`http://localhost:5173/checkout/success?paid=${subscription.status}&uid=${uid}&session=${session_id}&subscription=${subscriptionId}&end_date=${endDate.toISOString()}`);

  // res.redirect(`https://kapstone-sandy.vercel.app/checkout/success?paid=true&uid=${uid}&session=${session_id}&subscription=${subscriptionId}&end_date=${endDate.toISOString()}`);

} catch (error) {
  console.error("Error creating checkout session:", error);
  res.status(500).json({ error: error.message });
//   res.redirect(`http://localhost:5173/cancel`);
  res.redirect(`https://kapstone-sandy.vercel.app/cancel`);
}
});


app.listen(8100, () =>{
    console.log(`running on 8100`);
})