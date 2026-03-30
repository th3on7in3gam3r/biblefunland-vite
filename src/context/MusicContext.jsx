import { createContext, useContext, useRef, useState, useEffect } from 'react';

export const TRACKS = [
  {
    title: 'Amazing Grace (My Chains Are Gone)',
    artist: 'Chris Tomlin',
    duration: '4:21',
    // Replace with real MP3 paths from your public/ folder or a CDN
    src: '/music/amazing-grace.mp3',
  },
  {
    title: 'How Great Is Our God',
    artist: 'Chris Tomlin',
    duration: '4:52',
    src: '/music/how-great-is-our-god.mp3',
  },
  {
    title: 'Oceans (Where Feet May Fail)',
    artist: 'Hillsong United',
    duration: '8:57',
    src: '/music/oceans.mp3',
  },
  {
    title: '10,000 Reasons (Bless the Lord)',
    artist: 'Matt Redman',
    duration: '4:16',
    src: '/music/10000-reasons.mp3',
  },
  {
    title: 'Good Good Father',
    artist: 'Chris Tomlin',
    duration: '4:07',
    src: '/music/good-good-father.mp3',
  },
];

const MusicContext = createContext(null);

export function MusicProvider({ children }) {
  const audioRef = useRef(new Audio());
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [expanded, setExpanded] = useState(false);

  const audio = audioRef.current;

  useEffect(() => {
    audio.src = TRACKS[trackIndex].src;
    audio.volume = volume;
    audio.load();

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => nextTrack();

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
    };
  }, [trackIndex]);

  useEffect(() => {
    audio.volume = volume;
  }, [volume]);

  const play = async () => {
    try {
      await audio.play();
      setIsPlaying(true);
    } catch (e) {
      // Autoplay blocked by browser — user must interact first
      console.warn('Audio play blocked:', e.message);
    }
  };

  const pause = () => {
    audio.pause();
    setIsPlaying(false);
  };

  const togglePlay = () => (isPlaying ? pause() : play());

  const nextTrack = () => {
    const next = (trackIndex + 1) % TRACKS.length;
    setTrackIndex(next);
    if (isPlaying) setTimeout(() => play(), 100);
  };

  const prevTrack = () => {
    const prev = (trackIndex - 1 + TRACKS.length) % TRACKS.length;
    setTrackIndex(prev);
    if (isPlaying) setTimeout(() => play(), 100);
  };

  const seek = (pct) => {
    if (!duration) return;
    audio.currentTime = (pct / 100) * duration;
  };

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <MusicContext.Provider
      value={{
        tracks: TRACKS,
        trackIndex,
        setTrackIndex,
        isPlaying,
        play,
        pause,
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
        currentTrack: TRACKS[trackIndex],
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export const useMusic = () => useContext(MusicContext);
