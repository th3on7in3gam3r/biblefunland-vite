import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>✝️</div>
              <span className={styles.logoText}>Bible<span>Fun</span>Land</span>
            </div>
            <p className={styles.desc}>
              An epic journey through God's Word — built with love for families,
              children, and believers everywhere.
            </p>
          </div>

          <div className={styles.col}>
            <h4>Features</h4>
            <ul>
              <li><Link to="/trivia">Scripture Trivia</Link></li>
              <li><Link to="/devotional">AI Devotional</Link></li>
              <li><Link to="/map">Bible Map</Link></li>
              <li><Link to="/flashcards">Flashcards</Link></li>
              <li><Link to="/notes">Sermon Notes</Link></li>
            </ul>
          </div>

          <div className={styles.col}>
            <h4>More</h4>
            <ul>
              <li><Link to="/share">Share Cards</Link></li>
              <li><Link to="/videos">Videos</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/prayer">Prayer Wall</Link></li>
              <li><Link to="/premium">Go Pro 💎</Link></li>
            </ul>
          </div>

          <div className={styles.col}>
            <h4>Info</h4>
            <ul>
              <li><a href="https://biblefunland.com" target="_blank" rel="noreferrer">Live Site</a></li>
              <li><Link to="/auth">Sign In / Sign Up</Link></li>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Use</a></li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} BibleFunLand · Built for the Kingdom</p>
          <div className={styles.chips}>
            <span className={styles.chip}>✝ Faith</span>
            <span className={styles.chip}>🎮 Fun</span>
            <span className={styles.chip}>❤️ Family</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
