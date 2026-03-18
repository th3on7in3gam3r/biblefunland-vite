// PrivateRoute.jsx — Requires Supabase login
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
        <div className="spinner" />
      </div>
    )
  }

  return user ? <Outlet /> : <Navigate to="/auth?redirect=dashboard" replace />
}
