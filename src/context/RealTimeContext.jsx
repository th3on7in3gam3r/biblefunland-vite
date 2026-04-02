/**
 * RealTimeContext — lightweight polling-based real-time for BibleFunLand
 * Polls key endpoints every N seconds and broadcasts updates to subscribers.
 * No WebSocket server needed — works on any host.
 *
 * Backend health check runs first — if server is down, polling is deferred
 * and retried every 30s to avoid console spam.
 */
import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useKidsMode } from './KidsModeContext';

const RealTimeContext = createContext(null);
import { API_URL as API, HAS_BACKEND } from '../lib/api-config';

const INTERVALS = {
  prayers: 8000,
  leaderboard: 15000,
  family: 10000,
  streak: 30000,
  healthCheck: 30000, // retry when server is down
};

export function RealTimeProvider({ children }) {
  const { user } = useAuth();
  const { kidsMode } = useKidsMode();

  const [serverUp, setServerUp] = useState(false);
  const [prayers, setPrayers] = useState({ items: [], total: 0, live: false });
  const [leaderboard, setLeaderboard] = useState({
    streaks: [],
    badges: [],
    trivia: [],
    live: false,
  });
  const [familyProgress, setFamilyProgress] = useState({
    members: [],
    challenge: null,
    live: false,
  });
  const [liveStreak, setLiveStreak] = useState(null);
  const [pointsPopup, setPointsPopup] = useState(null);

  const timers = useRef({});
  const pollingStarted = useRef(false);

  // ── Health check — ping the server root before starting polls ─────────────
  const checkHealth = useCallback(async () => {
    // If no backend is expected in dev, don't even try
    if (import.meta.env.DEV && !HAS_BACKEND) return false;

    try {
      const res = await fetch(`${API}/`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        setServerUp(true);
        return true;
      }
    } catch {
      // server not reachable — stay quiet
    }
    setServerUp(false);
    return false;
  }, []);

  // ── Poll prayers ──────────────────────────────────────────────────────────
  const pollPrayers = useCallback(async () => {
    if (!serverUp) return;
    try {
      const res = await fetch(`${API}/api/prayers/live?limit=20`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) {
        if (res.status >= 500) setServerUp(false);
        return;
      }
      const data = await res.json();
      setPrayers({ items: data.prayers || [], total: data.total || 0, live: true });
    } catch {
      setServerUp(false);
    }
  }, [serverUp]);

  // ── Poll leaderboard ──────────────────────────────────────────────────────
  const pollLeaderboard = useCallback(async () => {
    if (!serverUp) return;
    try {
      const res = await fetch(
        `${API}/api/leaderboard/streaks${user?.id ? `?userId=${user.id}` : ''}`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (!res.ok) {
        if (res.status >= 500) setServerUp(false);
        return;
      }
      const data = await res.json();
      setLeaderboard((prev) => ({ ...prev, streaks: data.entries || [], live: true }));
    } catch {
      setServerUp(false);
    }
  }, [user?.id, serverUp]);

  // ── Poll family progress ──────────────────────────────────────────────────
  const pollFamily = useCallback(async () => {
    if (!user?.id || !serverUp) return;
    try {
      const res = await fetch(`${API}/api/family/live-progress`, {
        headers: { Authorization: `Bearer ${user.id}` },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) {
        if (res.status >= 500) setServerUp(false);
        return;
      }
      const data = await res.json();
      setFamilyProgress({
        members: data.members || [],
        challenge: data.challenge || null,
        live: true,
      });
    } catch {
      setServerUp(false);
    }
  }, [user?.id, serverUp]);

  // ── Poll streak ───────────────────────────────────────────────────────────
  const pollStreak = useCallback(async () => {
    if (!user?.id || !serverUp) return;
    try {
      const res = await fetch(`${API}/api/db`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sql: 'SELECT streak FROM streaks WHERE user_id = ? LIMIT 1',
          args: [user.id],
        }),
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) {
        if (res.status >= 500) setServerUp(false);
        return;
      }
      const data = await res.json();
      const streak = data?.results?.[0]?.streak ?? data?.data?.[0]?.streak;
      if (streak !== undefined) setLiveStreak(Number(streak));
    } catch {
      setServerUp(false);
    }
  }, [user?.id, serverUp]);

  // ── Start/stop helpers ────────────────────────────────────────────────────
  function startPolling(key, fn, interval) {
    if (timers.current[key]) clearInterval(timers.current[key]);
    fn();
    timers.current[key] = setInterval(fn, interval);
  }

  function stopAll() {
    Object.keys(timers.current).forEach((k) => {
      clearInterval(timers.current[k]);
      delete timers.current[k];
    });
    pollingStarted.current = false;
  }

  // ── Boot: health check first, then start polls ────────────────────────────
  useEffect(() => {
    let healthTimer;

    async function boot() {
      // Priority 1: Check if we even want to connect
      if (import.meta.env.DEV && !HAS_BACKEND) {
        console.log('📡 RealTime: Backend connectivity disabled via VITE_HAS_BACKEND');
        return;
      }

      await checkHealth();
    }

    boot();

    // Health check loop
    healthTimer = setInterval(async () => {
      if (!serverUp) {
        await checkHealth();
      }
    }, INTERVALS.healthCheck);

    return () => clearInterval(healthTimer);
  }, [checkHealth, serverUp]);

  useEffect(() => {
    if (serverUp && !pollingStarted.current) {
      pollingStarted.current = true;
      startPolling('prayers', pollPrayers, INTERVALS.prayers);
      startPolling('leaderboard', pollLeaderboard, INTERVALS.leaderboard);
      if (user?.id) {
        startPolling('family', pollFamily, INTERVALS.family);
        startPolling('streak', pollStreak, INTERVALS.streak);
      }
    } else if (!serverUp) {
      stopAll();
    }
  }, [serverUp, user?.id, pollPrayers, pollLeaderboard, pollFamily, pollStreak]);

  // ── Points popup ──────────────────────────────────────────────────────────
  const showPoints = useCallback((points, label = '', x = null, y = null) => {
    setPointsPopup({ points, label, x, y, id: Date.now() });
    setTimeout(() => setPointsPopup(null), 2000);
  }, []);

  // ── Manual refresh ────────────────────────────────────────────────────────
  const refresh = useCallback(
    (key) => {
      if (!serverUp) return;
      if (key === 'prayers') pollPrayers();
      if (key === 'leaderboard') pollLeaderboard();
      if (key === 'family') pollFamily();
      if (key === 'streak') pollStreak();
    },
    [serverUp, pollPrayers, pollLeaderboard, pollFamily, pollStreak]
  );

  return (
    <RealTimeContext.Provider
      value={{
        prayers,
        leaderboard,
        familyProgress,
        liveStreak,
        pointsPopup,
        showPoints,
        refresh,
        kidsMode,
        serverUp,
      }}
    >
      {children}
      {pointsPopup && <PointsPopup {...pointsPopup} kidsMode={kidsMode} />}
    </RealTimeContext.Provider>
  );
}

export const useRealTime = () => {
  const ctx = useContext(RealTimeContext);
  if (!ctx)
    return {
      prayers: { items: [], total: 0 },
      leaderboard: { streaks: [] },
      familyProgress: { members: [] },
      liveStreak: null,
      serverUp: false,
      showPoints: () => {},
      refresh: () => {},
    };
  return ctx;
};

// ── Points popup ──────────────────────────────────────────────────────────────
function PointsPopup({ points, label, kidsMode }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 80,
        right: 24,
        zIndex: 9999,
        background: kidsMode
          ? 'linear-gradient(135deg,#FBBF24,#F97316)'
          : 'linear-gradient(135deg,#8B5CF6,#6366F1)',
        color: 'white',
        borderRadius: 16,
        padding: '12px 20px',
        fontFamily: "'Baloo 2',cursive",
        fontWeight: 800,
        fontSize: kidsMode ? '1.2rem' : '1rem',
        boxShadow: '0 8px 32px rgba(0,0,0,.25)',
        animation: 'pointsFloat 2s ease forwards',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      {kidsMode ? '🎉' : '⭐'} +{points}{' '}
      {label && <span style={{ fontSize: '.8em', opacity: 0.85 }}>{label}</span>}
      <style>{`@keyframes pointsFloat{0%{opacity:0;transform:translateY(20px) scale(.8)}20%{opacity:1;transform:translateY(0) scale(1.1)}80%{opacity:1;transform:translateY(-10px) scale(1)}100%{opacity:0;transform:translateY(-30px) scale(.9)}}`}</style>
    </div>
  );
}
