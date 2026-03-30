import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import styles from './NotFound.module.css';

const VERSES = [
  {
    text: '"I know the plans I have for you, declares the Lord — plans to prosper you."',
    ref: 'Jeremiah 29:11',
  },
  { text: '"For the Son of Man came to seek and to save the lost."', ref: 'Luke 19:10' },
  { text: '"I am the way, the truth and the life."', ref: 'John 14:6' },
  { text: '"All things work together for good to those who love God."', ref: 'Romans 8:28' },
  {
    text: '"Trust in the Lord with all your heart and lean not on your own understanding."',
    ref: 'Proverbs 3:5',
  },
];

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();
  const [verse] = useState(VERSES[Math.floor(Math.random() * VERSES.length)]);
  const [searchQuery, setSearchQuery] = useState('');

  const suggestedPages = [
    { title: 'Home', icon: '🏠', to: '/' },
    { title: 'Trivia', icon: '❓', to: '/trivia' },
    { title: 'Devotional', icon: '🙏', to: '/devotional' },
    { title: 'Flashcards', icon: '🧠', to: '/flashcards' },
    { title: 'Prayer Wall', icon: '🌍', to: '/prayer' },
    { title: 'Dashboard', icon: '📊', to: '/dashboard' },
    { title: 'Bible Map', icon: '🗺️', to: '/map' },
    { title: 'Share Cards', icon: '🔗', to: '/share' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Animated 404 */}
        <div className={styles.headerSection}>
          <div className={styles.numberIcon}>🗺️</div>
          <div className={styles.number}>404</div>
          <h1 className={styles.title}>Page Not Found</h1>
          <p className={styles.subtitle}>
            The path <code className={styles.path}>{location.pathname}</code> leads nowhere
          </p>
        </div>

        {/* Inspiring Quote */}
        <div className={styles.quoteBox}>
          <blockquote className={styles.verse}>{verse.text}</blockquote>
          <cite className={styles.verseRef}>— {verse.ref}</cite>
        </div>

        {/* Description */}
        <div className={styles.description}>
          <p>
            Even the wise men had to search — but they found what they were looking for. Let's get
            you back on the right path.
          </p>
        </div>

        {/* Search Bar */}
        <div className={styles.searchSection}>
          <input
            type="text"
            placeholder="🔍 Search for pages, games, or verses..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' && searchQuery && console.log('Search:', searchQuery)
            }
          />
          <div className={styles.searchHint}>
            Press <kbd>⌘K</kbd> for advanced search
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button onClick={() => navigate('/')} className={styles.primaryBtn}>
            🏠 Go Home
          </button>
          <button onClick={() => navigate(-1)} className={styles.secondaryBtn}>
            ↶ Go Back
          </button>
        </div>

        {/* Suggested Pages Grid */}
        <div className={styles.suggestedSection}>
          <h2 className={styles.suggestedTitle}>Popular Pages</h2>
          <div className={styles.pageGrid}>
            {suggestedPages.map((page) => (
              <Link key={page.to} to={page.to} className={styles.pageCard}>
                <span className={styles.pageIcon}>{page.icon}</span>
                <span className={styles.pageTitle}>{page.title}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Error Details (Dev Mode) */}
        {process.env.NODE_ENV === 'development' && (
          <div className={styles.devInfo}>
            <details>
              <summary>📋 Debug Info</summary>
              <pre>
                {JSON.stringify(
                  {
                    pathname: location.pathname,
                    search: location.search,
                    hash: location.hash,
                    timestamp: new Date().toISOString(),
                  },
                  null,
                  2
                )}
              </pre>
            </details>
          </div>
        )}

        {/* Footer Help */}
        <div className={styles.footer}>
          <p>
            <strong>Can't find what you're looking for?</strong>
            <br />
            Check our{' '}
            <Link to="/blog" className={styles.link}>
              blog
            </Link>{' '}
            or{' '}
            <a href="mailto:hello@biblefunland.com" className={styles.link}>
              contact support
            </a>
          </p>
        </div>
      </div>

      {/* Decorative Floating Elements */}
      <div className={styles.decoration}>
        <div className={`${styles.float} ${styles.float1}`}>📖</div>
        <div className={`${styles.float} ${styles.float2}`}>✝️</div>
        <div className={`${styles.float} ${styles.float3}`}>🙏</div>
        <div className={`${styles.float} ${styles.float4}`}>⭐</div>
      </div>
    </div>
  );
}
