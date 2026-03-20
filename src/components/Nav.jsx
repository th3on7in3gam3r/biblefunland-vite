import { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useStreak } from '../context/StreakContext'
import { useKidsMode, KidsModeToggle } from '../context/KidsModeContext'
import { ChildSwitcherButton } from '../context/ChildSwitcherContext'
import { BedtimeModeToggle } from '../context/BedtimeModeContext'
import styles from './Nav.module.css'

const MORE_LINKS = [
  { to: '/map',               label: '🗺️ Bible Map' },
  { to: '/flashcards',        label: '🧠 Flashcards' },
  { to: '/notes',             label: '📝 Sermon Notes',   kidsHide: true },
  { to: '/share',             label: '🔗 Share Cards' },
  { to: '/videos',            label: '🎬 Videos' },
  { to: '/blog',              label: '✍️ Blog',            kidsHide: true },
  { to: '/prayer',            label: '🌍 Prayer Wall' },
  { to: '/bible',             label: '📖 Bible Explorer' },
  { to: '/reading-plan',      label: '📅 Reading Plan' },
  { to: '/certification',     label: '🎓 Certification' },
  { to: '/prayer-beads',      label: '📿 Prayer Beads' },
  { to: '/fasting',           label: '⏳ Fasting Tracker', kidsHide: true },
  { to: '/worship',           label: '🎸 Worship',         kidsHide: true },
  { to: '/timeline',          label: '📜 Bible Timeline' },
  { to: '/family-tree',       label: '🌳 Family Tree' },
]

export default function Nav() {
  const { theme, toggleTheme } = useTheme()
  const { user, profile, signOut } = useAuth()
  const { streak } = useStreak()
  const { kidsMode } = useKidsMode()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [logoClicks, setLogoClicks] = useState(0)
  const [logoTimer, setLogoTimer] = useState(null)
  const moreRef = useRef(null)

  // Close "More" dropdown on outside click or Escape key
  useEffect(() => {
    function handler(e) {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false)
      if (e.key === 'Escape') setMoreOpen(false)
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', handler)
    }
  }, [])

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

  const visibleMore = MORE_LINKS.filter(l => !(kidsMode && l.kidsHide))

  return (
    <>
      <nav className={styles.nav}>
        {/* Logo */}
        <div className={styles.logo} onClick={handleLogoClick}>
          <div className={styles.logoIcon}>✝️</div>
          <span className={styles.logoText}>Bible<span>Fun</span>Land</span>
        </div>

        {/* Desktop primary links */}
        <ul className={styles.links}>
          <li><NavLink to="/" end className={({ isActive }) => isActive ? styles.active : ''}>Home</NavLink></li>
          <li><NavLink to="/trivia" className={({ isActive }) => isActive ? styles.active : ''}>🎮 Trivia</NavLink></li>
          <li><NavLink to="/devotional" className={({ isActive }) => isActive ? styles.active : ''}>🙏 Devotional</NavLink></li>
          {!kidsMode && user && (
            <li><NavLink to="/parent-hub" className={({ isActive }) => isActive ? styles.active : ''}>🏫 Hub</NavLink></li>
          )}
          {!kidsMode && (
            <li><NavLink to="/premium" className={({ isActive }) => isActive ? styles.active : ''}>💎 Pro</NavLink></li>
          )}

          {/* More dropdown */}
          <li ref={moreRef} className={styles.moreWrap}>
            <button
              className={`${styles.moreBtn} ${moreOpen ? styles.moreBtnOpen : ''}`}
              onClick={() => setMoreOpen(o => !o)}
              aria-haspopup="true"
              aria-expanded={moreOpen}
            >
              More <span className={styles.moreCaret}>▾</span>
            </button>
            {moreOpen && (
              <div className={styles.moreDropdown}>
                {visibleMore.map(l => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    className={({ isActive }) => isActive ? styles.dropActive : ''}
                    onClick={() => setMoreOpen(false)}
                  >
                    {l.label}
                  </NavLink>
                ))}
              </div>
            )}
          </li>
        </ul>

        {/* Right side */}
        <div className={styles.right}>
          <KidsModeToggle />

          {(profile?.role === 'Parent' || profile?.role === 'Teacher') && (
            <ChildSwitcherButton />
          )}

          <BedtimeModeToggle />

          <NavLink to="/dashboard" className={styles.streakBadge} title="My Progress">
            🔥 {streak}
          </NavLink>

          <button
            className={`${styles.darkToggle} ${theme === 'dark' ? styles.dark : ''}`}
            onClick={toggleTheme}
            title="Toggle dark mode"
            aria-label="Toggle dark mode"
          >
            <span className={styles.darkToggleThumb} />
          </button>

          {user ? (
            <NavLink to="/profile" className={styles.avatarBtn} title="My Profile">
              👤
            </NavLink>
          ) : (
            <NavLink to="/auth" className="btn btn-blue btn-sm">Sign In</NavLink>
          )}

          <button
            className={`${styles.hamburger} ${drawerOpen ? styles.open : ''}`}
            onClick={() => setDrawerOpen(!drawerOpen)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {drawerOpen && <div className={styles.backdrop} onClick={closeDrawer} />}

      {/* Mobile drawer */}
      <div className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}>

        <div className={styles.drawerSection}>
          <span className={styles.drawerLabel}>Explore</span>
          <NavLink to="/" onClick={closeDrawer}>🏠 Home</NavLink>
          <NavLink to="/trivia" onClick={closeDrawer}>🎮 Scripture Trivia</NavLink>
          {!kidsMode && <NavLink to="/devotional" onClick={closeDrawer}>🙏 AI Devotional</NavLink>}
          <NavLink to="/map" onClick={closeDrawer}>🗺️ Bible Map</NavLink>
          <NavLink to="/flashcards" onClick={closeDrawer}>🧠 Flashcards</NavLink>
          <NavLink to="/bible" onClick={closeDrawer}>📖 Bible Explorer</NavLink>
          <NavLink to="/reading-plan" onClick={closeDrawer}>📅 Reading Plan</NavLink>
          <NavLink to="/timeline" onClick={closeDrawer}>📜 Bible Timeline</NavLink>
        </div>

        <div className={styles.drawerSection}>
          <span className={styles.drawerLabel}>Create & Play</span>
          {!kidsMode && <NavLink to="/notes" onClick={closeDrawer}>📝 Sermon Notes</NavLink>}
          <NavLink to="/share" onClick={closeDrawer}>🔗 Share Cards</NavLink>
          <NavLink to="/videos" onClick={closeDrawer}>🎬 Videos</NavLink>
          {!kidsMode && <NavLink to="/blog" onClick={closeDrawer}>✍️ Blog</NavLink>}
          <NavLink to="/activity-sheets" onClick={closeDrawer}>🖨️ Activity Sheets</NavLink>
        </div>

        <div className={styles.drawerSection}>
          <span className={styles.drawerLabel}>Community & Prayer</span>
          <NavLink to="/prayer" onClick={closeDrawer}>🌍 Prayer Wall</NavLink>
          <NavLink to="/community/chat" onClick={closeDrawer}>💬 Chat Rooms</NavLink>
          <NavLink to="/community/family" onClick={closeDrawer}>👨‍👩‍👧 Family Groups</NavLink>
          <NavLink to="/community/events" onClick={closeDrawer}>⛪ Church Events</NavLink>
        </div>

        {user && (
          <div className={styles.drawerSection}>
            <span className={styles.drawerLabel}>My Account</span>
            <NavLink to="/dashboard" onClick={closeDrawer}>📊 My Progress</NavLink>
            <NavLink to="/profile" onClick={closeDrawer}>👤 My Profile</NavLink>
            <NavLink to="/bedtime-settings" onClick={closeDrawer}>🌙 Bedtime Settings</NavLink>
            {!kidsMode && <NavLink to="/parent-hub" onClick={closeDrawer}>🏫 Parents & Teachers Hub</NavLink>}
          </div>
        )}

        <div className={styles.drawerSection}>
          {!kidsMode && <NavLink to="/premium" onClick={closeDrawer}>💎 Go Pro</NavLink>}
          {!user
            ? <NavLink to="/auth" onClick={closeDrawer}>🔑 Sign In / Sign Up</NavLink>
            : <button onClick={() => { signOut(); closeDrawer() }}>👋 Sign Out</button>
          }
        </div>

      </div>
    </>
  )
}
