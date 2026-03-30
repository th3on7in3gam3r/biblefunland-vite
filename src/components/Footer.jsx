import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const EXPLORE_LINKS = [
  { to: '/trivia', label: '🎮 Scripture Trivia' },
  { to: '/devotional', label: '🙏 AI Devotional' },
  { to: '/bible', label: '📖 Bible Explorer' },
  { to: '/map', label: '🗺️ Bible Map' },
  { to: '/game/runner', label: '🏃 Scripture Runner' },
  { to: '/resources', label: '📚 Kingdom Resources' },
];

const COMMUNITY_LINKS = [
  { to: '/prayer', label: '🌍 Prayer Wall' },
  { to: '/parent-hub', label: '🏫 Parents & Teachers' },
  { to: '/leaderboard', label: '🏆 Leaderboard' },
  { to: '/podcast', label: '🎙️ Podcast' },
  { to: '/church-finder', label: '⛪ Church Finder' },
  { to: '/contact', label: '📬 Contact Us' },
];

const PARTNER_LINKS = [
  { to: '/affiliate', label: '🏛️ Partner With Us' },
  { to: '/partner', label: '⛪ Ministry Partnership' },
  { to: '/creators', label: '🎙️ Creator Program' },
  { to: '/premium', label: '👑 Go Pro' },
  { to: '/privacy', label: '🔒 Privacy Policy' },
  { to: '/terms', label: '📄 Terms of Service' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          {/* Column 1: Brand */}
          <div className={styles.brand}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>✝️</div>
              <span className={styles.logoText}>
                Bible<span>Fun</span>Land
              </span>
            </div>
            <p className={styles.desc}>
              An epic journey through God's Word — built with love for families. 100% free, always
              growing, dedicated to the Kingdom.
            </p>
            <Link to="/affiliate" className={styles.supportBtn}>
              🤝 Partner With Us
            </Link>
            <div className={styles.social}>
              <a
                href="mailto:hello@biblefunland.com"
                className={styles.socialLink}
                title="Email us"
              >
                ✉️
              </a>
              <a
                href="https://twitter.com/biblefunland"
                target="_blank"
                rel="noreferrer"
                className={styles.socialLink}
                title="Twitter / X"
              >
                𝕏
              </a>
              <a
                href="https://facebook.com/biblefunland"
                target="_blank"
                rel="noreferrer"
                className={styles.socialLink}
                title="Facebook"
              >
                📘
              </a>
            </div>
          </div>

          {/* Column 2: Explore */}
          <div className={styles.col}>
            <h4>Explore</h4>
            <ul>
              {EXPLORE_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Community */}
          <div className={styles.col}>
            <h4>Community</h4>
            <ul>
              {COMMUNITY_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Partners & Legal */}
          <div className={styles.col}>
            <h4>Partnership</h4>
            <ul>
              {PARTNER_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={styles.bottom}>
          <p className={styles.copy}>© {currentYear} BibleFunLand · Built for the Kingdom 🙏</p>
          <div className={styles.chips}>
            <span className={styles.chip}>Faith</span>
            <span className={styles.chip}>Fun</span>
            <span className={styles.chip}>Family</span>
          </div>
          <div className={styles.legal}>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/contact">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
