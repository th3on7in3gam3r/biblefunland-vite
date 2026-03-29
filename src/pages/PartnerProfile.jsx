import { useParams, Link } from 'react-router-dom'
import { getPartnerBySlug } from '../data/partners'
import styles from './PartnerProfile.module.css'

export default function PartnerProfile() {
  const { slug } = useParams()
  const partner = getPartnerBySlug(slug)

  if (!partner) {
    return (
      <div className={styles.page}>
        <div className={styles.notFound}>
          <div className={styles.notFoundIcon}>⛪</div>
          <h1 className={styles.notFoundTitle}>Church Page Not Found</h1>
          <p className={styles.notFoundSub}>
            This ministry partner page doesn't exist yet. If you're a church looking to partner with BibleFunLand,
            we'd love to set up your own page!
          </p>
          <Link to="/partner" className={styles.backBtn}>⛪ Apply for a Church Page</Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.partnerBadge}>
            ✝️ BibleFunLand Ministry Partner · Since {partner.since}
          </div>
          <span className={styles.partnerEmoji}>{partner.emoji}</span>
          <h1 className={styles.partnerName}>{partner.name}</h1>
          {partner.tagline && (
            <p className={styles.partnerTagline}>"{partner.tagline}"</p>
          )}
          <div className={styles.welcomeMsg}>
            {partner.welcomeMessage}
          </div>
          <div className={styles.heroMeta}>
            <span>📍 {partner.location}</span>
            <span className={styles.metaDot}>·</span>
            <span>👥 {partner.size} members</span>
            <span className={styles.metaDot}>·</span>
            <a href={partner.website} target="_blank" rel="noopener noreferrer" style={{ color: '#34d399' }}>
              🌐 Visit Website
            </a>
          </div>
        </div>
      </section>

      {/* ── Featured Content ── */}
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>
          ⭐ Featured for {partner.name.split(' ')[0]} Members
        </h2>
        <div className={styles.featuredGrid}>
          {partner.featuredLinks.map(link => (
            <Link key={link.to} to={link.to} className={styles.featuredCard}>
              <span className={styles.featuredIcon}>{link.label.split(' ')[0]}</span>
              <div className={styles.featuredLabel}>{link.label.split(' ').slice(1).join(' ')}</div>
              <p className={styles.featuredDesc}>{link.desc}</p>
            </Link>
          ))}
        </div>

        {/* ── Church Info ── */}
        <h2 className={styles.sectionTitle}>🏛️ About This Ministry</h2>
        <div className={styles.infoCard}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Ministry</span>
            <span className={styles.infoValue}>{partner.name}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Location</span>
            <span className={styles.infoValue}>{partner.location}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Congregation</span>
            <span className={styles.infoValue}>{partner.size} members</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Partnership</span>
            <span className={styles.infoValue}>{partner.tier}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Website</span>
            <a
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.infoLink}
            >
              {partner.website.replace('https://', '')}
            </a>
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={{ textAlign: 'center', marginTop: 56 }}>
          <p style={{ color: 'var(--ink3)', marginBottom: 16, fontSize: '0.92rem' }}>
            Is your church ready to partner with BibleFunLand?
          </p>
          <Link to="/partner" className={styles.backBtn}>
            ⛪ Apply for Your Church Page
          </Link>
        </div>
      </div>

    </div>
  )
}
