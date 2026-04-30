import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { ui } from '@clerk/ui';
import { HelmetProvider } from 'react-helmet-async';
import { validateEnv } from './lib/validateEnv';
import { initializeDevTools } from './lib/devTools';
import { initAnalytics, trackPage } from './lib/analytics';
import { initErrorMonitoring, setupGlobalHandlers } from './lib/errorMonitoring';
import App from './App.jsx';
import './index.css';

validateEnv();
initializeDevTools();
initAnalytics();
initErrorMonitoring();
setupGlobalHandlers();

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) throw new Error('Missing Clerk Publishable Key');

// Auto-track page views on route change + scroll to top
// Scroll position memory — save before leaving, restore on back
const scrollPositions = new Map();

// Routes where we DON'T want to scroll to top (content renders below existing hub)
const NO_SCROLL_TOP = ['/play/', '/explore/'];

function RouteTracker() {
  const location = useLocation();

  React.useEffect(() => {
    // Save scroll position of the page we're leaving
    return () => {
      scrollPositions.set(location.pathname, window.scrollY);
    };
  }, [location.pathname]);

  React.useEffect(() => {
    const skipScroll = NO_SCROLL_TOP.some(
      (prefix) => location.pathname.startsWith(prefix) && location.pathname !== prefix.slice(0, -1)
    );
    if (skipScroll) return;

    // If navigating back (popstate), restore saved position
    const saved = scrollPositions.get(location.pathname);
    if (saved !== undefined && window.history.state?.idx !== undefined) {
      // Small delay to let the page render before restoring
      requestAnimationFrame(() => window.scrollTo(0, saved));
    } else {
      window.scrollTo(0, 0);
    }

    trackPage(location.pathname);
  }, [location.pathname]);

  return null;
}

// Register Service Worker for offline functionality
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    // Wait for DOM to be ready before registering
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        registerSW();
      });
    } else {
      registerSW();
    }
  } else {
    console.warn('⚠️ Service Workers not supported in this browser');
  }
}

function registerSW() {
  navigator.serviceWorker
    .register('/sw-enhanced.js', { scope: '/' })
    .then((registration) => {
      console.log('✅ Service Worker registered successfully:', registration);

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60000); // Check every minute

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New Service Worker available, prompt user to refresh
            console.log(
              '🔄 New Service Worker available. Refresh to get the latest offline content.'
            );
            // You can show a toast/banner here to prompt user
          }
        });
      });
    })
    .catch((error) => {
      console.error('❌ Service Worker registration failed:', error);
    });
}

// Register Service Worker for offline functionality + push notifications
if (import.meta.env.PROD) {
  registerServiceWorker();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} ui={ui}>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <RouteTracker />
          <App />
        </BrowserRouter>
      </ClerkProvider>
    </HelmetProvider>
  </React.StrictMode>
);
