/**
 * Environment Variables Validator
 * Checks that all required environment variables are defined before the app runs.
 * Add this import to main.jsx
 */

const REQUIRED_VARS = {
  VITE_CLERK_PUBLISHABLE_KEY: 'Clerk authentication key',
  VITE_STRIPE_PUBLISHABLE_KEY: 'Stripe publishable key for payments',
  VITE_ADMIN_PIN: 'Admin PIN for protected routes',
};

export function validateEnv() {
  const missing = [];

  for (const [key, description] of Object.entries(REQUIRED_VARS)) {
    const value = import.meta.env[key];
    if (!value || value.trim() === '') {
      missing.push(`${key} - ${description}`);
    }
  }

  if (missing.length > 0) {
    const errorMessage = [
      '❌ Missing required environment variables:',
      ...missing.map((m) => `  • ${m}`),
      '',
      'Please copy .env.example to .env and fill in all values.',
      'Then restart the development server.',
    ].join('\n');

    console.error(errorMessage);

    // In development, show alert; in production, throw error
    if (import.meta.env.DEV) {
      alert(errorMessage);
    } else {
      throw new Error('Missing critical environment variables. See console for details.');
    }
  }

  console.log('✅ All required environment variables are set');
}
