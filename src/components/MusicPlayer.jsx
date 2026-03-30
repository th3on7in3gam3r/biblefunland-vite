import { useMusic } from '../context/MusicContext';
import styles from './MusicPlayer.module.css';

export default function MusicPlayer() {
  const {
    tracks,
    trackIndex,
    setTrackIndex,
    isPlaying,
    togglePlay,
    currentTime,
    duration,
    seek,
    volume,
    setVolume,
    expanded,
    setExpanded,
    nextTrack,
    prevTrack,
    formatTime,
    currentTrack,
  } = useMusic();

  const progress = duration ? (currentTime / duration) * 100 : 0;

  function handleSeek(e) {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    seek(Math.max(0, Math.min(100, pct)));
  }

  return (
    <div className={`${styles.player} ${expanded ? styles.expanded : ''}`}>
      {/* Collapsed bubble */}
      {!expanded && (
        <button
          className={`${styles.bubble} ${isPlaying ? styles.playing : ''}`}
          onClick={() => setExpanded(true)}
          title="Open music player"
          aria-label="Open worship music player"
        >
          🎵
          <span className={styles.pulseRing} />
        </button>
      )}

      {/* Expanded panel */}
      {expanded && (
        <div className={styles.panel}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <span className={styles.headerIcon}>🎵</span>
              <div>
                <div className={styles.headerTitle}>Worship Music</div>
                <div className={styles.headerSub}>{isPlaying ? '▶ Now playing' : 'Paused'}</div>
              </div>
            </div>
            <button
              className={styles.collapseBtn}
              onClick={() => setExpanded(false)}
              aria-label="Minimize player"
            >
              ▼
            </button>
          </div>

          {/* Now playing */}
          <div className={styles.nowPlaying}>
            <div className={styles.trackName}>{currentTrack.title}</div>
            <div className={styles.artist}>{currentTrack.artist}</div>

            {/* Progress */}
            <div className={styles.progressWrap}>
              <div
                className={styles.progressBar}
                onClick={handleSeek}
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
              <div className={styles.timeRow}>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration) || currentTrack.duration}</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className={styles.controls}>
            <button className={styles.ctrlBtn} onClick={prevTrack} aria-label="Previous track">
              ⏮
            </button>
            <button
              className={styles.playBtn}
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button className={styles.ctrlBtn} onClick={nextTrack} aria-label="Next track">
              ⏭
            </button>
          </div>

          {/* Volume */}
          <div className={styles.volumeRow}>
            <span className={styles.volIcon}>🔈</span>
            <input
              type="range"
              className={styles.volSlider}
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              aria-label="Volume"
            />
            <span className={styles.volIcon}>🔊</span>
          </div>

          {/* Track list */}
          <div className={styles.tracklist}>
            {tracks.map((t, i) => (
              <button
                key={i}
                className={`${styles.track} ${i === trackIndex ? styles.activeTrack : ''}`}
                onClick={() => {
                  setTrackIndex(i);
                  if (!isPlaying) togglePlay();
                }}
              >
                <span className={styles.trackNum}>
                  {i === trackIndex && isPlaying ? <EqAnimation /> : i + 1}
                </span>
                <span className={styles.trackInfo}>
                  <span className={styles.trackTitle}>{t.title}</span>
                  <span className={styles.trackArtist}>{t.artist}</span>
                </span>
                <span className={styles.trackDur}>{t.duration}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EqAnimation() {
  return (
    <span className={styles.eq} aria-label="Now playing">
      <span className={styles.eqBar} style={{ '--delay': '0s', '--h': '6px' }} />
      <span className={styles.eqBar} style={{ '--delay': '.15s', '--h': '12px' }} />
      <span className={styles.eqBar} style={{ '--delay': '.3s', '--h': '9px' }} />
    </span>
  );
}
