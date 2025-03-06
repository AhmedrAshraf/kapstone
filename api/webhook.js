// require("dotenv").config();
// const express = require("express");
// const stripe = require('stripe')('sk_test_51I5T0LAPOlDLh3vrH9SCfa11zu6IowKl8gp039L3TP0C0Lc7ObAaJ1YUzQlIgotdmzDWz5vFH0FehElL7pQtPSYj00s4HBElDS');
// const cors = require("cors");
// // const { createClient } = require("@supabase/supabase-js");
// const app = express();

// // Initialize Supabase client
// // const supabaseUrl = "https://mkxmqvbgderbnicculke.supabase.co";
// // const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1reG1xdmJnZGVyYm5pY2N1bGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODMwODY0OSwiZXhwIjoyMDUzODg0NjQ5fQ.Nwn3JV3K_zB9LRSAjn593AcNdwYQZn9hTyipUI5hkVM";
// // const supabase = createClient(supabaseUrl, supabaseKey);


// // async function updateUserSubscription(customerId, subscriptionData) {
// //   console.log(`Updating subscription for customer ${customerId}:`, subscriptionData);
// //   const { data, error } = await supabase
// //     .from("users")
// //     .update({
// //       subscription_id: subscriptionData.subscriptionId || null,
// //       subscription_status: subscriptionData.status || null,
// //     })
// //     .eq("stripe_customer_id", customerId);

// //   if (error) {
// //     console.error("Error updating subscription in Supabase:", error);
// //   } else {
// //     console.log("Subscription update successful:", data);
// //   }
// // }

// app.post(
//   "/api/webhook",
//   express.raw({ type: "application/json" }),
//   async (request, response) => {
//     const sig = request.headers["stripe-signature"];
//     const endpointSecret = "whsec_4f5c2bf8506c01ca6137e3ff3b7dae53cd14b4b07245e40071deeda74333673c";

//     let event;

//     try {
//         switch (event.type) {
//           case "checkout.session.completed": {
//             const session = event.data.object;
//             console.log("Checkout Session completed:", session);
//             // await updateUserSubscription(session.customer, {
//             //   subscriptionId: session.subscription,
//             //   status: "pending",
//             // });
//             break;
//           }
//           case "invoice.payment_succeeded": {
//             const invoice = event.data.object;
//             console.log("Invoice payment succeeded:", invoice);
//             // const subscriptionId = invoice.subscription;
//             // await updateUserSubscription(invoice.customer, {
//             //   subscriptionId,
//             //   status: "active",
//             // });
//             break;
//           }
//           case "invoice.payment_failed": {
//             const failedInvoice = event.data.object;
//             console.error("Invoice payment failed:", failedInvoice);
//             // await updateUserSubscription(failedInvoice.customer, {
//             //   subscriptionId: failedInvoice.subscription,
//             //   status: "failed",
//             // });
//             break;
//           }
//           case "customer.subscription.updated": {
//             const subscriptionUpdated = event.data.object;
//             console.log("Subscription updated:", subscriptionUpdated);
//             // await updateUserSubscription(subscriptionUpdated.customer, {
//             //   subscriptionId: subscriptionUpdated.id,
//             //   status: subscriptionUpdated.status,
//             //   current_period_end: subscriptionUpdated.current_period_end,
//             // });
//             break;
//           }
//           case "payment_intent.processing": {
//             const processingIntent = event.data.object;
//             console.log("PaymentIntent processing (pending):", processingIntent);
//             // await updateUserSubscription(processingIntent.customer, {
//             //   status: "pending",
//             // });
//             break;
//           }
//           default:
//             console.log(`Unhandled event type ${event.type}`);
//         }
        
//       }catch(erorr){
//         console.log("error");
//       }
//   }
// );

// app.use(express.json());


// app.listen(8500, () => {
//   console.log("Server running on port 8500");
// });






require("dotenv").config();
const express = require("express");
const stripe = require('stripe')('sk_test_51I5T0LAPOlDLh3vrH9SCfa11zu6IowKl8gp039L3TP0C0Lc7ObAaJ1YUzQlIgotdmzDWz5vFH0FehElL7pQtPSYj00s4HBElDS');
const cors = require("cors");
const app = express();

// For webhook verification, use raw body
app.use("/webhook", express.raw({ type: "application/json" }));
app.use(cors());

app.post("/api/webhook", express.raw({ type: "application/json" }), async (request, response) => {
  const sig = request.headers["stripe-signature"];
  const endpointSecret = "whsec_4f5c2bf8506c01ca6137e3ff3b7dae53cd14b4b07245e40071deeda74333673c";
  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("Checkout Session completed:", session);
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        console.log("Invoice payment succeeded:", invoice);
        break;
      }
      case "invoice.payment_failed": {
        const failedInvoice = event.data.object;
        console.error("Invoice payment failed:", failedInvoice);
        break;
      }
      case "customer.subscription.updated": {
        const subscriptionUpdated = event.data.object;
        console.log("Subscription updated:", subscriptionUpdated);
        break;
      }
      case "payment_intent.processing": {
        const processingIntent = event.data.object;
        console.log("PaymentIntent processing (pending):", processingIntent);
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error("Error processing webhook event:", error);
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  response.json({ received: true });
});

app.use(express.json());

app.listen(8500, () => {
  console.log("Server running on port 8500");
});
