const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const { createClient } = require('@libsql/client');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');
const turso = createClient({
  url: process.env.TURSO_DATABASE_URL || process.env.VITE_TURSO_DATABASE_URL || 'file:memory.db',
  authToken: process.env.TURSO_AUTH_TOKEN || process.env.VITE_TURSO_AUTH_TOKEN || '',
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

  async function upsertStripeSubscription(subscription, mode, sessionMetadata) {
    const userId = subscription?.metadata?.userId || sessionMetadata?.userId || null;
    const planItem = subscription?.items?.data?.[0]?.plan;
    const plan = planItem?.nickname || planItem?.id || mode || 'pro';
    const status = subscription?.status || 'inactive';
    const expiresAt = subscription?.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null;

    if (!userId) {
      console.warn('[Stripe webhook] no userId available for subscription', subscription?.id);
      return;
    }

    await turso.execute({
      sql: `INSERT OR REPLACE INTO subscriptions
        (id, user_id, status, plan, stripe_subscription_id, stripe_customer_id, current_period_start, expires_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        subscription.id,
        userId,
        status,
        plan,
        subscription.id,
        subscription.customer || null,
        subscription.current_period_start
          ? new Date(subscription.current_period_start * 1000).toISOString()
          : null,
        expiresAt,
        new Date().toISOString(),
      ],
    });

    console.log(`[Stripe webhook] synced subscription ${subscription.id} for user ${userId} status=${status}`);
  }

  if (['checkout.session.completed', 'customer.subscription.updated', 'invoice.payment_succeeded', 'invoice.payment_failed', 'customer.subscription.deleted'].includes(event.type)) {
    try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const checkoutSubscriptionId = session.subscription;
        if (!checkoutSubscriptionId) {
          console.warn('[Stripe webhook] session missing subscription id:', session.id);
        } else {
          const stripeSubscription = await stripe.subscriptions.retrieve(checkoutSubscriptionId);
          await upsertStripeSubscription(stripeSubscription, session.mode, session.metadata);
        }

        return res.json({ received: true });
      }

      const object = event.data.object;
      let subscription = object;

      if (event.type === 'invoice.payment_succeeded' || event.type === 'invoice.payment_failed') {
        if (object.subscription) {
          subscription = await stripe.subscriptions.retrieve(object.subscription);
        }
      }

      if (event.type === 'customer.subscription.deleted') {
        subscription = { ...object, status: 'canceled' };
      }

      await upsertStripeSubscription(subscription, 'pro', object?.metadata || {});
      return res.json({ received: true });
    } catch (err) {
      console.error('[Stripe webhook] processing error', err);
      return res.status(500).send('Webhook processing error');
    }
  }

  // Fallback for events we don't process specifically
  res.json({ received: true });
});

module.exports = router;
