import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useStreak } from '../context/StreakContext'
import { KidsModeToggle, useKidsMode, KIDS_HIDDEN_ROUTES } from '../context/KidsModeContext'
import styles from './Nav.module.css'

export default function Nav() {
  const { theme, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()
  const { streak } = useStreak()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [logoClicks, setLogoClicks] = useState(0)
  const [logoTimer, setLogoTimer] = useState(null)
  const { kidsMode } = useKidsMode()

  const desktopLinks = [
    { to: '/', label: 'Home', end: true },
    { to: '/trivia', label: '🎮 Trivia' },
    { to: '/devotional', label: '🙏 Devotional' },
    { to: '/notes', label: '📝 Notes' },
    { to: '/premium', label: '💎 Pro' },
    { to: '/profile', label: '👤 Profile', authOnly: true },
  ]

  const mobileLinks = [
    { to: '/', label: '🏠 Home' },
    { to: '/trivia', label: '🎮 Scripture Trivia' },
    { to: '/devotional', label: '🙏 AI Devotional' },
    { to: '/map', label: '🗺️ Bible Map' },
    { to: '/flashcards', label: '🧠 Flashcards' },
    { to: '/notes', label: '📝 Sermon Notes' },
    { to: '/share', label: '🔗 Share Cards' },
    { to: '/videos', label: '🎬 Videos' },
    { to: '/blog', label: '✍️ Blog' },
    { to: '/prayer', label: '🌍 Prayer Wall' },
    { to: '/dashboard', label: '📊 My Progress' },
    { to: '/profile', label: '👤 My Profile', authOnly: true },
    { to: '/premium', label: '💎 Go Pro' },
  ]

  // Secret knock: click logo 5x to trigger admin PIN
  function handleLogoClick() {
    const count = logoClicks + 1
    setLogoClicks(count)
    clearTimeout(logoTimer)
    if (count >= 5) {
      setLogoClicks(0)
      navigate('/admin/login')
    } else {
      setLogoTimer(setTimeout(() => setLogoClicks(0), 3000))
    }
  }

  function closeDrawer() { setDrawerOpen(false) }

  return (
    <>
      <nav className={styles.nav}>
        {/* Logo */}
        <div className={styles.logo} onClick={handleLogoClick}>
          <div className={styles.logoIcon}>✝️</div>
          <span className={styles.logoText}>
            Bible<span>Fun</span>Land
          </span>
        </div>

        {/* Desktop links */}
        <ul className={styles.links}>
          {desktopLinks.map(link => (
            (!kidsMode || !KIDS_HIDDEN_ROUTES.includes(link.to)) && (!link.authOnly || user) && (
              <li key={link.to}>
                <NavLink to={link.to} end={link.end} className={({ isActive }) => isActive ? styles.active : ''}>
                  {link.label}
                </NavLink>
              </li>
            )
          ))}
        </ul>

        {/* Right side */}
        <div className={styles.right}>
          {/* Streak badge */}
          <NavLink to="/dashboard" className={styles.streakBadge}>
            🔥 {streak}
          </NavLink>

          {/* Kids Mode Toggle */}
          <div style={{ marginRight: 8 }}>
            <KidsModeToggle />
          </div>

          {/* Dark mode toggle */}
          <button
            className={`${styles.darkToggle} ${theme === 'dark' ? styles.dark : ''}`}
            onClick={toggleTheme}
            title="Toggle dark mode"
            aria-label="Toggle dark mode"
          >
            <span className={styles.darkToggleThumb} />
          </button>

          {/* Auth */}
          {user ? (
            <button className="btn btn-outline btn-sm" onClick={signOut}>
              Sign Out
            </button>
          ) : (
            <NavLink to="/auth" className="btn btn-blue btn-sm">
              Sign In
            </NavLink>
          )}

          {/* Hamburger */}
          <button
            className={`${styles.hamburger} ${drawerOpen ? styles.open : ''}`}
            onClick={() => setDrawerOpen(!drawerOpen)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* Mobile backdrop */}
      {drawerOpen && (
        <div className={styles.backdrop} onClick={closeDrawer} />
      )}

      {/* Mobile drawer */}
      <div className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}>
        {mobileLinks.map(link => (
          (!kidsMode || !KIDS_HIDDEN_ROUTES.includes(link.to)) && (!link.authOnly || user) && (
            <NavLink key={link.to} to={link.to} onClick={closeDrawer}>
              {link.label}
            </NavLink>
          )
        ))}

        {!user
          ? <NavLink to="/auth" onClick={closeDrawer}>🔑 Sign In / Sign Up</NavLink>
          : <button onClick={() => { signOut(); closeDrawer() }}>👋 Sign Out</button>
        }
      </div>
    </>
  )
}
