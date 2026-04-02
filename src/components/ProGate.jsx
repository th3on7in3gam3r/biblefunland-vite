import { useAds } from '../context/AdsContext';
import { Link } from 'react-router-dom';

export default function ProGate({ children, feature = 'Pro' }) {
  const { isProUser, proChecked } = useAds();

  if (!proChecked) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <div className="spinner" />
        <p style={{ margin: '10px 0 0', color: '#6b7280' }}>Checking subscription status...</p>
      </div>
    );
  }

  if (!isProUser) {
    return (
      <div
        style={{
          background: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: 12,
          padding: 18,
          color: '#b45309',
          marginBottom: 16,
        }}
      >
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Upgrade to BibleFunLand Pro</h3>
        <p style={{ margin: '6px 0 0' }}>
          {feature} content is optimized for Pro subscribers (ad-free + priority AI + full
          certification access).
        </p>
        <Link
          to="/premium"
          style={{
            display: 'inline-block',
            marginTop: 12,
            padding: '8px 16px',
            borderRadius: 8,
            background: '#f59e0b',
            color: 'white',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Get Pro
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
