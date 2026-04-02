import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ChildDashboard() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) {
      navigate('/auth');
      return;
    }

    const id = setTimeout(() => setLoading(false), 150);
    return () => clearTimeout(id);
  }, [user, navigate]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span>Loading child dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#dc2626',
        }}
      >
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '70vh', padding: '24px' }}>
      <h1>Child Dashboard</h1>
      <p>Child ID: {childId}</p>
      <p>This simplified version is live for build and test stability.</p>
    </div>
  );
}
