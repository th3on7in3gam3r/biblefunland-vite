import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>

          {/* Brand */}
          <div className={styles.brand}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>✝️</div>
              <span className={styles.logoText}>Bible<span>Fun</span>Land</span>
            </div>
            <p className={styles.desc}>
              An epic journey through God's Word — built with love for families,
              children, and believers everywhere. 100% free, always growing.
            </p>
            <div className={styles.social}>
              <a href="mailto:hello@biblefunland.com" className={styles.socialLink} title="Email us">✉️</a>
              <a href="https://twitter.com/biblefunland" target="_blank" rel="noreferrer" className={styles.socialLink} title="Twitter / X">𝕏</a>
              <a href="https://facebook.com/biblefunland" target="_blank" rel="noreferrer" className={styles.socialLink} title="Facebook">📘</a>
              <a href="https://instagram.com/biblefunland" target="_blank" rel="noreferrer" className={styles.socialLink} title="Instagram">📸</a>
            </div>
          </div>

          {/* Features */}
          <div className={styles.col}>
            <h4>Features</h4>
            <ul>
              <li><Link to="/trivia">🎮 Scripture Trivia</Link></li>
              <li><Link to="/devotional">🙏 AI Devotional</Link></li>
              <li><Link to="/map">🗺️ Bible Map</Link></li>
              <li><Link to="/flashcards">🧠 Flashcards</Link></li>
              <li><Link to="/notes">📝 Sermon Notes</Link></li>
              <li><Link to="/prayer">🌍 Prayer Wall</Link></li>
              <li><Link to="/bible">📖 Bible Explorer</Link></li>
              <li><Link to="/certification">🎓 Certification</Link></li>
            </ul>
          </div>

          {/* Games & Tools */}
          <div className={styles.col}>
            <h4>Games & Tools</h4>
            <ul>
              <li><Link to="/game/david-goliath">🏹 David & Goliath</Link></li>
              <li><Link to="/game/runner">🏃 Scripture Runner</Link></li>
              <li><Link to="/game/escape-room">🧩 Escape Room</Link></li>
              <li><Link to="/wordle">🟩 Bible Wordle</Link></li>
              <li><Link to="/share">🔗 Share Cards</Link></li>
              <li><Link to="/activity-sheets">🖨️ Activity Sheets</Link></li>
              <li><Link to="/family-tree">🌳 Family Tree</Link></li>
              <li><Link to="/timeline">📜 Bible Timeline</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className={styles.col}>
            <h4>Company</h4>
            <ul>
              <li><Link to="/contact">📬 Contact Us</Link></li>
              <li><Link to="/blog">✍️ Blog</Link></li>
              <li><Link to="/premium">💎 Go Pro</Link></li>
              <li><Link to="/parent-hub">🏫 Parents & Teachers</Link></li>
              <li><Link to="/auth">🔑 Sign In / Sign Up</Link></li>
              <li><Link to="/privacy">🔒 Privacy Policy</Link></li>
              <li><Link to="/terms">📄 Terms of Use</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} BibleFunLand · Built for the Kingdom 🙏</p>
          <div className={styles.chips}>
            <span className={styles.chip}>✝ Faith</span>
            <span className={styles.chip}>🎮 Fun</span>
            <span className={styles.chip}>❤️ Family</span>
            <span className={styles.chip}>🆓 Free</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
