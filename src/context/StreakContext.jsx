import { createContext, useContext, useEffect, useState } from 'react';
import { getStreak, upsertStreak } from '../lib/db';
import { useAuth } from './AuthContext';

const StreakContext = createContext(null);

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function getLocalState() {
  try {
    return JSON.parse(localStorage.getItem('bfl_streak') ?? '{}');
  } catch {
    return {};
  }
}

function setLocalState(data) {
  localStorage.setItem('bfl_streak', JSON.stringify(data));
}

export function StreakProvider({ children }) {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [readDays, setReadDays] = useState([]);
  const [checkedToday, setCheckedToday] = useState(false);
  const [checkinCount, setCheckinCount] = useState(0);

  // Track last_checkin separately so checkIn can use it without re-fetching
  const [lastCheckin, setLastCheckin] = useState(null);

  // Load from Turso (if logged in) or localStorage
  useEffect(() => {
    if (user) {
      getStreak(user.id)
        .then(({ data }) => {
          if (data) {
            setStreak(data.streak ?? 0);
            setReadDays(data.read_days ? data.read_days.split(',').filter(Boolean) : []);
            setCheckinCount(data.checkin_count ?? 0);
            setLastCheckin(data.last_checkin ?? null);
            setCheckedToday(data.last_checkin === todayStr());
          }
        })
        .catch(() => {});
    } else {
      const s = getLocalState();
      setStreak(s.streak ?? 0);
      setReadDays(s.readDays ?? []);
      setCheckinCount(s.checkinCount ?? 0);
      setLastCheckin(s.lastCheckin ?? null);
      setCheckedToday(s.lastCheckin === todayStr());
    }
  }, [user]);

  const checkIn = async () => {
    if (checkedToday) return;
    const today = todayStr();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Use React state (loaded from DB for logged-in users) — not localStorage
    const isConsecutive = lastCheckin === yesterdayStr;
    const newStreak = isConsecutive ? streak + 1 : 1;
    const newReadDays = [...readDays, today].filter((d, i, arr) => arr.indexOf(d) === i);
    const newCheckinCount = checkinCount + 1;

    setStreak(newStreak);
    setReadDays(newReadDays);
    setCheckinCount(newCheckinCount);
    setCheckedToday(true);
    setLastCheckin(today);

    // Always keep localStorage in sync as a fallback
    setLocalState({
      streak: newStreak,
      lastCheckin: today,
      readDays: newReadDays,
      checkinCount: newCheckinCount,
    });

    if (user) {
      await upsertStreak(user.id, {
        streak: newStreak,
        last_checkin: today,
        read_days: newReadDays.join(','),
        checkin_count: newCheckinCount,
      }).catch(() => {});
    }

    return newStreak;
  };

  const toggleDay = async (dateStr) => {
    const isRead = readDays.includes(dateStr);
    const newReadDays = isRead ? readDays.filter((d) => d !== dateStr) : [...readDays, dateStr];
    setReadDays(newReadDays);
    const updated = { ...getLocalState(), readDays: newReadDays };
    setLocalState(updated);
    if (user) await upsertStreak(user.id, { read_days: newReadDays.join(',') }).catch(() => {});
  };

  return (
    <StreakContext.Provider
      value={{
        streak,
        readDays,
        checkedToday,
        checkinCount,
        checkIn,
        toggleDay,
      }}
    >
      {children}
    </StreakContext.Provider>
  );
}

export const useStreak = () => useContext(StreakContext);
