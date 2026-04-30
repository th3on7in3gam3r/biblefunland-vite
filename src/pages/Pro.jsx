import { Link, useNavigate } from 'react-router-dom';
import { useAds } from '../context/AdsContext';
import { useAuth } from '../context/AuthContext';
import usePageMetadata from '../hooks/usePageMetadata';
import { Analytics } from '../lib/analytics';

const PRO_FEATURES = [
  'Ad-free learning experience',
  'Unlimited AI devotionals and Bible chat',
  'Full certification roadmap + printable certificates',
  'Priority AI response and fast loading',
  'Family progress dashboard and sharing',
  'Extra high-quality cards, activities and challenges',
  'Offline downloads and PDF workbooks',
  'Daily streak rewards and exclusive badges',
];

export default function Pro() {
  const { isProUser } = useAds();
  const { user } = useAuth();
  const navigate = useNavigate();

  usePageMetadata({
    title: 'BibleFunLand Pro',
    description:
      'Go Pro for ad-free experience, priority AI, family progress and premium resources.',
  });

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '22px 14px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 'clamp(1.5rem, 2.25vw, 2.4rem)' }}>
          Go Pro for $3.99/month
        </h1>
        {isProUser && (
          <span style={{ color: '#065f46', fontWeight: 700 }}>✅ You’re already Pro</span>
        )}
      </div>
      <p style={{ fontSize: '1rem', color: '#374151', marginBottom: 18 }}>
        BibleFunLand Pro gives you a premium, kid-safe experience with no ads, unlimited AI, family
        progress, and expert tools.
      </p>

      <div
        style={{
          background: 'linear-gradient(180deg, #fdf6ec, #fce4a9)',
          border: '1px solid #f59e0b',
          borderRadius: 14,
          padding: '16px 18px',
          marginBottom: 20,
        }}
      >
        <p style={{ margin: 0, fontSize: '.95rem', color: '#92400e' }}>
          All plans include our Pro AI Priority Pipeline, premium games, and full access to
          family/parent monitoring features.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
          gap: 12,
          marginBottom: 22,
        }}
      >
        {PRO_FEATURES.map((feature) => (
          <div
            key={feature}
            style={{
              border: '1px solid #d1d5db',
              borderRadius: 12,
              background: 'white',
              padding: 12,
              fontSize: '.95rem',
              color: '#1f2937',
            }}
          >
            ✓ {feature}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
        <button
          onClick={() => {
            Analytics.trackEvent('pro_page_click', { location: 'Pro CTA' });
            if (!user) {
              navigate('/auth?redirect=pro');
            } else {
              navigate('/premium');
            }
          }}
          style={{
            padding: '12px 20px',
            background: '#c2410c',
            border: 'none',
            borderRadius: 10,
            color: 'white',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {isProUser ? 'Manage Subscription' : 'Get Pro Now'}
        </button>

        <Link
          to="/premium"
          style={{ color: '#1f2937', fontWeight: 600, textDecoration: 'underline' }}
        >
          View detailed plan options
        </Link>
      </div>

      <div style={{ marginTop: 32, borderTop: '1px solid #e5e7eb', paddingTop: 18 }}>
        <h2 style={{ margin: '0 0 10px 0' }}>For Parents</h2>
        <p style={{ margin: 0, color: '#4b5563' }}>
          Upgrade to Pro and unlock <strong>Parent Progress Reporting</strong> at{' '}
          <code>/parents/progress</code>.
        </p>
      </div>
    </div>
  );
}
