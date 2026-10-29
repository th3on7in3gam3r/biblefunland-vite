import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const COLUMNS = [
  {
    title: 'Play & learn',
    links: [
      { to: '/play', label: 'Games' },
      { to: '/play/trivia', label: 'Bible Trivia' },
      { to: '/devotional', label: 'Devotionals' },
      { to: '/explore/bible', label: 'Explore the Bible' },
      { to: '/podcast', label: 'Podcast' },
      { to: 'https://junior.biblefunland.com', label: 'BibleFunLand Jr.', isExternal: true },
    ],
  },
  {
    title: 'Families',
    links: [
      { to: '/parents', label: 'Parents & Teachers' },
      { to: '/prayer', label: 'Prayer Wall' },
      { to: '/community/family', label: 'Family Groups' },
      { to: '/leaderboard', label: 'Leaderboard' },
      { to: '/church-finder', label: 'Church Finder' },
      { to: 'https://homeschool.biblefunland.com', label: 'HomeSchool Hub', isExternal: true },
    ],
  },
  {
    title: 'BibleFunLand',
    links: [
      { to: '/premium', label: 'Go Pro' },
      { to: '/affiliate', label: 'Partner With Us' },
      { to: '/partner', label: 'Ministry Partnership' },
      { to: '/creators', label: 'Creator Program' },
      { to: '/contact', label: 'Contact Us' },
      { to: 'https://biblefunlandstudios.com', label: 'BibleFunLand Studios', isExternal: true },
    ],
  },
];

function FooterLink({ to, label, isExternal }) {
  if (isExternal) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
  }
  return <Link to={to}>{label}</Link>;
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <svg
        className={styles.wave}
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 40c120-30 240-30 360 0s240 30 360 0 240-30 360 0 240 30 360 0v20H0z" />
      </svg>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Link to="/" className={styles.logo}>
              Bible<span>Fun</span>Land
            </Link>
            <p className={styles.tagline}>100% free Bible fun for Christian families worldwide.</p>
            <Link to="/play" className={styles.cta}>
              Play free
            </Link>
            <div className={styles.social}>
              <a href="mailto:hello@biblefunland.com" title="Email us" aria-label="Email us">
                ✉️
              </a>
              <a
                href="https://twitter.com/biblefunland"
                target="_blank"
                rel="noreferrer"
                title="X / Twitter"
                aria-label="X / Twitter"
              >
                𝕏
              </a>
              <a
                href="https://facebook.com/biblefunland"
                target="_blank"
                rel="noreferrer"
                title="Facebook"
                aria-label="Facebook"
              >
                f
              </a>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} className={styles.col} aria-label={col.title}>
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((l) => (
                  <li key={l.to}>
                    <FooterLink {...l} />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className={styles.bottom}>
          <p>© {year} BibleFunLand · Built for the Kingdom 🙏</p>
          <div className={styles.legal}>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/contact">Support</Link>
          </div>
        </div>

        <p className={styles.safety}>
          🛡️ Moderated community for families. All content rooted in Scripture. · 🔒 We do not sell
          your data. · GDPR: EU users may request data deletion at{' '}
          <a href="mailto:privacy@biblefunland.com">privacy@biblefunland.com</a> · COPPA compliant —
          children under 13 require parental consent.
        </p>
      </div>
    </footer>
  );
}
