import { createContext, useContext, useEffect, useState } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'
import { formatUser } from '../lib/clerk'
import * as db from '../lib/db'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { user: clerkUser, isLoaded } = useUser()
  const { signOut: clerkSignOut } = useClerk()
  const [profile, setProfile] = useState(null)

  const user = isLoaded ? formatUser(clerkUser) : null
  const loading = !isLoaded

  useEffect(() => {
    if (user?.id) {
      db.getProfile(user.id).then(({ data }) => setProfile(data)).catch(() => {})
    } else {
      setProfile(null)
    }
  }, [user?.id])

  const refreshProfile = async () => {
    if (user?.id) {
      const { data } = await db.getProfile(user.id)
      setProfile(data)
      return data
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
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
