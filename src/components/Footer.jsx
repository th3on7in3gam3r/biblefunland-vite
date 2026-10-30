import { Link } from 'react-router-dom';
import RainbowLogo from './RainbowLogo';
import StoryIcon from './StoryIcon';
import '../styles/storybook.css';
import styles from './Footer.module.css';

const MAIN_LINKS = [
  { to: '/play', label: 'Games' },
  { to: '/devotional', label: 'Devotionals' },
  { to: '/explore/bible', label: 'Explore the Bible' },
  { to: '/parents', label: 'Parents & Teachers' },
  { to: '/podcast', label: 'Podcast' },
];

const SMALL_LINKS = [
  { to: '/prayer', label: 'Prayer Wall' },
  { to: '/community', label: 'Community' },
  { to: '/premium', label: 'Go Pro' },
  { to: '/affiliate', label: 'Partner With Us' },
  { to: 'https://junior.biblefunland.com', label: 'BibleFunLand Jr.', isExternal: true },
  { to: 'https://homeschool.biblefunland.com', label: 'HomeSchool Hub', isExternal: true },
  { to: 'https://biblefunlandstudios.com', label: 'BibleFunLand Studios', isExternal: true },
  { to: '/contact', label: 'Contact' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div>
            <Link to="/" aria-label="BibleFunLand home" className={styles.logoLink}>
              <RainbowLogo size="lg" />
            </Link>
            <p className={styles.tagline}>
              Bible fun for Christian families worldwide, free to start.
            </p>
          </div>
          <nav aria-label="Footer" className={styles.mainLinks}>
            {MAIN_LINKS.map((l) => (
              <Link key={l.to} to={l.to}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copy}>
            © {year} BibleFunLand. Made with{' '}
            <StoryIcon name="heart" filled size={16} className={styles.heart} /> for kids and
            families.
          </p>
          <nav aria-label="More" className={styles.smallLinks}>
            {SMALL_LINKS.map((l) =>
              l.isExternal ? (
                <a key={l.to} href={l.to} target="_blank" rel="noopener noreferrer">
                  {l.label}
                </a>
              ) : (
                <Link key={l.to} to={l.to}>
                  {l.label}
                </Link>
              )
            )}
          </nav>
        </div>

        <p className={styles.safety}>
          Moderated community for families. All content rooted in Scripture. We do not sell your
          data. EU users may request data deletion at{' '}
          <a href="mailto:privacy@biblefunland.com">privacy@biblefunland.com</a>. COPPA compliant —
          children under 13 require parental consent.
        </p>
      </div>
    </footer>
  );
}
