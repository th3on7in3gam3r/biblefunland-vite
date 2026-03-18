import { createContext, useContext, useEffect } from 'react'
import { useUser, useClerk, formatUser } from '../lib/clerk'
import * as db from '../lib/db'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { user: clerkUser, isLoaded } = useUser()
  const { signOut: clerkSignOut } = useClerk()
  
  const user = isLoaded ? formatUser(clerkUser) : null
  const loading = !isLoaded

  // Auto-sync profile to record user in Turso
  useEffect(() => {
    if (user?.id) {
      ensureProfile()
    }
  }, [user?.id])

  async function ensureProfile() {
    try {
      const { data } = await db.getProfile(user.id)
      if (!data) {
        // First time? Create it from Clerk data
        await db.upsertProfile(user.id, {
          display_name: user.user_metadata.full_name || user.email.split('@')[0],
          avatar_url: 'david', // Default avatar
          bio: ''
        })
      }
    } catch (e) { console.error('Error syncing profile:', e) }
  }

  const signOut = async () => {
    await clerkSignOut()
  }

  // Note: SignIn and SignUp are handled by Clerk's components 
  // or redirected to Clerk's managed pages, so we don't need manual logic here
  // but we keep the placeholders to prevent crashes if used.
  const signIn = () => { console.warn('Use Clerk SignIn component') }
  const signUp = () => { console.warn('Use Clerk SignUp component') }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
