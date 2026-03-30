/**
 * clerk.js — Auth helpers for BibleFunLand
 *
 * Clerk handles everything: email/password, sessions, JWTs.
 * This file exports helpers that mirror the supabase auth calls
 * so your AuthContext needs minimal changes.
 *
 * Install:
 *   npm install @clerk/clerk-react
 *
 * .env:
 *   VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxx
 *   (get from clerk.com → your app → API Keys)
 */

// Re-export what you'll use from Clerk throughout the app
export {
  useUser,
  useAuth,
  useClerk,
  SignIn,
  SignUp,
  UserButton,
  SignedIn,
  SignedOut,
} from '@clerk/clerk-react';

/**
 * formatUser(clerkUser)
 *
 * Normalizes a Clerk user object into the same shape
 * your pages expect from Supabase's getUser() — so existing
 * profile pages, dashboard, etc. need zero changes.
 *
 * Supabase shape:  { id, email, user_metadata: { full_name, avatar_url } }
 * Clerk shape:     { id, primaryEmailAddress, firstName, lastName, imageUrl }
 */
export function formatUser(clerkUser) {
  if (!clerkUser) return null;
  return {
    id: clerkUser.id,
    email: clerkUser.primaryEmailAddress?.emailAddress ?? '',
    user_metadata: {
      full_name: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim(),
      avatar_url: clerkUser.imageUrl ?? '',
    },
  };
}

/**
 * Usage in AuthContext.jsx — replace the Supabase listener with this:
 *
 * import { useUser } from '@clerk/clerk-react'
 * import { formatUser } from '../lib/clerk'
 *
 * export function AuthProvider({ children }) {
 *   const { user: clerkUser, isLoaded } = useUser()
 *   const user = isLoaded ? formatUser(clerkUser) : null
 *   // ... rest of context
 * }
 */
