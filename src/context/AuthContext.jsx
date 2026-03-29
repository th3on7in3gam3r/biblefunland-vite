import { createContext, useContext, useEffect, useState } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'
import { formatUser } from '../lib/clerk'
import * as db from '../lib/db'
import { requestQueue } from '../lib/requestQueue'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { user: clerkUser, isLoaded } = useUser()
  const { signOut: clerkSignOut } = useClerk()
  const [profile, setProfile] = useState(null)

  const user = isLoaded ? formatUser(clerkUser) : null
  const loading = !isLoaded

  useEffect(() => {
    if (user?.id) {
      requestQueue.execute(
        `profile:${user.id}`,
        () => db.getProfile(user.id),
        { priority: 0, cacheable: true, ttl: 20 * 60 * 1000 }
      ).then(({ data }) => setProfile(data)).catch(() => {})
    } else {
      setProfile(null)
    }
  }, [user?.id])

  const refreshProfile = async () => {
    if (user?.id) {
      const result = await requestQueue.execute(
        `profile-refresh:${user.id}`,
        () => db.getProfile(user.id),
        { priority: 1, cacheable: false }
      )
      setProfile(result?.data)
      return result?.data
    }
  }

  const signOut = () => clerkSignOut()

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    // During HMR, context might temporarily be unavailable
    if (import.meta.hot) {
      console.warn('useAuth called before AuthProvider is ready (HMR)')
      return { user: null, profile: null, loading: true }
    }
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}
