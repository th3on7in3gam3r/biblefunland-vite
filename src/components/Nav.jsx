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

// ── Nav structure ─────────────────────────────────────────────────────────────
const PRIMARY_NAV = [
  { to: '/', label: 'Home', end: true },
  {
    to: '/play',
    label: '🎲 Play',
    dropdown: [
      { to: '/play', label: '🏰 Games Arcade' },
      { to: '/play/trivia', label: '🎮 Trivia & Quizzes' },
      { to: '/play/flashcards', label: '🧠 Flashcards' },
      { to: '/play/activity-sheets', label: '🖨️ Activity Sheets' },
    ],
  },
  {
    to: '/explore',
    label: '🔍 Explore',
    dropdown: [
      { to: '/explore/world', label: '🌍 Virtual Bible World' },
      { to: '/explore/timeline', label: '📜 Bible Timeline' },
      { to: '/family-tree', label: '🌳 Family Tree' },
      { to: '/names', label: '🔤 Bible Names' },
      { to: '/explore/voice-reader', label: '🎙️ Voice Bible Reader' },
    ],
  },
  {
    to: '/ai',
    label: '🤖 AI Fun',
    dropdown: [
      { to: '/devotional', label: '🙏 AI Devotional' },
      { to: '/chat/characters', label: '💬 Bible Character Chat' },
      { to: '/ai/drama-scripts', label: '🎭 Drama Scripts' },
      { to: '/ai/rap-generator', label: '🎵 Bible Rap Generator' },
      { to: '/ai/miracle-art', label: '🖼️ Miracle Art' },
    ],
  },
  { to: '/grow', label: '🌱 Grow' },
  { to: '/community', label: '🌐 Community' },
  { to: '/parents', label: '🏫 Parents' },
];

// ── Mobile drawer ─────────────────────────────────────────────────────────────
const DRAWER_SECTIONS = [
  {
    label: 'Play & Learn',
    items: [
      { to: '/play', label: '🏰 Games Arcade' },
      { to: '/play/trivia', label: '🎮 Trivia & Quizzes' },
      { to: '/play/flashcards', label: '🧠 Flashcards' },
      { to: '/play/activity-sheets', label: '🖨️ Activity Sheets' },
    ],
  },
  {
    label: 'Explore',
    items: [
      { to: '/explore/world', label: '🌍 Virtual Bible World' },
      { to: '/explore/timeline', label: '📜 Bible Timeline' },
      { to: '/family-tree', label: '🌳 Family Tree' },
      { to: '/names', label: '🔤 Bible Names' },
      { to: '/explore/voice-reader', label: '🎙️ Voice Bible Reader' },
      { to: '/explore/bible', label: '📖 Read the Bible' },
      { to: '/map', label: '🗺️ Bible Map' },
    ],
  },
  {
    label: 'AI Fun',
    items: [
      { to: '/devotional', label: '🙏 AI Devotional', kidsHide: true },
      { to: '/chat/characters', label: '💬 Bible Character Chat' },
      { to: '/ai/drama-scripts', label: '🎭 Drama Scripts', kidsHide: true },
      { to: '/ai/rap-generator', label: '🎵 Bible Rap Generator' },
      { to: '/ai/miracle-art', label: '🖼️ Miracle Art' },
    ],
  },
  {
    label: 'Grow & Community',
    items: [
      { to: '/grow', label: '🌱 Grow' },
      { to: '/prayer', label: '🙏 Prayer Wall' },
      { to: '/leaderboard', label: '🏆 Leaderboard' },
      { to: '/community/chat', label: '💬 Chat Rooms' },
      { to: '/community/family', label: '👨‍👩‍👧 Family Groups' },
      { to: '/church-finder', label: '⛪ Church Finder' },
      { to: '/podcast', label: '🎙️ Podcast', kidsHide: true },
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
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [logoClicks, setLogoClicks] = useState(0);
  const [logoTimer, setLogoTimer] = useState(null);

  const avatarRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setAvatarOpen(false);
      if (navRef.current && !navRef.current.contains(e.target)) setActiveMenu(null);
      if (e.key === 'Escape') { setAvatarOpen(false); setActiveMenu(null); }
    }
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', handler);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', handler); };
  }, []);

  function handleLogoClick() {
    const count = logoClicks + 1;
    setLogoClicks(count);
    clearTimeout(logoTimer);
    if (count >= 5) { setLogoClicks(0); navigate('/admin/login'); }
    else setLogoTimer(setTimeout(() => setLogoClicks(0), 3000));
  }

  const userRole = profile?.role?.toLowerCase() || '';
  const isPastor = userRole === 'pastor' || userRole === 'leader' || userRole === 'admin';
  const avatarInitial = user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || '👤';

  return (
    <>
      <nav className={styles.nav}>
        {/* Logo */}
        <div className={styles.logo} onClick={handleLogoClick}>
          <div className={styles.logoIcon}>✝️</div>
          <span className={styles.logoText}>Bible<span>Fun</span>Land</span>
        </div>

        {/* Desktop links */}
        <ul className={styles.links} ref={navRef}>
          {PRIMARY_NAV.map((link) => {
            if (link.dropdown) {
              const isOpen = activeMenu === link.label;
              return (
                <li key={link.to} className={styles.moreWrap}
                  onMouseEnter={() => setActiveMenu(link.label)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <NavLink to={link.to}
                    className={({ isActive }) => `${styles.moreBtn} ${isActive || isOpen ? styles.moreBtnOpen : ''}`}
                    onClick={() => setActiveMenu(null)}
                  >
                    {link.label}
                    <span className={`${styles.moreCaret} ${isOpen ? styles.caretOpen : ''}`}>▾</span>
                  </NavLink>
                  {isOpen && (
                    <div className={styles.moreDropdown} role="menu">
                      {link.dropdown.map((item) => (
                        <NavLink key={item.to} to={item.to}
                          className={({ isActive }) => isActive ? styles.dropActive : ''}
                          onClick={() => setActiveMenu(null)}
                        >
                          {item.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </li>
              );
            }
            return (
              <li key={link.to}>
                <NavLink to={link.to} end={link.end}
                  className={({ isActive }) => isActive ? styles.active : ''}
                >
                  {link.label}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* Right side */}
        <div className={styles.right}>
          <div className={styles.desktopSearch}><GlobalSearch /></div>
          <KidsModeToggle className={styles.kidsToggle} />
          {(isPastor || userRole === 'parent' || userRole === 'teacher') && <ChildSwitcherButton />}

          <div ref={avatarRef} className={styles.userSection}>
            {!user ? (
              <NavLink to="/auth" className={styles.signInBtn}>🔐 Sign In</NavLink>
            ) : (
              <div className={styles.avatarWrap}>
                {/* Go Pro pill */}
                <NavLink to="/premium" className={styles.goProBtn}>💎 Go Pro</NavLink>

                <button className={styles.avatarBtn} onClick={() => setAvatarOpen(o => !o)} title="My Account">
                  {avatarInitial}
                </button>

                {avatarOpen && (
                  <div className={styles.avatarDropdown}>
                    <div className={styles.avatarDropdownSection}>
                      <div className={styles.userName}>{user.firstName || user.email || 'My Account'}</div>
                      <div className={styles.userMeta}>
                        <span className={styles.streakPill}>🔥 {streak} Streak</span>
                        <span className={styles.roleTag}>{userRole || 'Member'}</span>
                      </div>
                    </div>
                    <div className={styles.avatarDropdownSection}>
                      <button className={styles.avatarMenuToggle} onClick={() => { toggleTheme(); setAvatarOpen(false); }}>
                        {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
                      </button>
                    </div>
                    {[
                      { to: '/dashboard', label: '📊 My Progress' },
                      { to: '/bookmarks', label: '🔖 Bookmarks' },
                      { to: '/profile', label: '👤 Profile & Settings' },
                      ...(isPastor || userRole === 'parent' || userRole === 'teacher'
                        ? [{ to: '/parents', label: '🏫 Parents Hub' }] : []),
                    ].map(item => (
                      <NavLink key={item.to} to={item.to} onClick={() => setAvatarOpen(false)} className={styles.avatarDropLink}>
                        {item.label}
                      </NavLink>
                    ))}
                    <div className={styles.avatarDropdownSection} style={{ border: 'none', marginTop: 8 }}>
                      <button onClick={() => { signOut(); setAvatarOpen(false); }} className={styles.avatarSignOutBtn}>
                        👋 Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hamburger */}
          <button className={`${styles.hamburger} ${drawerOpen ? styles.open : ''}`}
            onClick={() => setDrawerOpen(!drawerOpen)} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {drawerOpen && <div className={styles.backdrop} onClick={() => setDrawerOpen(false)} />}

      {/* Mobile drawer */}
      <div className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.mobileSearch}><GlobalSearch /></div>

        <div className={styles.drawerSection}>
          <span className={styles.drawerLabel}>Quick Access</span>
          <button onClick={() => { setSleepOpen(true); setDrawerOpen(false); }}>🌙 Bedtime Bible</button>
          <KidsModeToggle />
        </div>

        {DRAWER_SECTIONS.map(section => (
          <div className={styles.drawerSection} key={section.label}>
            <span className={styles.drawerLabel}>{section.label}</span>
            {section.items
              .filter(item => !(kidsMode && item.kidsHide))
              .map(item => (
                <NavLink key={item.to} to={item.to} onClick={() => setDrawerOpen(false)}>{item.label}</NavLink>
              ))}
          </div>
        ))}

        {user && (
          <div className={styles.drawerSection}>
            <span className={styles.drawerLabel}>My Account</span>
            <NavLink to="/dashboard" onClick={() => setDrawerOpen(false)}>📊 My Progress</NavLink>
            <NavLink to="/bookmarks" onClick={() => setDrawerOpen(false)}>🔖 Bookmarks</NavLink>
            <NavLink to="/profile" onClick={() => setDrawerOpen(false)}>👤 Profile & Settings</NavLink>
            {!kidsMode && (isPastor || userRole === 'parent' || userRole === 'teacher') && (
              <NavLink to="/parents" onClick={() => setDrawerOpen(false)}>🏫 Parents & Teachers Hub</NavLink>
            )}
          </div>
        )}

        <div className={styles.drawerSection}>
          {!kidsMode && <NavLink to="/premium" onClick={() => setDrawerOpen(false)}>💎 Go Pro</NavLink>}
          {!user ? (
            <NavLink to="/auth" onClick={() => setDrawerOpen(false)} className={styles.drawerAuthBtn}>
              🔐 Sign In / Sign Up
            </NavLink>
          ) : (
            <button onClick={() => { signOut(); setDrawerOpen(false); }}>👋 Sign Out</button>
          )}
        </div>
      </div>

      {sleepOpen && <SleepMode onClose={() => setSleepOpen(false)} />}
    </>
  );
}
