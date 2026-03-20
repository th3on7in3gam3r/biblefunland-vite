import { Navigate } from 'react-router-dom'
import { useParentalControls } from '../context/ParentalControlsContext'
import { useAuth } from '../context/AuthContext'

export default function ParentalProtectedRoute({ children, featureId }) {
  const { isFeatureEnabled } = useParentalControls()
  const { profile } = useAuth()

  // If the user's role is Parent or Teacher, they can always access it
  if (profile?.role === 'Parent' || profile?.role === 'Teacher') {
    return children
  }

  // Check if feature is enabled in parental controls
  if (!isFeatureEnabled(featureId)) {
    return <Navigate to="/" replace />
  }

  return children
}
