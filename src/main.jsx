import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { validateEnv } from './lib/validateEnv';
import { initializeDevTools } from './lib/devTools';
import { initAnalytics, trackPage } from './lib/analytics';
import App from './App.jsx';
import './index.css';

validateEnv();
initializeDevTools();
initAnalytics();

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) throw new Error('Missing Clerk Publishable Key');

// Auto-track page views on route change
function RouteTracker() {
  const location = useLocation();
  React.useEffect(() => {
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

// Register Service Worker after DOM is ready
// registerServiceWorker()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <RouteTracker />
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>
);
