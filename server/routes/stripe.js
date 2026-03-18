const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const { createClient } = require('@libsql/client');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// ─── Create Checkout Session ──────────────────────────────────────────────────
router.post('/create-session', async (req, res) => {
  const { priceId, userId, userEmail } = req.body;

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe Secret Key not configured on server' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.APP_URL || 'http://localhost:5173'}/dashboard?success=true`,
      cancel_url: `${process.env.APP_URL || 'http://localhost:5173'}/premium?canceled=true`,
      customer_email: userEmail,
      metadata: { userId },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('[Stripe Session Error]', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Stripe Webhook ───────────────────────────────────────────────────────────
// Note: Requires raw body for signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[Webhook Signature Error]', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const plan = session.amount_total > 5000 ? 'annual' : 'monthly'; // simplified logic
    
    try {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO subscriptions (id, user_id, status, plan, stripe_subscription_id, expires_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          session.id, 
          userId, 
          'active', 
          plan, 
          session.subscription, 
          new Date(Date.now() + 31536000000).toISOString(), // +1 year
          new Date().toISOString()
        ]
      });
      console.log(`[Webhook] Updated subscription for user: ${userId}`);
    } catch (dbErr) {
      console.error('[Webhook DB Error]', dbErr);
    }
  }

  res.json({ received: true });
});

module.exports = router;
