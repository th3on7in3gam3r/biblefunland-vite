import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { redirectToCheckout } from '../lib/stripe';
import { trackEvent } from '../lib/analytics';
import { EARLY_ACCESS_FLAGS } from '../lib/featureFlags';
import {
  EARLY_ACCESS_EMOJIS,
  MEMBERSHIP_PLANS,
  PRO_EXCLUSIVES,
} from '../lib/membershipOffers';
import styles from './Premium.module.css';

export default function Premium() {
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleSubscribe(plan) {
    trackEvent('pro_conversion_start', { plan: plan.name, annual });

    if (!plan.priceId) {
      navigate('/');
      return;
    }

    if (!user) {
      navigate('/auth?redirect=premium');
      return;
    }

    setLoading(plan.name);
    try {
      const priceId = annual ? plan.priceId.annual : plan.priceId.monthly;
      await redirectToCheckout(priceId, user.id, user.email);
    } catch (e) {
      console.error('Stripe error:', e);
      alert('Payment failed. Please try again or contact support.');
    }
    setLoading(null);
  }

  const earlyAccessItems = Object.entries(EARLY_ACCESS_FLAGS).map(([id, flag]) => ({
    id,
    emoji: EARLY_ACCESS_EMOJIS[id] || '✨',
    label: flag.label,
    desc: flag.desc,
  }));

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div
          className="section-pill"
          style={{
            background: 'rgba(245,158,11,.15)',
            color: '#FCD34D',
            display: 'inline-flex',
            marginBottom: 14,
          }}
        >
          💎 Upgrade
        </div>
        <h1 className={styles.heroH1}>Unlock the Full Experience</h1>
        <p className={styles.heroSub}>
          BibleFunLand is free forever — Pro unlocks the AI suite, certification, and an ad-free experience.
        </p>
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center',
          marginTop: 16, marginBottom: 8, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto',
        }}>
          {PRO_EXCLUSIVES.map((item) => (
            <span
              key={item}
              style={{
                fontSize: '.7rem',
                fontWeight: 700,
                color: '#C4B5FD',
                background: 'rgba(139,92,246,0.18)',
                border: '1px solid rgba(139,92,246,0.35)',
                padding: '5px 11px',
                borderRadius: 100,
              }}
            >
              {item}
            </span>
          ))}
        </div>

        {/* Billing toggle */}
        <div className={styles.toggle}>
          <span className={`${styles.toggleLabel} ${!annual ? styles.active : ''}`}>Monthly</span>
          <button
            className={`${styles.toggleBtn} ${annual ? styles.annual : ''}`}
            onClick={() => setAnnual((a) => !a)}
            aria-label="Toggle billing period"
          />
          <span className={`${styles.toggleLabel} ${annual ? styles.active : ''}`}>Annual</span>
          <span className={styles.saveBadge}>Save 40%</span>
        </div>
      </div>

      {/* Pricing grid */}
      <div className={styles.grid}>
        {MEMBERSHIP_PLANS.map((plan) => (
          <div key={plan.name} className={`${styles.card} ${plan.popular ? styles.popular : ''}`}>
            {plan.popular && <div className={styles.popularBadge}>⭐ Most Popular</div>}

            <div className={styles.planName} style={{ color: plan.color }}>
              {plan.name}
            </div>
            <div className={styles.planPrice} style={{ color: plan.color }}>
              {plan.price[annual ? 'annual' : 'monthly']}
            </div>
            <div className={styles.planPeriod}>{plan.period[annual ? 'annual' : 'monthly']}</div>

            <ul className={styles.featureList}>
              {plan.features.map((f, i) => (
                <li key={i} className={`${styles.featureItem} ${!f.ok ? styles.disabled : ''}`}>
                  <span className={f.ok ? styles.check : styles.x}>{f.ok ? '✓' : '✗'}</span>
                  {f.text}
                </li>
              ))}
            </ul>

            <button
              className={`${styles.planBtn} ${styles[plan.ctaStyle] || ''}`}
              onClick={() => handleSubscribe(plan)}
              disabled={loading === plan.name}
            >
              {loading === plan.name ? <span className={styles.btnSpinner} /> : plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Trust badges */}
      <div className={styles.trust}>
        <div className={styles.trustItem}>
          <span>🔒</span> Secure payments via Stripe
        </div>
        <div className={styles.trustItem}>
          <span>↩️</span> Cancel anytime, no questions asked
        </div>
        <div className={styles.trustItem}>
          <span>✝️</span> Supporting faith-based content
        </div>
      </div>

      {/* Early Access section — Family plan (draft / coming soon) */}
      <div style={{ maxWidth: 760, margin: '0 auto 60px', padding: '0 20px' }}>
        <div style={{
          background: 'linear-gradient(135deg,rgba(249,115,22,.08),rgba(251,146,60,.05))',
          border: '1.5px solid rgba(249,115,22,.2)', borderRadius: 24, padding: '32px 28px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: '2rem' }}>🚀</span>
            <div>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: '1.2rem', color: 'var(--ink)' }}>
                Early Access — Family Plan Exclusive
              </div>
              <div style={{ fontSize: '.78rem', color: 'var(--ink3)', fontWeight: 500 }}>
                Family subscribers get first access to features before they launch to everyone
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
            {earlyAccessItems.map((f) => (
              <div key={f.id} style={{
                background: 'var(--surface)', borderRadius: 14, padding: '14px 16px',
                border: '1px solid rgba(249,115,22,.15)',
              }}>
                <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{f.emoji}</div>
                <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 3 }}>{f.label}</div>
                <div style={{ fontSize: '.72rem', color: 'var(--ink3)', fontWeight: 500 }}>{f.desc}</div>
                <div style={{ marginTop: 8, fontSize: '.66rem', fontWeight: 800, color: '#F97316', background: 'rgba(249,115,22,.1)', padding: '2px 8px', borderRadius: 100, display: 'inline-block' }}>
                  Coming Soon
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
