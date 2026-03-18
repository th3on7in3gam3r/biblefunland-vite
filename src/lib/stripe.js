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

import { loadStripe } from '@stripe/stripe-js'

// Stripe publishable key — safe to expose on client
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '')

// ── Price IDs from your Stripe Dashboard ──
// Create these in: Stripe Dashboard → Products → Add Product
export const STRIPE_PRICES = {
  pro_monthly:  'price_pro_monthly_id_here',   // $4.99/mo
  pro_annual:   'price_pro_annual_id_here',    // $35.88/yr
  family_monthly: 'price_family_monthly_id_here', // $9.99/mo
  family_annual:  'price_family_annual_id_here',  // $71.88/yr
}

// Create checkout session via Local Backend
export async function createCheckoutSession(priceId, userId, userEmail) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
  
  try {
    const response = await fetch(`${API_URL}/api/checkout/create-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, userId, userEmail })
    });
    
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    
    return data; // returns { sessionId, url }
  } catch (err) {
    console.error('Error creating checkout session:', err);
    throw err;
  }
}

export async function redirectToCheckout(priceId, userId, userEmail) {
  const stripe = await stripePromise;
  const { sessionId } = await createCheckoutSession(priceId, userId, userEmail);
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
