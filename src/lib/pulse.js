/**
 * pulse.js — Pulse Growth Intelligence helpers
 * Zero-cookie tracker; no-ops until pulse.js has loaded on window.Pulse.
 *
 * @typedef {'signup' | 'trial_started' | 'pricing_viewed' | 'checkout_completed' | string} PulseEventName
 * @typedef {Record<string, any>} PulseProperties
 */

/**
 * Track a Pulse pageview (SPA client-side navigations).
 * The HTML snippet records the initial document load.
 */
export function trackPulsePageview() {
  if (typeof window !== 'undefined' && window.Pulse) {
    window.Pulse.track('pageview');
  }
}

/**
 * Track a high-value conversion or engagement action.
 * @param {PulseEventName} eventName
 * @param {PulseProperties} [properties]
 */
export const trackPulseEvent = (eventName, properties) => {
  if (typeof window !== 'undefined' && window.Pulse) {
    window.Pulse.track(eventName, properties);
  }
};
