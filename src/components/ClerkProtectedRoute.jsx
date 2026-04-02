import { useUser } from '@clerk/clerk-react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ClerkProtectedRoute({ redirectTo = '/auth' }) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
        <div className="spinner" />
      </div>
    );
  }

  return isSignedIn ? <Outlet /> : <Navigate to={redirectTo} replace />;
}
