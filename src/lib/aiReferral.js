/**
 * aiReferral.js — AI assistant referral attribution + Pulse segment tracking
 */

import { trackPulseEvent } from './pulse';

const STORAGE_KEY = 'bfl_ai_referral';

const AI_SOURCES = new Set([
  'chatgpt',
  'openai',
  'perplexity',
  'claude',
  'anthropic',
  'copilot',
  'bing',
  'gemini',
  'google',
  'you',
  'phind',
  'poe',
  'meta',
  'ai',
]);

function readAttribution() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeAttribution(data) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function normalizeSource(value) {
  return (value || '').trim().toLowerCase();
}

function isAiSource(source) {
  if (!source) return false;
  if (AI_SOURCES.has(source)) return true;
  return [...AI_SOURCES].some((name) => source.includes(name));
}

function detectFromParams(searchParams, pathname) {
  const utmSource = normalizeSource(searchParams.get('utm_source'));
  const utmMedium = normalizeSource(searchParams.get('utm_medium'));
  const utmCampaign = searchParams.get('utm_campaign') || '';
  const ref = normalizeSource(searchParams.get('ref'));

  if (pathname === '/from-ai') {
    return {
      source: utmSource || 'from-ai',
      medium: utmMedium || 'landing',
      campaign: utmCampaign,
      path: pathname,
      capturedAt: new Date().toISOString(),
    };
  }

  if (ref === 'ai' || utmMedium === 'ai' || isAiSource(utmSource)) {
    return {
      source: utmSource || ref || 'ai',
      medium: utmMedium || (ref === 'ai' ? 'ref' : 'utm'),
      campaign: utmCampaign,
      path: pathname,
      capturedAt: new Date().toISOString(),
    };
  }

  return null;
}

/**
 * Persist AI referral attribution once per session.
 * @param {URLSearchParams|string} searchParams
 * @param {string} pathname
 */
export function captureAiReferral(searchParams, pathname) {
  if (readAttribution()) return readAttribution();

  const params =
    typeof searchParams === 'string' ? new URLSearchParams(searchParams) : searchParams;
  const detected = detectFromParams(params, pathname);
  if (!detected) return null;

  writeAttribution(detected);
  return detected;
}

/** @returns {boolean} */
export function isAiReferral() {
  return Boolean(readAttribution());
}

/** @returns {object|null} */
export function getAiReferral() {
  return readAttribution();
}

export function trackAiReferralLanding() {
  const attribution = readAttribution();
  if (!attribution) return;

  trackPulseEvent('ai_referral_landing', {
    source: attribution.source,
    medium: attribution.medium,
    campaign: attribution.campaign || undefined,
    path: attribution.path,
  });
}

/**
 * @param {string} action
 * @param {Record<string, any>} [extra]
 */
export function trackAiReferralConversion(action, extra = {}) {
  const attribution = readAttribution();
  if (!attribution) return;

  trackPulseEvent('ai_referral_conversion', {
    action,
    source: attribution.source,
    medium: attribution.medium,
    ...extra,
  });
}
