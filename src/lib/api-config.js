/**
 * src/lib/api-config.js — Centralized API configuration
 *
 * On Vercel, frontend and API routes share the same origin, so relative
 * paths (/api/...) work correctly without needing a full domain.
 * In local dev, proxy to the Express server on port 3001.
 */

export const API_URL = import.meta.env.DEV
  ? (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001')
  : '';

export const HAS_BACKEND = import.meta.env.VITE_HAS_BACKEND === 'true';

export default API_URL;
