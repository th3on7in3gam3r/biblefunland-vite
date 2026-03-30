import { Navigate } from 'react-router-dom';
import { useParentalControls } from '../context/ParentalControlsContext';
import { useAuth } from '../context/AuthContext';

export default function ParentalProtectedRoute({ children, featureId }) {
  const { isFeatureEnabled } = useParentalControls();
  const { profile } = useAuth();

  // If the user's role is Leader, Parent, or Teacher, they can always access it
  const userRole = profile?.role?.toLowerCase() || '';
  const isLeader = ['parent', 'teacher', 'pastor', 'leader', 'admin'].includes(userRole);

  if (isLeader) {
    return children;
  }

  // Check if feature is enabled in parental controls
  if (!isFeatureEnabled(featureId)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
