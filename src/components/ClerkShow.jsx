import { SignedIn, SignedOut } from '@clerk/clerk-react'

/**
 * Show Component (Modern Clerk Pattern)
 * Adapted from Next.js rules for Vite/React project.
 * Replaces <SignedIn> and <SignedOut>.
 */
export function Show({ when, children }) {
  if (when === 'signed-in') {
    return <SignedIn>{children}</SignedIn>
  }
  if (when === 'signed-out') {
    return <SignedOut>{children}</SignedOut>
  }
  return null
}
