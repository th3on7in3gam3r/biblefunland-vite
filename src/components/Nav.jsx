import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useStreak } from '../context/StreakContext';
import { useKidsMode, KidsModeToggle } from '../context/KidsModeContext';
import { ChildSwitcherButton } from '../context/ChildSwitcherContext';
import { useAds } from '../context/AdsContext';
import SleepMode from './SleepMode';
import GlobalSearch from './GlobalSearch';
import styles from './Nav.module.css';

// ── Nav structure ─────────────────────────────────────────────────────────────
const PRIMARY_NAV = [
  {
    to: '/play',
    label: 'Games',
    dropdown: [
      { to: '/play', label: '🏰 Games Arcade' },
      { to: '/play/trivia', label: '🎮 Trivia & Quizzes' },
      { to: '/play/flashcards', label: '🧠 Flashcards' },
      { to: '/play/activity-sheets', label: '🖨️ Activity Sheets' },
    ],
  },
  {
    to: '/devotional',
    label: 'Devotionals',
    dropdown: [
      { to: '/devotional', label: '🙏 AI Devotional' },
      { to: '/chat/characters', label: '💬 Bible Character Chat' },
      { to: '/ai/drama-scripts', label: '🎭 Drama Scripts' },
      { to: '/ai/rap-generator', label: '🎵 Bible Rap Generator' },
      { to: '/ai/miracle-art', label: '🖼️ Miracle Art' },
      { to: '/grow', label: '🌱 Grow' },
    ],
  },
  {
    to: '/explore',
    label: 'Explore the Bible',
    dropdown: [
      { to: '/explore/bible', label: '📖 Read the Bible' },
      { to: '/explore/world', label: '🗺️ Living Bible Map' },
      { to: '/explore/timeline', label: '📜 Bible Timeline' },
      { to: '/family-tree', label: '🌳 Family Tree' },
      { to: '/names', label: '🔤 Bible Names' },
      { to: '/explore/voice-reader', label: '🎙️ Voice Bible Reader' },
    ],
  },
  {
    to: '/parents',
    label: 'Parents & Teachers',
    dropdown: [
      { to: '/parents', label: '🏫 Parents Hub' },
      { to: '/grow/certification', label: '🎓 Kids Certification' },
      { to: 'https://homeschool.biblefunland.com', label: '🏠 HomeSchool Hub', isExternal: true },
      { to: 'https://junior.biblefunland.com', label: '🦁 BibleFunLand Jr.', isExternal: true },
      { to: 'https://verse-verse.biblefunland.com', label: '† Verse Verse', isExternal: true },
      { to: 'https://rhemanotes.biblefunland.com', label: '✍️ Rhema Notes', isExternal: true },
      { to: 'https://vesper.biblefunland.com', label: '⛪ Vesper Ministry', isExternal: true },
    ],
  },
  { to: '/podcast', label: 'Podcast' },
  {
    to: '/community',
    label: 'Community',
    dropdown: [
      { to: '/community', label: '🌐 Community Hub' },
      { to: '/prayer', label: '🙏 Prayer Wall' },
      { to: '/community/family', label: '👨‍👩‍👧 Family Groups' },
      { to: '/community/chat', label: '💬 Chat Rooms' },
      { to: '/leaderboard', label: '🏆 Leaderboard' },
      { to: '/church-finder', label: '⛪ Church Finder' },
      { to: '/worship-radio', label: '🎵 Worship & Radio' },
    ],
  },
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
      { to: 'https://homeschool.biblefunland.com', label: '🏠 HomeSchool Hub' },
      { to: 'https://junior.biblefunland.com', label: '🦁 BibleFunLand Jr. (ages 2–7)' },
    ],
  },
  {
    label: 'Explore',
    items: [
      { to: '/explore/world', label: '🗺️ Living Bible Map' },
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
      { to: 'https://rhemanotes.biblefunland.com', label: '✍️ Rhema Notes' },
      { to: 'https://verse-verse.biblefunland.com', label: '† Verse Verse' },
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
      { to: '/worship-radio', label: '🎵 Worship & Radio' },
      { to: 'https://vesper.biblefunland.com', label: '⛪ Vesper Ministry' },
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
  const { isProUser, isFamilyUser, proChecked } = useAds();
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
      if (e.key === 'Escape') {
        setAvatarOpen(false);
        setActiveMenu(null);
      }
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
    } else setLogoTimer(setTimeout(() => setLogoClicks(0), 3000));
  }

  const userRole = profile?.role?.toLowerCase() || '';
  const isPastor = userRole === 'pastor' || userRole === 'leader' || userRole === 'admin';
  const avatarInitial = user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || '👤';

  return (
    <>
      <nav className={styles.nav} aria-label="Main">
        {/* Logo — clicks to Home (5 quick taps opens admin) */}
        <NavLink to="/" className={styles.logoLink} aria-label="BibleFunLand home">
          <div className={styles.logo} onClick={handleLogoClick}>
            <span className={styles.logoIcon} aria-hidden="true">
              <svg viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="19" className={styles.logoSun} />
                <path
                  d="M9 27c0-6 5-8 11-6 6-2 11 0 11 6v1c-6-2-11 0-11 0s-5-2-11 0z"
                  className={styles.logoBook}
                />
                <path d="M20 8v11M16 12h8" className={styles.logoCross} />
              </svg>
            </span>
            <span className={styles.logoText}>
              Bible<span>Fun</span>Land
            </span>
          </div>
        </NavLink>

        {/* Desktop links */}
        <ul className={styles.links} ref={navRef}>
          {PRIMARY_NAV.map((link) => {
            if (link.dropdown) {
              const isOpen = activeMenu === link.label;
              return (
                <li
                  key={link.to}
                  className={styles.moreWrap}
                  onMouseEnter={() => setActiveMenu(link.label)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      `${styles.moreBtn} ${isActive || isOpen ? styles.moreBtnOpen : ''}`
                    }
                    onClick={() => setActiveMenu(null)}
                  >
                    {link.label}
                    <span className={`${styles.moreCaret} ${isOpen ? styles.caretOpen : ''}`}>
                      ▾
                    </span>
                  </NavLink>
                  {isOpen && (
                    <div className={styles.moreDropdown}>
                      {link.dropdown.map((item) =>
                        item.isExternal ? (
                          <a
                            key={item.to}
                            href={item.to}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.dropLink}
                            onClick={() => setActiveMenu(null)}
                          >
                            {item.label}
                          </a>
                        ) : (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => (isActive ? styles.dropActive : '')}
                            onClick={() => setActiveMenu(null)}
                          >
                            {item.label}
                          </NavLink>
                        )
                      )}
                    </div>
                  )}
                </li>
              );
            }
            return (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => (isActive ? styles.active : '')}
                >
                  {link.label}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* Right side */}
        <div className={styles.right}>
          <div className={styles.desktopSearch}>
            <GlobalSearch />
          </div>
          <KidsModeToggle className={styles.kidsToggle} />
          {(isPastor || userRole === 'parent' || userRole === 'teacher') && <ChildSwitcherButton />}

          <NavLink to="/play" className={styles.playFree}>
            Play free
          </NavLink>

          <div ref={avatarRef} className={styles.userSection}>
            {!user ? (
              <NavLink to="/auth" className={styles.signInBtn}>
                Sign in
              </NavLink>
            ) : (
              <div className={styles.avatarWrap}>
                {/* Plan badge / Go Pro pill */}
                {proChecked &&
                  (isFamilyUser ? (
                    <NavLink to="/premium" className={styles.familyBadge}>
                      👨‍👩‍👧 Family
                    </NavLink>
                  ) : isProUser ? (
                    <NavLink to="/premium" className={styles.proBadge}>
                      💎 Pro
                    </NavLink>
                  ) : (
                    <NavLink to="/premium" className={styles.goProBtn}>
                      💎 Go Pro
                    </NavLink>
                  ))}

                <button
                  className={styles.avatarBtn}
                  onClick={() => setAvatarOpen((o) => !o)}
                  title="My Account"
                >
                  {avatarInitial}
                </button>

                {avatarOpen && (
                  <div className={styles.avatarDropdown}>
                    <div className={styles.avatarDropdownSection}>
                      <div className={styles.userName}>
                        {user.firstName || user.email || 'My Account'}
                      </div>
                      <div className={styles.userMeta}>
                        <span className={styles.streakPill}>🔥 {streak} Streak</span>
                        <span className={styles.roleTag}>{userRole || 'Member'}</span>
                      </div>
                    </div>
                    <div className={styles.avatarDropdownSection}>
                      <button
                        className={styles.avatarMenuToggle}
                        onClick={() => {
                          toggleTheme();
                          setAvatarOpen(false);
                        }}
                      >
                        {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
                      </button>
                    </div>
                    {[
                      { to: '/dashboard', label: '📊 My Progress' },
                      { to: '/bookmarks', label: '🔖 Bookmarks' },
                      { to: '/profile', label: '👤 Profile & Settings' },
                      ...(isPastor || userRole === 'parent' || userRole === 'teacher'
                        ? [{ to: '/parents', label: '🏫 Parents Hub' }]
                        : []),
                    ].map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setAvatarOpen(false)}
                        className={styles.avatarDropLink}
                      >
                        {item.label}
                      </NavLink>
                    ))}
                    <div
                      className={styles.avatarDropdownSection}
                      style={{ border: 'none', marginTop: 8 }}
                    >
                      <button
                        onClick={() => {
                          signOut();
                          setAvatarOpen(false);
                        }}
                        className={styles.avatarSignOutBtn}
                      >
                        👋 Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

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

      {drawerOpen && <div className={styles.backdrop} onClick={() => setDrawerOpen(false)} />}

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
              setDrawerOpen(false);
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
              .map((item) => {
                const isExternal = item.to.startsWith('http');
                if (isExternal) {
                  return (
                    <a
                      key={item.to}
                      href={item.to}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setDrawerOpen(false)}
                    >
                      {item.label}
                    </a>
                  );
                }
                return (
                  <NavLink key={item.to} to={item.to} onClick={() => setDrawerOpen(false)}>
                    {item.label}
                  </NavLink>
                );
              })}
          </div>
        ))}

        {user && (
          <div className={styles.drawerSection}>
            <span className={styles.drawerLabel}>My Account</span>
            <NavLink to="/dashboard" onClick={() => setDrawerOpen(false)}>
              📊 My Progress
            </NavLink>
            <NavLink to="/bookmarks" onClick={() => setDrawerOpen(false)}>
              🔖 Bookmarks
            </NavLink>
            <NavLink to="/profile" onClick={() => setDrawerOpen(false)}>
              👤 Profile & Settings
            </NavLink>
            {!kidsMode && (isPastor || userRole === 'parent' || userRole === 'teacher') && (
              <NavLink to="/parents" onClick={() => setDrawerOpen(false)}>
                🏫 Parents & Teachers Hub
              </NavLink>
            )}
          </div>
        )}

        <div className={styles.drawerSection}>
          {!kidsMode &&
            (isFamilyUser ? (
              <NavLink
                to="/premium"
                onClick={() => setDrawerOpen(false)}
                style={{ color: '#F97316', fontWeight: 700 }}
              >
                👨‍👩‍👧 Family Plan
              </NavLink>
            ) : isProUser ? (
              <NavLink
                to="/premium"
                onClick={() => setDrawerOpen(false)}
                style={{ color: '#F59E0B', fontWeight: 700 }}
              >
                💎 Pro Member
              </NavLink>
            ) : (
              <NavLink to="/premium" onClick={() => setDrawerOpen(false)}>
                💎 Go Pro
              </NavLink>
            ))}
          {!user ? (
            <NavLink
              to="/auth"
              onClick={() => setDrawerOpen(false)}
              className={styles.drawerAuthBtn}
            >
              🔐 Sign In / Sign Up
            </NavLink>
          ) : (
            <button
              onClick={() => {
                signOut();
                setDrawerOpen(false);
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
