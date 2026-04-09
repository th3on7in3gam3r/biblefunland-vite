/**
 * src/lib/api-config.js — Centralized API configuration
 *
 * In production, uses VITE_APP_URL as the base so API calls go to the
 * correct domain (e.g. https://biblefunland.com/api/...).
 * In dev, falls back to localhost:3001.
 */

const appUrl = import.meta.env.VITE_APP_URL || import.meta.env.VITE_SITE_URL || '';

export const API_URL =
  import.meta.env.VITE_API_BASE_URL?.startsWith('http')
    ? import.meta.env.VITE_API_BASE_URL
    : import.meta.env.DEV
      ? (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001')
      : appUrl;

export const HAS_BACKEND = import.meta.env.VITE_HAS_BACKEND === 'true';

export default API_URL;
