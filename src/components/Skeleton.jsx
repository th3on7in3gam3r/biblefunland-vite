import styles from './Skeleton.module.css'

// ── Base skeleton pulse block ──
export function Skeleton({ width, height, radius, style = {} }) {
  return (
    <div
      className={styles.skeleton}
      style={{ width, height, borderRadius: radius || 8, ...style }}
    />
  )
}

// ── Text skeleton ──
export function SkeletonText({ lines = 3, lastWidth = '70%' }) {
  return (
    <div className={styles.textBlock}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          height={14}
          width={i === lines - 1 ? lastWidth : '100%'}
          radius={6}
        />
      ))}
    </div>
  )
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
  )
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
  )
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
  )
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
  )
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
  )
}

// ── Inline loading spinner ──
export function LoadingSpinner({ size = 32, color = 'var(--violet)' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `3px solid var(--border)`,
      borderTopColor: color,
      animation: 'spin .7s linear infinite',
      display: 'inline-block',
    }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ── Full page loader ──
export function PageLoader({ message = 'Loading...' }) {
  return (
    <div style={{
      minHeight: '60vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
      fontFamily: 'Poppins, sans-serif',
    }}>
      <LoadingSpinner size={44} />
      <p style={{ fontSize: '.9rem', color: 'var(--ink3)', fontWeight: 600 }}>{message}</p>
    </div>
  )
}
