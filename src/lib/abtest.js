/**
 * A/B Testing — cookie-based, no external deps.
 * Variant assignment is stable per user (userId) or per browser (cookie).
 * Kids Mode always gets variant 'control' for safety.
 */

const COOKIE_PREFIX = 'bfl_ab_';
const COOKIE_TTL_DAYS = 30;

// ── Active test definitions ───────────────────────────────────────────────────
export const AB_TESTS = {
  hero_cta: {
    id: 'hero_cta',
    name: 'Homepage Hero CTA',
    description: 'Test primary CTA button copy on the homepage hero',
    variants: [
      { id: 'control', label: '🎮 Start Playing Games', weight: 34 },
      { id: 'ai_fun', label: '✨ Try AI Fun', weight: 33 },
      { id: 'streak', label: '🔥 Start Your Streak', weight: 33 },
    ],
    kidsModeSafe: true, // show control in kids mode
    active: true,
  },
  pro_messaging: {
    id: 'pro_messaging',
    name: 'Pro Upgrade Messaging',
    description: 'Test Pro CTA copy and placement',
    variants: [
      { id: 'control', label: '💎 Go Pro', weight: 34 },
      { id: 'unlock', label: '🔓 Unlock Everything', weight: 33 },
      { id: 'family', label: '👨‍👩‍👧 Upgrade for Family', weight: 33 },
    ],
    kidsModeSafe: false,
    active: true,
  },
  kids_toggle: {
    id: 'kids_toggle',
    name: 'Kids Mode Toggle Design',
    description: 'Test Kids Mode toggle visual style',
    variants: [
      { id: 'control', label: 'Standard toggle', weight: 50 },
      { id: 'colorful', label: 'Colorful pill toggle', weight: 50 },
    ],
    kidsModeSafe: true,
    active: true,
  },
  badge_style: {
    id: 'badge_style',
    name: 'Badge Visual Style',
    description: 'Test badge display — emoji vs illustrated',
    variants: [
      { id: 'control', label: 'Emoji badges', weight: 50 },
      { id: 'card', label: 'Card-style badges', weight: 50 },
    ],
    kidsModeSafe: true,
    active: true,
  },
};

// ── Cookie helpers ────────────────────────────────────────────────────────────
function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name, value, days = COOKIE_TTL_DAYS) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

// ── Deterministic hash for userId-based assignment ────────────────────────────
function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// ── Assign variant ────────────────────────────────────────────────────────────
export function getVariant(testId, { userId = null, kidsMode = false } = {}) {
  const test = AB_TESTS[testId];
  if (!test || !test.active) return 'control';

  // Kids mode always gets control unless test is kids-safe and has a kids variant
  if (kidsMode) return 'control';

  const cookieName = `${COOKIE_PREFIX}${testId}`;

  // Check existing assignment
  const existing = getCookie(cookieName);
  if (existing && test.variants.find((v) => v.id === existing)) return existing;

  // Assign new variant
  let roll;
  if (userId) {
    // Deterministic by userId — same user always gets same variant
    roll = hashCode(`${testId}:${userId}`) % 100;
  } else {
    roll = Math.floor(Math.random() * 100);
  }

  let cumulative = 0;
  let assigned = test.variants[0].id;
  for (const v of test.variants) {
    cumulative += v.weight;
    if (roll < cumulative) {
      assigned = v.id;
      break;
    }
  }

  setCookie(cookieName, assigned);
  return assigned;
}

// ── Force a specific variant (admin use) ─────────────────────────────────────
export function forceVariant(testId, variantId) {
  setCookie(`${COOKIE_PREFIX}${testId}`, variantId);
}

// ── Clear assignment (reset) ──────────────────────────────────────────────────
export function clearVariant(testId) {
  document.cookie = `${COOKIE_PREFIX}${testId}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

// ── Get all current assignments ───────────────────────────────────────────────
export function getAllVariants() {
  return Object.keys(AB_TESTS).reduce((acc, id) => {
    acc[id] = getCookie(`${COOKIE_PREFIX}${id}`) || null;
    return acc;
  }, {});
}
