import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useStreak } from '../context/StreakContext';
import { useKidsMode, KidsModeToggle } from '../context/KidsModeContext';
import { ChildSwitcherButton } from '../context/ChildSwitcherContext';
import SleepMode from './SleepMode';
import GlobalSearch from './GlobalSearch';
import styles from './Nav.module.css';

const MORE_LINKS = [
  { to: '/apologetics', label: '🤔 Apologetics Q&A' },
  { to: '/bible', label: '📖 Bible Explorer' },
  { to: '/map', label: '🗺️ Bible Map' },
  { to: '/names', label: '🔤 Bible Names' },
  { to: '/timeline', label: '📜 Bible Timeline' },
  { to: '/finance', label: '💸 Biblical Finance' },
  { to: '/blog', label: '✍️ Blog', kidsHide: true },
  { to: '/bookmarks', label: '🔖 Bookmarks' },
  { to: '/certification', label: '🎓 Certification' },
  { to: '/church-finder', label: '⛪ Church Finder' },
  { to: '/creators', label: '🎙️ Creator Program', kidsHide: true },
  { to: '/ai/drama-scripts', label: '🎭 Drama Scripts' },
  { to: '/faith-milestones', label: '📿 Faith Milestones' },
  { to: '/family-tree', label: '🌳 Family Tree' },
  { to: '/fasting', label: '⏳ Fasting Tracker', kidsHide: true },
  { to: '/flashcards', label: '🧠 Flashcards' },
  { to: '/hymns', label: '🎵 Hymn Explorer' },
  { to: '/leaderboard', label: '🏆 Leaderboard' },
  { to: '/notes', label: '📝 Notes', kidsHide: true },
  { to: '/affiliate', label: '🏛️ Partner With Us', kidsHide: true },
  { to: '/partner', label: '⛪ Partnership', kidsHide: true },
  { to: '/podcast', label: '🎙️ Podcast' },
  { to: '/prayer-beads', label: '📿 Prayer Beads' },
  { to: '/prayer-partner', label: '🤝 Prayer Partner' },
  { to: '/prayer', label: '🌍 Prayer Wall' },
  { to: '/reading-plan', label: '📅 Reading Plan' },
  { to: '/resources', label: '💰 Resources' },
  { to: '/share', label: '🔗 Share Cards' },
  { to: '/spiritual-gifts', label: '🧬 Spiritual Gifts' },
  { to: '/videos', label: '🎬 Videos' },
  { to: '/worship', label: '🎸 Worship', kidsHide: true },
];

const PRIMARY_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/trivia', label: '🎮 Trivia' },
  { to: '/devotional', label: '🙏 Devotional' },
];

const DRAWER_SECTIONS = [
  {
    label: 'Explore',
    items: [
      { to: '/', label: '🏠 Home' },
      { to: '/trivia', label: '🎮 Scripture Trivia' },
      { to: '/devotional', label: '🙏 AI Devotional', kidsHide: true },
      { to: '/flashcards', label: '🧠 Flashcards' },
      { to: '/apologetics', label: '🤔 Apologetics Q&A' },
      { to: '/spiritual-gifts', label: '🧬 Spiritual Gifts' },
      { to: '/bible', label: '🧭 Bible Explorer' },
      { to: '/ai/drama-scripts', label: '🎭 Drama Scripts' },
      { to: '/names', label: '🔤 Bible Names' },
      { to: '/reading-plan', label: '📅 Reading Plan' },
      { to: '/hymns', label: '🎵 Hymn Explorer' },
      { to: '/finance', label: '💸 Biblical Finance' },
      { to: '/map', label: '🗺️ Bible Map' },
      { to: '/family-tree', label: '🌳 Family Tree' },
      { to: '/faith-milestones', label: '📿 Faith Milestones' },
      { to: '/timeline', label: '📜 Bible Timeline' },
      { to: '/resources', label: '💰 Resources' },
      { to: '/affiliate', label: '🏛️ Partner With Us', kidsHide: true },
      { to: '/partner', label: '⛪ Ministry Partnership', kidsHide: true },
      { to: '/creators', label: '🎙️ Creator Program', kidsHide: true },
    ],
  },
  {
    label: 'Create & Play',
    items: [
      { to: '/notes', label: '📝 Sermon Notes', kidsHide: true },
      { to: '/share', label: '🔗 Share Cards' },
      { to: '/videos', label: '🎬 Videos' },
      { to: '/blog', label: '✍️ Blog', kidsHide: true },
      { to: '/read', label: '📖 Read' },
      { to: '/worship', label: '🎸 Worship', kidsHide: true },
      { to: '/certification', label: '🎓 Certification' },
      { to: '/activity-sheets', label: '🖨️ Activity Sheets' },
    ],
  },
  {
    label: 'Community & Prayer',
    items: [
      { to: '/prayer', label: '🌍 Prayer Wall' },
      { to: '/prayer-partner', label: '🤝 Prayer Partner' },
      { to: '/prayer-beads', label: '📿 Prayer Beads' },
      { to: '/fasting', label: '⏳ Fasting Tracker', kidsHide: true },
      { to: '/leaderboard', label: '🏆 Leaderboard' },
      { to: '/podcast', label: '🎙️ Podcast' },
      { to: '/bookmarks', label: '🔖 My Bookmarks' },
      { to: '/church-finder', label: '⛪ Church Finder' },
      { to: '/community/chat', label: '💬 Chat Rooms' },
      { to: '/community/family', label: '👨‍👩‍👧 Family Groups' },
      { to: '/community/events', label: '⛪ Church Events' },
    ],
  },
];

export default function Nav() {
  const [sleepOpen, setSleepOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const { streak } = useStreak();
  const { kidsMode } = useKidsMode();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const [logoTimer, setLogoTimer] = useState(null);
  const moreRef = useRef(null);

  // Close "More" dropdown on outside click or Escape key
  useEffect(() => {
    function handler(e) {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
      if (e.key === 'Escape') setMoreOpen(false);
    }
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', handler);
    };
  }, []);

  function handleLogoClick() {
    const count = logoClicks + 1;
    setLogoClicks(count);
    clearTimeout(logoTimer);
    if (count >= 5) {
      setLogoClicks(0);
      navigate('/admin/login');
    } else {
      setLogoTimer(setTimeout(() => setLogoClicks(0), 3000));
    }
  }

  function closeDrawer() {
    setDrawerOpen(false);
  }

  const userRole = profile?.role?.toLowerCase() || '';
  const isPastor = userRole === 'pastor' || userRole === 'leader' || userRole === 'admin';
  console.log('⛪ Current User Role:', userRole, '| Is Leader:', isPastor);

  const churchLink = isPastor
    ? { to: '/church/dashboard', label: '⛪ Church Hub' }
    : { to: '/church/join', label: '🤝 Join Church' };

  const visibleMore = [churchLink, ...MORE_LINKS.filter((l) => !(kidsMode && l.kidsHide))];

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

        {/* Desktop primary links */}
        <ul className={styles.links}>
          {PRIMARY_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => (isActive ? styles.active : '')}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
          {!kidsMode && user && (isPastor || userRole === 'parent' || userRole === 'teacher') && (
            <li>
              <NavLink
                to="/parent-hub"
                className={({ isActive }) => (isActive ? styles.active : '')}
              >
                🏫 Hub
              </NavLink>
            </li>
          )}
          {!kidsMode && (
            <li>
              <NavLink to="/premium" className={({ isActive }) => (isActive ? styles.active : '')}>
                💎 Pro
              </NavLink>
            </li>
          )}

          {/* More dropdown */}
          <li ref={moreRef} className={styles.moreWrap}>
            <button
              className={`${styles.moreBtn} ${moreOpen ? styles.moreBtnOpen : ''}`}
              onClick={() => setMoreOpen((o) => !o)}
              aria-haspopup="true"
              aria-expanded={moreOpen}
            >
              More <span className={styles.moreCaret}>▾</span>
            </button>
            {moreOpen && (
              <div className={styles.moreDropdown}>
                {visibleMore.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    className={({ isActive }) => (isActive ? styles.dropActive : '')}
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
          <div className={styles.desktopSearch}>
            <GlobalSearch />
          </div>

          <KidsModeToggle className={styles.kidsToggle} />

          {isPastor || userRole === 'parent' || (userRole === 'teacher' && <ChildSwitcherButton />)}

          <button
            onClick={() => setSleepOpen(true)}
            className={styles.bedtimeBtn}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 100,
              border: '2px solid rgba(159, 122, 234, 0.4)',
              background: 'transparent',
              color: 'var(--ink3)',
              cursor: 'pointer',
              fontFamily: 'Poppins,sans-serif',
              fontSize: '.72rem',
              fontWeight: 700,
              transition: 'all .2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(159, 122, 234, 0.08)';
              e.currentTarget.style.borderColor = '#9F7AEA';
              e.currentTarget.style.color = '#9F7AEA';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(159, 122, 234, 0.4)';
              e.currentTarget.style.color = 'var(--ink3)';
            }}
          >
            🌙 <span className={styles.bedtimeText}>Bedtime Bible</span>
          </button>

          <NavLink to="/dashboard" className={`${styles.streakBadge} ${styles.mobileHide}`} title="My Progress">
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
            <NavLink to="/auth" className="btn btn-blue btn-sm">
              Sign In
            </NavLink>
          )}

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

      {drawerOpen && <div className={styles.backdrop} onClick={closeDrawer} />}

      {/* Mobile drawer */}
      <div className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.mobileSearch}>
          <GlobalSearch />
        </div>

        <div className={styles.drawerSection}>
          <span className={styles.drawerLabel}>Quick Access</span>
          <button
            onClick={() => {
              setSleepOpen(true);
              closeDrawer();
            }}
          >
            🌙 Bedtime Bible
          </button>
          <KidsModeToggle />
        </div>

        {DRAWER_SECTIONS.map((section) => (
          <div className={styles.drawerSection} key={section.label}>
            <span className={styles.drawerLabel}>{section.label}</span>
            {section.items
              .filter((item) => !(kidsMode && item.kidsHide))
              .map((item) => (
                <NavLink key={item.to} to={item.to} onClick={closeDrawer}>
                  {item.label}
                </NavLink>
              ))}
            {section.label === 'Explore' && (
              <NavLink to={churchLink.to} onClick={closeDrawer}>
                {churchLink.label}
              </NavLink>
            )}
          </div>
        ))}

        {user && (
          <div className={styles.drawerSection}>
            <span className={styles.drawerLabel}>My Account</span>
            <NavLink to="/dashboard" onClick={closeDrawer}>
              📊 My Progress
            </NavLink>
            <NavLink to="/profile" onClick={closeDrawer}>
              👤 My Profile
            </NavLink>
            <NavLink to="/bedtime-settings" onClick={closeDrawer}>
              🌙 Bedtime Settings
            </NavLink>
            {!kidsMode && (isPastor || userRole === 'parent' || userRole === 'teacher') && (
              <NavLink to="/parent-hub" onClick={closeDrawer}>
                🏫 Parents & Teachers Hub
              </NavLink>
            )}
          </div>
        )}

        <div className={styles.drawerSection}>
          {!kidsMode && (
            <NavLink to="/premium" onClick={closeDrawer}>
              💎 Go Pro
            </NavLink>
          )}
          {!user ? (
            <NavLink to="/auth" onClick={closeDrawer}>
              🔑 Sign In / Sign Up
            </NavLink>
          ) : (
            <button
              onClick={() => {
                signOut();
                closeDrawer();
              }}
            >
              👋 Sign Out
            </button>
          )}
        </div>
      </div>

      {sleepOpen && <SleepMode onClose={() => setSleepOpen(false)} />}
    </>
  );
}
