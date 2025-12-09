/**
 * Import function triggers from their respective submodules:
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */


const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

// 1. Initialize Firebase Admin
admin.initializeApp();

// 2. Initialize Stripe
// ⚠️ REPLACE THIS with your Secret Key (starts with sk_test_...)
// You can find this in Stripe Dashboard > Developers > API keys
const stripe = require("stripe")(process.env.VITE_STRIPE_SECRET_KEY);

// 3. Webhook Secret
// ⚠️ REPLACE THIS with your Webhook Secret (starts with whsec_...)
// You get this AFTER you deploy the webhook and add it to Stripe Dashboard > Developers > Webhooks
const endpointSecret = process.env.VITE_STRIPE_ENDPOINT_SECRET;

// Set global options (optional, good for cost control)
setGlobalOptions({ maxInstances: 10 });

// ------------------------------------------------------------------
// Function 1: Create Stripe Checkout Session (Called by React App)
// ------------------------------------------------------------------
exports.createStripeCheckout = onRequest({ cors: true }, async (req, res) => {
  try {
    // Receive data from your React Frontend
    const { eventId, userId, userEmail } = req.body;

    if (!eventId || !userId) {
      return res.status(400).send("Missing eventId or userId");
    }

    // Create the session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "myr", // Malaysian Ringgit
            product_data: {
              name: "Event Registration Ticket",
              description: "Standard Entry",
              // Optional: You can add product-level metadata here too
              metadata: {
                eventId: eventId
              }
            },
            unit_amount: 2000, // 2000 cents = RM 20.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",

      // URLs where Stripe will redirect the user
      // ⚠️ CHANGE THESE to your production URL when you deploy your site (e.g., https://myapp.com/success)
      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/cancel",

      // ⚠️ CRITICAL: Attach Metadata so the Webhook knows who paid for what
      metadata: {
        userId: userId,
        userEmail: userEmail,
        eventId: eventId,
        type: "event_registration"
      }
    });

    // Send the URL back to the frontend so it can redirect
    res.json({ url: session.url });

  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// ------------------------------------------------------------------
// Function 2: Handle Stripe Webhook
// ------------------------------------------------------------------
// 1. Remove CORS (not needed for webhooks)
// 2. Ensure we catch all errors
exports.handleStripeWebhook = onRequest(async (req, res) => {
  const signature = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, signature, endpointSecret);
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const metadata = session.metadata;

    console.log("📦 Webhook Metadata received:", metadata);

    if (metadata && metadata.type === 'event_registration') {
      try {
        // 1. Create Registration
        const registrationRef = await admin.firestore().collection('registrations').add({
          userId: metadata.userId,
          userEmail: metadata.userEmail,
          eventId: metadata.eventId,
          amountPaid: session.amount_total / 100,
          currency: session.currency,
          paymentId: session.id,
          status: 'paid',
          registeredAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // 2. Create Attendance Subcollection
        await registrationRef.collection('attendance').add({
          status: 'absent',
          checkInTime: null,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`✅ SUCCESS: Data saved for User ${metadata.userId}`);
        
        // 🛑 FIX: Send success response immediately
        return res.status(200).json({ received: true });

      } catch (error) {
        console.error("❌ FIRESTORE WRITE ERROR:", error);
        return res.status(500).send("Database Error");
      }
    } else {
      console.log("⚠️ Metadata missing or type incorrect");
      // 🛑 FIX: Even if we ignore it, we must tell Stripe we received it
      return res.status(200).end();
    }
  }

  // 🛑 FIX: Handle other event types not explicitly caught above
  return res.status(200).end();
});
