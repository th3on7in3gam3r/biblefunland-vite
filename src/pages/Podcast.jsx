import { useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styles from './Podcast.module.css';

/**
 * EPISODES — add new episodes here.
 * audioUrl: direct link to your .mp3 (Supabase Storage, S3, Cloudflare R2, etc.)
 * status: 'released' or 'future' (controls whether it appears in Released or Coming Soon tabs)
 * To add an episode: copy the object, fill in the fields, add it to the TOP of the array.
 */
const EPISODES = [
  {
    id: 3,
    title: 'Topic #3: “The Flood & The Waiting”',
    description: `👉 This episode hits deeper because it teaches patience + trust. 
    Builds tension with perfect storytelling and sets up the rainbow promise beautifully. Relatable for both kids & adults!`,
    date: 'May 2026',
    duration: '—',
    season: 1,
    episode: 3,
    tags: ['The Flood', 'Patience', 'Trust', 'Family'],
    audioUrl: null,
    status: 'future',
    featured: false,
  },
  {
    id: 2,
    title: 'What Was Inside the Ark?',
    description:
      "Building directly from Episode 1, we step inside Noah's completed Ark! Discover the amazing dimensions, the fun and imaginative reality of sharing space with all those animals, and the profound lessons of order, obedience, and God's perfect provision.",
    date: 'April 2026',
    duration: '—',
    season: 1,
    episode: 2,
    tags: ["Noah's Ark", 'Animals', 'Obedience', "God's Provision"],
    audioUrl: 'https://nabthatslot.com/podcast/podcast-2-inside-noah-ark.mp3',
    status: 'released',
    featured: true,
  },
  {
    id: 1,
    title: 'Why Did God Choose Noah?',
    description:
      'Out of everyone in the whole world — why Noah? In this first episode we dig into Genesis 6, explore what made Noah stand out in a corrupt generation, and discover what it means to find favour with God. A question for kids, parents, and everyone in between.',
    date: 'March 2026',
    duration: '18:45',
    season: 1,
    episode: 1,
    tags: ['Genesis', 'Noah', 'Faith', 'Family'],
    audioUrl: 'https://nabthatslot.com/podcast/podcast-1-noah.mp3',
    status: 'released',
    featured: false,
  },
];

function AudioPlayer({ src, title }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('—');

  const togglePlay = (e) => {
    e?.stopPropagation();
    if (!src) return;
    const a = audioRef.current;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().catch((err) => console.error('Playback failed:', err));
      setPlaying(true);
    }
  };

  const onTimeUpdate = () => {
    const a = audioRef.current;
    if (!a.duration) return;
    setProgress((a.currentTime / a.duration) * 100);
    setCurrentTime(fmt(a.currentTime));
  };

  const onLoadedMetadata = () => {
    setDuration(fmt(audioRef.current.duration));
  };

  const onEnded = () => {
    setPlaying(false);
    setProgress(0);
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    if (!src) return;
    const a = audioRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;
    a.currentTime = percent * a.duration;
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return '—';
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.playerContainer}>
      {src && (
        <audio
          ref={audioRef}
          src={src}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onEnded={onEnded}
        />
      )}
      <div className={styles.playerMain}>
        <button
          onClick={togglePlay}
          disabled={!src}
          className={styles.playBtn}
          title={src ? (playing ? 'Pause' : 'Play') : 'Coming Soon'}
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
        <h1 className={styles.title}>BibleFunLand Podcast</h1>
        <p className={styles.subtitle}>
          Faith adventures and bedtime stories for families, kids, and teachers. New episodes every
          Monday.
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
