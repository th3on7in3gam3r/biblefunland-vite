// AdminRoute.jsx — Requires PIN + Supabase login
// The admin section is completely hidden from the public nav.
// Access: click the logo 5x → /admin/login → enter PIN
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminRoute() {
  const { user, loading } = useAuth()

  // Check if PIN was verified this session
  const adminVerified = sessionStorage.getItem('bfl_admin_verified') === 'true'

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
        <div className="spinner" />
      </div>
    )
  }

  // Must be logged in AND have verified PIN
  if (!user) return <Navigate to="/auth?redirect=admin" replace />
  if (!adminVerified) return <Navigate to="/admin/login" replace />

  return <Outlet />
}
