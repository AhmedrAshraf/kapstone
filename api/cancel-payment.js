const express = require('express');
const stripe = require('stripe')('sk_test_51I5T0LAPOlDLh3vrH9SCfa11zu6IowKl8gp039L3TP0C0Lc7ObAaJ1YUzQlIgotdmzDWz5vFH0FehElL7pQtPSYj00s4HBElDS');
const app = express();
const cors = require('cors')
app.use(cors());
app.use(express.json());
const { createClient } = require('@supabase/supabase-js'); 

const supabase = createClient('https://mkxmqvbgderbnicculke.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1reG1xdmJnZGVyYm5pY2N1bGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODMwODY0OSwiZXhwIjoyMDUzODg0NjQ5fQ.Nwn3JV3K_zB9LRSAjn593AcNdwYQZn9hTyipUI5hkVM');

app.post('/api/cancel-payment', async (req, res) => {
const { uid, subscriptionId } = req.body;
console.log("🚀 ~ app.post ~ req.query:", req.body)
try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    if (!subscription && !uid) {
        return res.status(404).json({ error: "Subscription not found or already canceled." });
    }
  
      if (subscription.cancel_at_period_end) {
          return res.json({ message: "Subscription is already set to cancel at period end." });
    }
  
      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
    });

    const { error } = await supabase
        .from('users')
        .update({ 
            subscription_status: 'canceled', 
            canceled_at: new Date(updatedSubscription.current_period_end * 1000) 
            })
        .eq('auth_id', uid);

        if (error) {
            throw error;
        }

      return res.json({ 
        message: "Subscription is scheduled to cancel at period end.", 
        subscriptionId: updatedSubscription.id, 
        cancelAt: updatedSubscription.current_period_end 
    });
      
} catch (error) {
    console.error("Error canceling subscription:", error);
    return res.status(500).json({ error: error.message });
}
});


// app.listen(8300, () =>{
//     console.log(`running on 8300`);
// })