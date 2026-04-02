/**
 * src/lib/api-config.js — Centralized API configuration
 *
 * This ensures consistency across the frontend for backend requests.
 * Uses the VITE_API_URL env var if available, falls back to:
 *  - http://localhost:3001 in development (direct access)
 *  - /api in production (relative path)
 *
 * If VITE_API_URL is set to '/api' in .env (recommended), it will prioritize that.
 */

export const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3001' : '/api');

export const HAS_BACKEND = import.meta.env.VITE_HAS_BACKEND === 'true';

export default API_URL;
