/**
 * errorMonitoring.js — Lightweight error monitoring for BibleFunLand
 *
 * Console-based by default. To add Sentry:
 *   1. npm install @sentry/react
 *   2. Add VITE_SENTRY_DSN to .env
 *   3. Uncomment the Sentry block below
 */

const ENV = import.meta.env.MODE || 'development';

export function initErrorMonitoring() {
  if (ENV === 'development') {
    console.info('[ErrorMonitoring] Console monitoring active (dev mode)');
  }
  // To enable Sentry, install @sentry/react and uncomment:
  // import * as Sentry from '@sentry/react'
  // Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN, environment: ENV })
}

export function captureError(error, context = {}) {
  if (ENV === 'development') {
    console.error('[ErrorMonitoring]', error, context);
  }
  // Sentry: Sentry.captureException(error)
}

export function captureMessage(msg, level = 'info') {
  if (ENV === 'development') {
    console[level]?.('[ErrorMonitoring]', msg);
  }
  // Sentry: Sentry.captureMessage(msg, level)
}

export function setupGlobalHandlers() {
  window.addEventListener('unhandledrejection', (e) => {
    captureError(e.reason, { type: 'unhandledrejection' });
  });
  window.addEventListener('error', (e) => {
    captureError(e.error || new Error(e.message), { type: 'globalerror' });
  });
}
