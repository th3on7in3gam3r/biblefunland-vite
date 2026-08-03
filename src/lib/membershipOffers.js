/**
 * src/lib/membershipOffers.js
 *
 * Draft marketing matrix for Free / Pro / Family — human review before CRM,
 * email, or production copy pushes. Aligned with ProGate + AdsContext
 * entitlements (AI suite, Growth tools, parent progress, ad-free).
 *
 * Does not rewrite MoneyGap Score™ or Opportunity Index™.
 * Any revenue impact figures cited elsewhere are AI Estimate only.
 */

import { STRIPE_PRICES } from './stripe';

/** Short exclusive highlights for badges, gates, and CTAs */
export const PRO_EXCLUSIVES = [
  'Unlimited AI devotionals & Bible chat',
  'Bible certification & reading plans',
  'Ad-free experience',
  'Parent progress reports & printable packs',
];

export const FAMILY_TEASER =
  'Family from $9.99/mo — 5 seats, shared prayer journal & early access';

export const PLAN_PRICES = {
  free: { monthly: '$0', annual: '$0' },
  pro: { monthly: '$3.99', annual: '$2.99' },
  family: { monthly: '$9.99', annual: '$5.99' },
};

/** Compact Free vs Pro rows for homepage comparison */
export const HOME_COMPARE = {
  free: [
    { text: 'All Bible games', ok: true },
    { text: 'Prayer Wall & Verse of the Day', ok: true },
    { text: 'Lumina Bible app', ok: true },
    { text: 'AI devotionals & character chat', ok: false },
    { text: 'Bible certification', ok: false },
    { text: 'Ad-free experience', ok: false },
  ],
  pro: [
    { text: 'All Bible games', ok: true },
    { text: 'Prayer Wall & Verse of the Day', ok: true },
    { text: 'Lumina Bible app', ok: true },
    { text: 'Unlimited AI tools', ok: true },
    { text: 'Full certification & growth tools', ok: true },
    { text: 'Ad-free experience', ok: true },
  ],
};

/**
 * Pricing-page plan cards. Feature lists match enforced access:
 * Free does not include AI quotas — /ai and /grow are Pro-gated.
 */
export const MEMBERSHIP_PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: PLAN_PRICES.free,
    period: { monthly: 'forever free', annual: 'forever free' },
    color: 'var(--ink)',
    features: [
      { text: 'All 9 Bible games', ok: true },
      { text: 'Lumina Bible app', ok: true },
      { text: 'Prayer wall', ok: true },
      { text: 'Verse of the Day', ok: true },
      { text: 'Basic flashcards', ok: true },
      { text: 'AI devotionals & Bible chat', ok: false },
      { text: 'Ad-free experience', ok: false },
      { text: 'Downloadable content', ok: false },
      { text: 'Family sharing (5 users)', ok: false },
    ],
    priceId: null,
    cta: 'Get Started Free',
    ctaStyle: 'outline',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: PLAN_PRICES.pro,
    period: {
      monthly: 'per month',
      annual: 'per month · billed $35.88/yr',
    },
    color: 'var(--violet)',
    popular: true,
    features: [
      { text: 'Everything in Free', ok: true },
      { text: 'Unlimited AI devotionals & chat', ok: true },
      { text: 'Bible certification & reading plans', ok: true },
      { text: 'Ad-free experience', ok: true },
      { text: 'All flashcard decks', ok: true },
      { text: 'Parent progress reports', ok: true },
      { text: 'Downloadable worksheets', ok: true },
      { text: 'Family sharing (5 users)', ok: false },
    ],
    priceId: {
      monthly: STRIPE_PRICES.pro_monthly,
      annual: STRIPE_PRICES.pro_annual,
    },
    cta: 'Start Free Trial',
    ctaStyle: 'main',
  },
  {
    id: 'family',
    name: 'Family',
    price: PLAN_PRICES.family,
    period: {
      monthly: 'per month · up to 5 members',
      annual: 'per month · billed $71.88/yr',
    },
    color: 'var(--orange)',
    features: [
      { text: 'Everything in Pro', ok: true },
      { text: '5 family member accounts', ok: true },
      { text: 'Family progress dashboard', ok: true },
      { text: 'Shared prayer journal', ok: true },
      { text: "Kids' mode with parental controls", ok: true },
      { text: 'Printable activity packs', ok: true },
      { text: 'Priority support', ok: true },
      { text: 'Early access to new features', ok: true },
    ],
    priceId: {
      monthly: STRIPE_PRICES.family_monthly,
      annual: STRIPE_PRICES.family_annual,
    },
    cta: 'Start Family Trial',
    ctaStyle: 'orange',
  },
];

/** Emoji hints for Family early-access marketing cards */
export const EARLY_ACCESS_EMOJIS = {
  bible_ai_coach: '🧑‍🏫',
  family_challenges: '🏆',
  voice_prayer: '🎙️',
  bible_memory_league: '🥇',
};
