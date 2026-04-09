// src/context/AdsContext.jsx
// ─────────────────────────────────────────────────────────
// Controls whether ads show based on:
//   1. Cookie consent (analytics + ads granted)
//   2. Pro subscription status (Pro = no ads)
//   3. Admin users (no ads)
//
// Usage:
//   const { showAds, isProUser, consent } = useAds()
// ─────────────────────────────────────────────────────────

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { getSubscription } from '../lib/db';
import { getCookieConsent } from '../components/CookieConsent';

const AdsContext = createContext(null);

export function AdsProvider({ children }) {
  const { user } = useAuth();
  const [consent, setConsent] = useState(() => getCookieConsent());
  const [isProUser, setIsProUser] = useState(false);
  const [isFamilyUser, setIsFamilyUser] = useState(false);
  const [proChecked, setProChecked] = useState(false);

  // Check Pro/Family status from server
  useEffect(() => {
    if (!user) {
      setIsProUser(false);
      setIsFamilyUser(false);
      setProChecked(true);
      return;
    }
    checkProStatus();
  }, [user]);

  async function checkProStatus() {
    try {
      const { data } = await getSubscription(user.id);
      if (data?.status === 'active' && new Date(data.expires_at) > new Date()) {
        const plan = data.plan || 'pro';
        setIsFamilyUser(plan === 'family');
        setIsProUser(true); // family includes all pro features
      } else {
        const localPro = localStorage.getItem('bfl_pro_status');
        const localPlan = localStorage.getItem('bfl_plan');
        setIsProUser(localPro === 'active');
        setIsFamilyUser(localPlan === 'family');
      }
    } catch {
      const localPro = localStorage.getItem('bfl_pro_status');
      const localPlan = localStorage.getItem('bfl_plan');
      setIsProUser(localPro === 'active');
      setIsFamilyUser(localPlan === 'family');
    }
    setProChecked(true);
  }

  function updateConsent(newConsent) {
    setConsent(newConsent);
  }

  // Ads show only when:
  // - Cookie consent granted for ads
  // - User is NOT on Pro/Family plan
  // - Supabase Pro check has completed
  const adsGranted = consent?.ads !== false;
  const showAds = proChecked && !isProUser && adsGranted;

  // Push AdSense ad units after consent
  useEffect(() => {
    if (!showAds) return;
    try {
      const adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle = adsbygoogle;
    } catch {}
  }, [showAds]);

  return (
    <AdsContext.Provider
      value={{
        consent,
        showAds,
        isProUser,
        isFamilyUser,
        proChecked,
        updateConsent,
        adsGranted,
      }}
    >
      {children}
    </AdsContext.Provider>
  );
}

export const useAds = () => {
  const ctx = useContext(AdsContext);
  if (!ctx) throw new Error('useAds must be used inside AdsProvider');
  return ctx;
};

/*
  ── Supabase: Create subscriptions table ──

  Run in Supabase SQL Editor:

  CREATE TABLE subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'inactive',    -- 'active' | 'canceled' | 'past_due'
    plan TEXT DEFAULT 'free',          -- 'free' | 'pro' | 'family'
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    current_period_start TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
  );

  ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Users read own subscription"
    ON subscriptions FOR SELECT USING (auth.uid() = user_id);

  -- Stripe webhook updates this table via Supabase Edge Function
  -- See src/lib/stripe.js for webhook setup instructions
*/
