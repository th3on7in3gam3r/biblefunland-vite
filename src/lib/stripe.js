// ============================================================
// src/lib/stripe.js
// Stripe Payments Integration
//
// SETUP STEPS:
// 1. Install: npm install @stripe/stripe-js
// 2. Add VITE_STRIPE_PUBLISHABLE_KEY to your .env
// 3. Create Supabase Edge Function for checkout (see below)
// 4. Create products in Stripe Dashboard
// ============================================================

import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '');

// Price IDs — set VITE_STRIPE_PRICE_ID in Vercel env vars
export const STRIPE_PRICES = {
  pro_monthly:    import.meta.env.VITE_STRIPE_PRICE_ID || 'price_pro_monthly_id_here',
  pro_annual:     import.meta.env.VITE_STRIPE_PRICE_ID_ANNUAL || 'price_1TJftUDaUBBsjt5mjqCqagzw',
  family_monthly: import.meta.env.VITE_STRIPE_PRICE_ID_FAMILY || 'price_1TJfd6DaUBBsjt5mCKGPA0Hc',
  family_annual:  import.meta.env.VITE_STRIPE_PRICE_ID_FAMILY_ANNUAL || 'price_1TJfrqDaUBBsjt5mYaPWmhpq',
};

const API_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');

export async function createCheckoutSession(priceId, userId, userEmail) {
  const response = await fetch(`${API_URL}/api/checkout/create-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId, userId, userEmail }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Server error ${response.status}`);
  }
  const { sessionId, url, error } = await response.json();
  if (error) throw new Error(error);
  if (url) { window.location.href = url; return null; }
  return sessionId;
}

export async function redirectToCheckout(priceId, userId, userEmail) {
  const sessionId = await createCheckoutSession(priceId, userId, userEmail);
  if (!sessionId) return;
  const stripe = await stripePromise;
  const { error } = await stripe.redirectToCheckout({ sessionId });
  if (error) throw error;
}

/*
  ── Supabase Edge Function: create-checkout ──

  Create file: supabase/functions/create-checkout/index.ts

  import Stripe from 'https://esm.sh/stripe@14'
  import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2024-04-10',
  })

  serve(async (req) => {
    const { priceId, userId, userEmail, successUrl, cancelUrl } = await req.json()

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: userEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId },
    })

    return new Response(JSON.stringify({ sessionId: session.id }), {
      headers: { 'Content-Type': 'application/json' },
    })
  })

  Deploy with: supabase functions deploy create-checkout
  Set secret: supabase secrets set STRIPE_SECRET_KEY=sk_live_...
*/
