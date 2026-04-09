/**
 * FamilyGate — wraps content that requires a Family plan subscription.
 * Shows an upgrade wall for Pro and Free users.
 */
import { useAds } from '../context/AdsContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function FamilyGate({ children }) {
  const { isFamilyUser, proChecked } = useAds();
  const { user } = useAuth();

  if (!proChecked) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '3px solid var(--border)', borderTopColor: '#F97316',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
        }} />
        <p style={{ color: 'var(--ink3)', fontSize: '.9rem' }}>Checking your subscription…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (isFamilyUser) return <>{children}</>;

  return (
    <div style={{
      minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', background: 'var(--bg)',
    }}>
      <div style={{
        maxWidth: 520, width: '100%', textAlign: 'center',
        background: 'linear-gradient(135deg,#1A0F00,#2D1A00,#0F172A)',
        borderRadius: 28, overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(249,115,22,.2)',
        border: '1.5px solid rgba(249,115,22,.25)',
      }}>
        <div style={{ height: 4, background: 'linear-gradient(90deg,#F97316,#FB923C,#F97316)' }} />
        <div style={{ padding: '40px 36px 36px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>👨‍👩‍👧‍👦</div>
          <h2 style={{
            fontFamily: "'Baloo 2',cursive", fontWeight: 800,
            fontSize: 'clamp(1.4rem,4vw,1.9rem)', color: 'white', marginBottom: 10,
          }}>
            Family Plan Feature
          </h2>
          <p style={{ color: 'rgba(255,255,255,.55)', fontSize: '.9rem', lineHeight: 1.7, marginBottom: 28 }}>
            {user
              ? 'This feature is exclusive to the Family plan. Upgrade to unlock family sharing, shared prayer journal, progress dashboard, and more.'
              : 'Sign in and upgrade to the Family plan to access this feature.'}
          </p>

          <div style={{
            background: 'rgba(255,255,255,.06)', border: '1px solid rgba(249,115,22,.2)',
            borderRadius: 16, padding: '18px 22px', marginBottom: 28, textAlign: 'left',
          }}>
            <div style={{ fontSize: '.7rem', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: '#FB923C', marginBottom: 12 }}>
              Family Plan includes
            </div>
            {[
              '👨‍👩‍👧 5 family member accounts',
              '📊 Family progress dashboard',
              '🙏 Shared prayer journal',
              '🔒 Kids mode with parental controls',
              '🖨️ Printable activity packs',
              '⚡ Priority support',
              '🚀 Early access to new features',
            ].map((perk, i, arr) => (
              <div key={i} style={{
                fontSize: '.84rem', color: 'rgba(255,255,255,.75)', fontWeight: 500, padding: '5px 0',
                borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,.06)' : 'none',
              }}>
                {perk}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/premium" style={{
              padding: '13px 28px', borderRadius: 14,
              background: 'linear-gradient(135deg,#F97316,#FB923C)',
              color: 'white', fontWeight: 800, fontSize: '.95rem',
              textDecoration: 'none', boxShadow: '0 8px 24px rgba(249,115,22,.4)',
            }}>
              👨‍👩‍👧‍👦 Upgrade to Family — $9.99/mo
            </Link>
            {!user && (
              <Link to="/auth" style={{
                padding: '13px 22px', borderRadius: 14,
                background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.75)',
                fontWeight: 700, fontSize: '.9rem', textDecoration: 'none',
                border: '1.5px solid rgba(255,255,255,.15)',
              }}>
                🔐 Sign In First
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
