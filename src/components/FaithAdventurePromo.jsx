import { Link } from 'react-router-dom';
import { PODCAST_HOSTS, PODCAST_SHOW } from '../data/podcasts';
import styles from './FaithAdventurePromo.module.css';

/** Family-focused promo for the Faith & Adventure podcast. */
export default function FaithAdventurePromo() {
  return (
    <Link to="/podcast" className={styles.promo}>
      <div className={styles.media}>
        <img
          src={PODCAST_SHOW.hostsBannerUrl}
          alt={`${PODCAST_HOSTS.names} — ${PODCAST_SHOW.title}`}
          className={styles.image}
          loading="lazy"
        />
        <span className={styles.badge}>🎙️ New</span>
      </div>

      <div className={styles.body}>
        <p className={styles.eyebrow}>{PODCAST_SHOW.title}</p>
        <h3 className={styles.title}>{PODCAST_SHOW.subtitle}</h3>
        <p className={styles.desc}>
          Hosted by {PODCAST_HOSTS.names} — Noah&apos;s Ark episodes streaming free for car rides,
          bedtime, and Sunday school.
        </p>
        <span className={styles.cta}>Listen on BibleFunLand →</span>
      </div>
    </Link>
  );
}
