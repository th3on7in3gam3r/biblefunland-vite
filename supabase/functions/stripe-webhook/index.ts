// supabase/functions/stripe-webhook/index.ts
// ─────────────────────────────────────────────────────────────────────
// STRIPE WEBHOOK — activates / cancels Pro subscriptions in Supabase
//
// DEPLOY:
//   supabase functions deploy stripe-webhook --no-verify-jwt
//
// SUPABASE SECRETS (set once):
//   supabase secrets set STRIPE_SECRET_KEY=sk_live_...
//   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
//
// STRIPE DASHBOARD:
//   Webhooks → Add endpoint → https://<project>.supabase.co/functions/v1/stripe-webhook
//   Events to listen for:
//     ✅ checkout.session.completed
//     ✅ customer.subscription.updated
//     ✅ customer.subscription.deleted
//     ✅ invoice.payment_failed
// ─────────────────────────────────────────────────────────────────────

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.11.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  const signature  = req.headers.get('stripe-signature') ?? ''
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
  const body = await req.text()

  // ── Verify signature ──
  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature failed:', err.message)
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400 })
  }

  console.log('Stripe event:', event.type)

  try {
    switch (event.type) {

      // ── New checkout completed ──────────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break

        const customerId = session.customer as string
        const subscriptionId = session.subscription as string
        const userId = session.metadata?.supabase_user_id

        if (!userId) {
          console.error('No supabase_user_id in session metadata')
          break
        }

        // Fetch subscription details from Stripe
        const sub = await stripe.subscriptions.retrieve(subscriptionId)
        const planId = sub.items.data[0]?.price.id
        const plan = getPlanFromPriceId(planId)

        await upsertSubscription({
          userId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          status: 'active',
          plan,
          currentPeriodStart: new Date(sub.current_period_start * 1000).toISOString(),
          expiresAt: new Date(sub.current_period_end * 1000).toISOString(),
        })

        // Store customer ID on user metadata for future lookups
        await supabase.auth.admin.updateUserById(userId, {
          user_metadata: { stripe_customer_id: customerId }
        })

        console.log(`✅ Pro activated for user ${userId} — plan: ${plan}`)
        break
      }

      // ── Subscription renewed or updated ────────────────────────
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId = await getUserIdFromCustomer(sub.customer as string)
        if (!userId) break

        const plan = getPlanFromPriceId(sub.items.data[0]?.price.id)
        const status = sub.status === 'active' ? 'active'
          : sub.status === 'past_due'   ? 'past_due'
          : sub.status === 'canceled'   ? 'canceled'
          : 'inactive'

        await upsertSubscription({
          userId,
          stripeCustomerId: sub.customer as string,
          stripeSubscriptionId: sub.id,
          status,
          plan: status === 'active' ? plan : 'free',
          currentPeriodStart: new Date(sub.current_period_start * 1000).toISOString(),
          expiresAt: new Date(sub.current_period_end * 1000).toISOString(),
        })

        console.log(`🔄 Subscription updated for user ${userId} — status: ${status}`)
        break
      }

      // ── Subscription cancelled ──────────────────────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = await getUserIdFromCustomer(sub.customer as string)
        if (!userId) break

        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            plan: 'free',
            expires_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', sub.id)

        console.log(`❌ Subscription canceled for user ${userId}`)
        break
      }

      // ── Payment failed ──────────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const userId = await getUserIdFromCustomer(invoice.customer as string)
        if (!userId) break

        await supabase
          .from('subscriptions')
          .update({ status: 'past_due', updated_at: new Date().toISOString() })
          .eq('user_id', userId)

        console.log(`⚠️ Payment failed for user ${userId}`)
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('Webhook handler error:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})

// ── Helpers ──────────────────────────────────────────────────────────

function getPlanFromPriceId(priceId: string): string {
  // Map your Stripe Price IDs → plan names
  // These come from src/lib/stripe.js STRIPE_PRICES
  const PRICE_MAP: Record<string, string> = {
    'price_pro_monthly':    'pro',
    'price_pro_annual':     'pro',
    'price_family_monthly': 'family',
    'price_family_annual':  'family',
  }
  return PRICE_MAP[priceId] ?? 'pro'
}

async function getUserIdFromCustomer(customerId: string): Promise<string | null> {
  // Look up user by stripe_customer_id stored in subscriptions table
  const { data } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (data?.user_id) return data.user_id

  // Fallback: check user metadata
  const { data: users } = await supabase.auth.admin.listUsers()
  const user = users?.users?.find(u =>
    u.user_metadata?.stripe_customer_id === customerId
  )
  return user?.id ?? null
}

async function upsertSubscription(data: {
  userId: string
  stripeCustomerId: string
  stripeSubscriptionId: string
  status: string
  plan: string
  currentPeriodStart: string
  expiresAt: string
}) {
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id:                  data.userId,
      stripe_customer_id:       data.stripeCustomerId,
      stripe_subscription_id:   data.stripeSubscriptionId,
      status:                   data.status,
      plan:                     data.plan,
      current_period_start:     data.currentPeriodStart,
      expires_at:               data.expiresAt,
      updated_at:               new Date().toISOString(),
    }, { onConflict: 'user_id' })

  if (error) throw new Error(`Supabase upsert failed: ${error.message}`)
}

/*
  ── SQL: Create subscriptions table (run in Supabase SQL editor) ──

  CREATE TABLE IF NOT EXISTS subscriptions (
    id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id                 UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    stripe_customer_id      TEXT,
    stripe_subscription_id  TEXT,
    status                  TEXT DEFAULT 'inactive',
    plan                    TEXT DEFAULT 'free',
    current_period_start    TIMESTAMPTZ,
    expires_at              TIMESTAMPTZ,
    updated_at              TIMESTAMPTZ DEFAULT now(),
    created_at              TIMESTAMPTZ DEFAULT now()
  );
  ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Users read own sub"
    ON subscriptions FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Service role writes"
    ON subscriptions FOR ALL USING (true)
    WITH CHECK (true);

  ── IMPORTANT: Pass user ID to Stripe checkout ──
  In src/pages/Premium.jsx, add metadata when creating checkout session:
    metadata: { supabase_user_id: user.id }
*/
