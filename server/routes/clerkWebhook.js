const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { client: turso } = require('../lib/turso');

async function setTursoSubscription(userId, subscriptionId, status, plan, expiresAt) {
  if (!userId) return;

  const upd = `INSERT OR REPLACE INTO subscriptions
    (id, user_id, status, plan, stripe_subscription_id, expires_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`;

  const args = [subscriptionId || `${userId}-${Date.now()}`, userId, status, plan || 'pro', subscriptionId || null, expiresAt || null];
  try {
    await turso.execute({ sql: upd, args });
  } catch (err) {
    console.error('[Clerk Webhook] DB error', err);
    throw err;
  }
}

async function setClerkMetadata(userId, isPro) {
  if (!userId || !process.env.CLERK_API_KEY) return;

  try {
    await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.CLERK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ public_metadata: { pro_status: isPro ? 'active' : 'inactive' } }),
    });
  } catch (err) {
    console.warn('[Clerk Webhook] failed update clerk metadata', err.message);
  }
}

router.post('/', express.json(), async (req, res) => {
  const event = req.body;
  const signature = req.headers['clerk-signature'];

  // Recommended: validate the signature. If not set, we accept but warn.
  if (process.env.CLERK_WEBHOOK_SECRET && signature) {
    const verify = require('@clerk/clerk-sdk-node').Webhook.verify;
    try {
      verify(JSON.stringify(event), signature, process.env.CLERK_WEBHOOK_SECRET);
    } catch (err) {
      console.error('[Clerk Webhook] signature verification failed:', err.message);
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }
  }

  // Event types: subscription.created, subscription.updated, subscription.canceled
  const type = event.type || event.event_type || '';
  const data = event.data || {};
  const subscription = data.object || data.subscription || data;

  let userId = subscription?.user_id || subscription?.clerk_user_id || data?.user_id || null;
  const status = (subscription?.status || '').toLowerCase();
  const plan = subscription?.plan?.id || subscription?.plan_id || 'pro';
  const subscriptionId = subscription?.id || subscription?.subscription_id || null;
  const expiresAt = subscription?.current_period_end || subscription?.expires_at || null;

  if (!userId && data?.user) {
    userId = data.user.id;
  }

  if (!userId) {
    console.warn('[Clerk Webhook] no userId found in event', type, JSON.stringify(event));
    return res.status(400).json({ message: 'userId missing in webhook payload' });
  }

  try {
    if (['subscription.created', 'subscription.updated', 'user.subscription.updated'].includes(type)) {
      await setTursoSubscription(userId, subscriptionId, status || 'active', plan, expiresAt);
      await setClerkMetadata(userId, status === 'active');
      return res.json({ ok: true });
    }

    if (['subscription.deleted', 'user.subscription.deleted', 'subscription.canceled', 'user.subscription.canceled'].includes(type)) {
      await setTursoSubscription(userId, subscriptionId, 'canceled', plan, expiresAt);
      await setClerkMetadata(userId, false);
      return res.json({ ok: true });
    }

    // Unhandled event
    return res.json({ ok: true, message: 'Event ignored' });
  } catch (err) {
    console.error('[Clerk Webhook] error:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
