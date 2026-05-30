import { useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { EPISODES, PODCAST_HOSTS, PODCAST_SHOW } from '../data/podcasts';
import styles from './Podcast.module.css';

function HostsSection() {
  return (
    <section className={styles.hostsSection} aria-label="Podcast hosts">
      <div className={styles.hostsBannerWrap}>
        <img
          src={PODCAST_SHOW.hostsBannerUrl}
          alt={`${PODCAST_HOSTS.names} — ${PODCAST_SHOW.title} podcast hosts`}
          className={styles.hostsBanner}
          width={1200}
          height={675}
          loading="lazy"
          decoding="async"
        />
        <div className={styles.hostsBannerGlow} aria-hidden="true" />
        <span className={styles.hostsMicBadge} aria-hidden="true">
          🎙️
        </span>
      </div>
      <div className={styles.hostsBody}>
        <p className={styles.hostLabel}>{PODCAST_HOSTS.headline}</p>
        <h2 className={styles.hostName}>{PODCAST_HOSTS.names}</h2>
        {PODCAST_HOSTS.hosts?.length > 0 && (
          <ul className={styles.hostList}>
            {PODCAST_HOSTS.hosts.map((host) => (
              <li key={host.name}>
                <span className={styles.hostListName}>{host.name}</span>
                <span className={styles.hostListRole}>{host.role}</span>
              </li>
            ))}
          </ul>
        )}
        <p className={styles.hostTitle}>{PODCAST_HOSTS.title}</p>
        <p className={styles.hostBio}>{PODCAST_HOSTS.bio}</p>
      </div>
    </section>
  );
}

function AudioPlayer({ src, title }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('—');
  const [loadError, setLoadError] = useState(false);

  const fmt = (s) => {
    if (!s || Number.isNaN(s)) return '—';
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = (e) => {
    e?.stopPropagation();
    if (!src || loadError) return;
    const a = audioRef.current;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().catch((err) => {
        console.error('Playback failed:', err);
        setLoadError(true);
        setPlaying(false);
      });
      setPlaying(true);
    }
  };

  const onTimeUpdate = () => {
    const a = audioRef.current;
    if (!a?.duration) return;
    setProgress((a.currentTime / a.duration) * 100);
    setCurrentTime(fmt(a.currentTime));
  };

  const onLoadedMetadata = () => {
    setDuration(fmt(audioRef.current.duration));
    setLoadError(false);
  };

  const onAudioError = () => {
    setLoadError(true);
    setPlaying(false);
    setProgress(0);
  };

  const onEnded = () => {
    setPlaying(false);
    setProgress(0);
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    if (!src || loadError) return;
    const a = audioRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;
    a.currentTime = percent * a.duration;
  };

  return (
    <div className={styles.playerContainer}>
      {src && (
        <audio
          ref={audioRef}
          src={src}
          preload="metadata"
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onError={onAudioError}
          onEnded={onEnded}
        />
      )}
      <div className={styles.playerMain}>
        <button
          onClick={togglePlay}
          disabled={!src || loadError}
          className={styles.playBtn}
          title={src ? (playing ? 'Pause' : 'Play') : 'Coming Soon'}
          aria-label={src ? (playing ? 'Pause episode' : 'Play episode') : 'Episode coming soon'}
        >
          {playing ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <rect x="5" y="4" width="4" height="16" rx="1.5" />
              <rect x="15" y="4" width="4" height="16" rx="1.5" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 3 }}>
              <path d="M6.5 4v16l14-8z" />
            </svg>
          )}
        </button>
        <div className={styles.playerInner}>
          <div className={styles.playerHeadline}>{title}</div>
          <div className={styles.progressBar} onClick={handleSeek}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <div className={styles.timeInfo}>
            <span>{currentTime}</span>
            <span>{duration}</span>
          </div>
        </div>
      </div>
      {!src && (
        <div className={styles.comingSoonText}>🎙️ Episode coming soon to your favorite player!</div>
      )}
      {src && loadError && (
        <div className={styles.audioErrorText}>
          ⚠️ Audio couldn&apos;t load. If you have the file, add it to <code>public/podcast/</code> and
          update the episode URL in <code>src/data/podcasts.js</code>.
        </div>
      )}
    </div>
  );
}

function EpisodeCard({ ep, featured, onClick }) {
  if (featured) {
    return (
      <div className={styles.featuredCard}>
        <div className={styles.featuredBody}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
            <span className={styles.latestBadge}>
              <span className={styles.latestDot} />
              Featured Episode
            </span>
            <span className={styles.epMeta}>
              Season {ep.season} · Ep {ep.episode} · {ep.date}
            </span>
          </div>
          <h2 className={styles.epTitle}>{ep.title}</h2>
          <p className={styles.epDesc}>{ep.description}</p>
          <div className={styles.tags}>
            {ep.tags.map((t) => (
              <span key={t} className={styles.tag}>
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className={styles.featuredFooter}>
          <AudioPlayer src={ep.audioUrl} title={ep.title} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.standardCard} onClick={onClick}>
      <div className={styles.cardIcon}>🎙️</div>
      <div className={styles.cardContent}>
        <div className={styles.cardMeta}>
          S{ep.season} · E{ep.episode} · {ep.date}
        </div>
        <h3 className={styles.cardTitle}>{ep.title}</h3>
        <p className={styles.cardDesc}>
          {ep.description.substring(0, 150)}
          {ep.description.length > 150 ? '...' : ''}
        </p>
        <AudioPlayer src={ep.audioUrl} title={ep.title} />
      </div>
    </div>
  );
}

export default function Podcast() {
  const [filterStatus, setFilterStatus] = useState('released');
  const [activeId, setActiveId] = useState(() => {
    const featured = EPISODES.find((e) => e.featured && e.status === 'released');
    return featured?.id || EPISODES.find((e) => e.status === 'released')?.id || EPISODES[0]?.id;
  });

  const releasedEpisodes = useMemo(() => EPISODES.filter((e) => e.status === 'released'), []);
  const futureEpisodes = useMemo(() => EPISODES.filter((e) => e.status === 'future'), []);

  const displayEpisodes = filterStatus === 'released' ? releasedEpisodes : futureEpisodes;
  const heroEpisode = displayEpisodes.find((e) => e.id === activeId) || displayEpisodes[0];
  const rest = displayEpisodes.filter((e) => e.id !== heroEpisode?.id);

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.heroBlob} />
        <div className={styles.heroIcon}>🎙️</div>
        <h1 className={styles.title}>{PODCAST_SHOW.title}</h1>
        <p className={styles.showSubtitle}>{PODCAST_SHOW.subtitle}</p>
        <p className={styles.subtitle}>
          {PODCAST_SHOW.tagline} {PODCAST_SHOW.schedule}
        </p>
        <div className={styles.platforms}>
          {['🍎 Apple Podcasts', '🎵 Spotify', '📻 Google Podcasts'].map((p, i) => (
            <span key={i} className={styles.platformTag}>
              {p} — Coming Soon
            </span>
          ))}
        </div>
      </div>

      <div className={styles.content}>
        <HostsSection />

        <nav className={styles.tabs}>
          {[
            { key: 'released', label: 'Released', count: releasedEpisodes.length, icon: '▶' },
            { key: 'future', label: 'Coming Soon', count: futureEpisodes.length, icon: '⏰' },
          ].map((tab) => {
            const isActive = filterStatus === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setFilterStatus(tab.key);
                  const firstEp = tab.key === 'released' ? releasedEpisodes[0] : futureEpisodes[0];
                  if (firstEp) setActiveId(firstEp.id);
                }}
                className={`${styles.tabBtn} ${isActive ? styles.tabBtnActive : ''}`}
              >
                <span>{tab.icon}</span>
                {tab.label}
                <span className={styles.tabCount}>{tab.count}</span>
              </button>
            );
          })}
        </nav>

        {displayEpisodes.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🎙️</div>
            <p>More stories are being recorded! Stay tuned.</p>
          </div>
        ) : (
          <>
            {heroEpisode && <EpisodeCard ep={heroEpisode} featured />}
            {rest.map((ep) => (
              <EpisodeCard key={ep.id} ep={ep} onClick={() => setActiveId(ep.id)} />
            ))}
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Link to="/" className={styles.backLink}>
            ← Back to BibleFunLand
          </Link>
        </div>
      </div>
    </div>
  );
}
