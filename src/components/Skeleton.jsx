import styles from './Skeleton.module.css';

// ── Base skeleton pulse block ──
export function Skeleton({ width, height, radius, style = {} }) {
  return (
    <div
      className={styles.skeleton}
      style={{ width, height, borderRadius: radius || 8, ...style }}
    />
  );
}

// ── Text skeleton ──
export function SkeletonText({ lines = 3, lastWidth = '70%' }) {
  return (
    <div className={styles.textBlock}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} height={14} width={i === lines - 1 ? lastWidth : '100%'} radius={6} />
      ))}
    </div>
  );
}

// ── Card skeleton ──
export function SkeletonCard({ showThumb = true, lines = 3 }) {
  return (
    <div className={styles.card}>
      {showThumb && <Skeleton height={160} width="100%" radius={0} />}
      <div className={styles.cardBody}>
        <Skeleton height={11} width="30%" radius={100} style={{ marginBottom: 12 }} />
        <Skeleton height={20} width="85%" radius={6} style={{ marginBottom: 8 }} />
        <Skeleton height={20} width="65%" radius={6} style={{ marginBottom: 14 }} />
        <SkeletonText lines={lines} lastWidth="55%" />
      </div>
    </div>
  );
}

// ── Game card skeleton ──
export function SkeletonGameCard() {
  return (
    <div className={styles.gameCard}>
      <Skeleton width={52} height={52} radius={14} style={{ marginBottom: 14 }} />
      <Skeleton height={18} width="70%" radius={6} style={{ marginBottom: 8 }} />
      <SkeletonText lines={2} lastWidth="55%" />
      <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
        <Skeleton height={22} width={60} radius={100} />
        <Skeleton height={22} width={70} radius={100} />
      </div>
    </div>
  );
}

// ── Prayer card skeleton ──
export function SkeletonPrayerCard() {
  return (
    <div className={styles.prayerCard}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' }}>
        <Skeleton width={34} height={34} radius="50%" />
        <div style={{ flex: 1 }}>
          <Skeleton height={13} width="50%" radius={5} style={{ marginBottom: 5 }} />
          <Skeleton height={10} width="30%" radius={5} />
        </div>
        <Skeleton height={20} width={60} radius={100} />
      </div>
      <SkeletonText lines={3} lastWidth="75%" />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
        <Skeleton height={32} width={90} radius={9} />
        <Skeleton height={14} width={80} radius={6} />
      </div>
    </div>
  );
}

// ── Hero skeleton ──
export function SkeletonHero() {
  return (
    <div className={styles.hero}>
      <Skeleton height={28} width={180} radius={100} style={{ marginBottom: 20 }} />
      <Skeleton height={56} width="70%" radius={10} style={{ marginBottom: 12 }} />
      <Skeleton height={56} width="55%" radius={10} style={{ marginBottom: 24 }} />
      <Skeleton height={18} width="50%" radius={6} style={{ marginBottom: 8 }} />
      <Skeleton height={18} width="40%" radius={6} style={{ marginBottom: 32 }} />
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <Skeleton height={52} width={160} radius={14} />
        <Skeleton height={52} width={160} radius={14} />
      </div>
    </div>
  );
}

// ── Page skeleton (general) ──
export function SkeletonPage({ cards = 6, columns = 3 }) {
  return (
    <div>
      <SkeletonHero />
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '60px 36px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Skeleton height={14} width={80} radius={100} style={{ margin: '0 auto 12px' }} />
          <Skeleton height={36} width={300} radius={8} style={{ margin: '0 auto 10px' }} />
          <Skeleton height={16} width={220} radius={6} style={{ margin: '0 auto' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 18 }}>
          {Array.from({ length: cards }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Inline loading spinner ──
export function LoadingSpinner({ size = 32, color = 'var(--violet)' }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `3px solid var(--border)`,
        borderTopColor: color,
        animation: 'spin .7s linear infinite',
        display: 'inline-block',
      }}
    >
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Full page loader ──
export function PageLoader({ message = 'Loading...' }) {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      <LoadingSpinner size={44} />
      <p style={{ fontSize: '.9rem', color: 'var(--ink3)', fontWeight: 600 }}>{message}</p>
    </div>
  );
}

// ── Bible Loader — animated open Bible with glow ──────────────────────────────
export function BibleLoader({ message, kidsMode = false }) {
  const text = message || (kidsMode ? '📖 Loading your adventure...' : 'Preparing your Bible experience...');
  return (
    <div style={{
      minHeight: '60vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 20,
      fontFamily: 'Poppins, sans-serif', padding: '40px 20px',
    }}>
      {/* Animated Bible SVG */}
      <div style={{ position: 'relative', width: kidsMode ? 100 : 80, height: kidsMode ? 80 : 64 }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', inset: -16, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
          animation: 'bibleGlow 2.4s ease-in-out infinite',
        }} />
        {/* Bible icon */}
        <svg
          viewBox="0 0 80 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%', animation: 'bibleBounce 2.4s ease-in-out infinite' }}
        >
          {/* Left page */}
          <rect x="4" y="8" width="34" height="48" rx="3" fill="#EDE9FE" stroke="#8B5CF6" strokeWidth="1.5"/>
          {/* Right page */}
          <rect x="42" y="8" width="34" height="48" rx="3" fill="#F5F3FF" stroke="#8B5CF6" strokeWidth="1.5"/>
          {/* Spine */}
          <rect x="36" y="6" width="8" height="52" rx="2" fill="#8B5CF6"/>
          {/* Left lines */}
          <line x1="10" y1="20" x2="34" y2="20" stroke="#C4B5FD" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="10" y1="27" x2="34" y2="27" stroke="#C4B5FD" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="10" y1="34" x2="34" y2="34" stroke="#C4B5FD" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="10" y1="41" x2="28" y2="41" stroke="#C4B5FD" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Right lines */}
          <line x1="46" y1="20" x2="70" y2="20" stroke="#DDD6FE" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="46" y1="27" x2="70" y2="27" stroke="#DDD6FE" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="46" y1="34" x2="70" y2="34" stroke="#DDD6FE" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="46" y1="41" x2="62" y2="41" stroke="#DDD6FE" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Cross on right page */}
          <line x1="58" y1="48" x2="58" y2="56" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round"/>
          <line x1="54" y1="52" x2="62" y2="52" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round"/>
          {/* Sparkles */}
          <circle cx="6" cy="10" r="2" fill="#FCD34D" style={{ animation: 'sparkle1 2.4s ease-in-out infinite' }}/>
          <circle cx="74" cy="12" r="1.5" fill="#FCD34D" style={{ animation: 'sparkle2 2.4s ease-in-out infinite' }}/>
          <circle cx="72" cy="54" r="1.5" fill="#A78BFA" style={{ animation: 'sparkle3 2.4s ease-in-out infinite' }}/>
        </svg>
      </div>

      {/* Text */}
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontSize: kidsMode ? '1rem' : '.88rem',
          fontWeight: 700, color: 'var(--ink3)',
          marginBottom: 8,
        }}>
          {text}
        </p>
        {/* Dot loader */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: kidsMode ? 10 : 8, height: kidsMode ? 10 : 8,
              borderRadius: '50%', background: '#8B5CF6',
              animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes bibleGlow { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }
        @keyframes bibleBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes dotBounce { 0%,80%,100%{transform:translateY(0);opacity:0.4} 40%{transform:translateY(-6px);opacity:1} }
        @keyframes sparkle1 { 0%,100%{opacity:0;transform:scale(0.5)} 50%{opacity:1;transform:scale(1)} }
        @keyframes sparkle2 { 0%,100%{opacity:0;transform:scale(0.5)} 60%{opacity:1;transform:scale(1)} }
        @keyframes sparkle3 { 0%,100%{opacity:0;transform:scale(0.5)} 70%{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  );
}

// ── Quick Start card skeleton (Home page) ─────────────────────────────────────
export function SkeletonQuickCard() {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 20, padding: '28px 22px', border: '1.5px solid var(--border)' }}>
      <Skeleton width={52} height={52} radius={16} style={{ marginBottom: 14 }} />
      <Skeleton height={18} width="70%" radius={6} style={{ marginBottom: 8 }} />
      <SkeletonText lines={2} lastWidth="55%" />
      <Skeleton height={14} width={60} radius={6} style={{ marginTop: 14 }} />
    </div>
  );
}

// ── Leaderboard row skeleton ──────────────────────────────────────────────────
export function SkeletonLeaderRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 14, background: 'var(--surface)', border: '1.5px solid var(--border)', marginBottom: 8 }}>
      <Skeleton width={36} height={16} radius={6} />
      <Skeleton width={40} height={40} radius="50%" />
      <div style={{ flex: 1 }}>
        <Skeleton height={13} width="55%" radius={5} style={{ marginBottom: 5 }} />
        <Skeleton height={10} width="35%" radius={5} />
      </div>
      <Skeleton height={28} width={64} radius={99} />
    </div>
  );
}

// ── Map hotspot skeleton ──────────────────────────────────────────────────────
export function SkeletonMapPanel() {
  return (
    <div style={{ padding: 18 }}>
      <Skeleton height={12} width="40%" radius={99} style={{ marginBottom: 10 }} />
      <Skeleton height={22} width="75%" radius={6} style={{ marginBottom: 14 }} />
      <SkeletonText lines={3} lastWidth="60%" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ display: 'flex', gap: 10, padding: '9px 11px', borderRadius: 10, background: 'var(--bg2)', border: '1px solid var(--border)' }}>
            <Skeleton width={28} height={28} radius={6} />
            <div style={{ flex: 1 }}>
              <Skeleton height={12} width="60%" radius={5} style={{ marginBottom: 4 }} />
              <Skeleton height={10} width="40%" radius={5} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Voice reader skeleton ─────────────────────────────────────────────────────
export function SkeletonVoiceReader() {
  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '32px 20px' }}>
      {/* Controls bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {[120, 100, 80, 80].map((w, i) => <Skeleton key={i} height={40} width={w} radius={10} />)}
      </div>
      {/* Scripture text area */}
      <div style={{ background: 'var(--surface)', borderRadius: 20, padding: '24px', border: '1.5px solid var(--border)', marginBottom: 20 }}>
        <Skeleton height={14} width="30%" radius={99} style={{ marginBottom: 16 }} />
        <SkeletonText lines={6} lastWidth="45%" />
      </div>
      {/* Player controls */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center' }}>
        {[48, 64, 48].map((s, i) => <Skeleton key={i} width={s} height={s} radius="50%" />)}
      </div>
    </div>
  );
}

// ── Grow/certification skeleton ───────────────────────────────────────────────
export function SkeletonGrowCard() {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 22, padding: '28px 22px', border: '1.5px solid var(--border)' }}>
      <Skeleton height={12} width={80} radius={99} style={{ marginBottom: 14 }} />
      <Skeleton width={56} height={56} radius={18} style={{ marginBottom: 14 }} />
      <Skeleton height={18} width="65%" radius={6} style={{ marginBottom: 8 }} />
      <SkeletonText lines={2} lastWidth="50%" />
      <Skeleton height={36} width="100%" radius={12} style={{ marginTop: 16 }} />
    </div>
  );
}
