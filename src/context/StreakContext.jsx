import { createContext, useContext, useEffect, useState } from 'react';
import { getStreak, upsertStreak } from '../lib/db';
import { useAuth } from './AuthContext';
import { useBadges } from './BadgeContext';

const StreakContext = createContext(null);

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function streakStorageKey(userId) {
  return userId ? `bfl_streak_${userId}` : 'bfl_streak_guest';
}

function getLocalState(userId) {
  try {
    return JSON.parse(localStorage.getItem(streakStorageKey(userId)) ?? '{}');
  } catch {
    return {};
  }
}

function setLocalState(userId, data) {
  localStorage.setItem(streakStorageKey(userId), JSON.stringify(data));
}

function applyLocalState(setters, userId) {
  const s = getLocalState(userId);
  setters.setStreak(s.streak ?? 0);
  setters.setReadDays(s.readDays ?? []);
  setters.setCheckinCount(s.checkinCount ?? 0);
  setters.setLastCheckin(s.lastCheckin ?? null);
  setters.setCheckedToday(s.lastCheckin === todayStr());
}

function clearState(setters) {
  setters.setStreak(0);
  setters.setReadDays([]);
  setters.setCheckinCount(0);
  setters.setLastCheckin(null);
  setters.setCheckedToday(false);
}

export function StreakProvider({ children }) {
  const { user } = useAuth();
  const { awardBadge, hasBadge } = useBadges();
  const [streak, setStreak] = useState(0);
  const [readDays, setReadDays] = useState([]);
  const [checkedToday, setCheckedToday] = useState(false);
  const [checkinCount, setCheckinCount] = useState(0);
  const [lastCheckin, setLastCheckin] = useState(null);

  const setters = {
    setStreak,
    setReadDays,
    setCheckinCount,
    setLastCheckin,
    setCheckedToday,
  };

  // Load per-account streak data — reset immediately on account switch
  useEffect(() => {
    const userId = user?.id ?? null;
    let cancelled = false;

    clearState(setters);

    if (userId) {
      getStreak(userId)
        .then(({ data }) => {
          if (cancelled) return;

          if (data) {
            setStreak(data.streak ?? 0);
            setReadDays(data.read_days ? data.read_days.split(',').filter(Boolean) : []);
            setCheckinCount(data.checkin_count ?? 0);
            setLastCheckin(data.last_checkin ?? null);
            setCheckedToday(data.last_checkin === todayStr());

            setLocalState(userId, {
              streak: data.streak ?? 0,
              lastCheckin: data.last_checkin ?? null,
              readDays: data.read_days ? data.read_days.split(',').filter(Boolean) : [],
              checkinCount: data.checkin_count ?? 0,
            });
          } else {
            // New account with no server record — blank calendar (not another user's cache)
            clearState(setters);
            setLocalState(userId, {
              streak: 0,
              lastCheckin: null,
              readDays: [],
              checkinCount: 0,
            });
          }
        })
        .catch(() => {
          if (cancelled) return;
          // Offline fallback: only this user's scoped local cache
          applyLocalState(setters, userId);
        });
    } else {
      applyLocalState(setters, null);
    }

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const checkIn = async () => {
    if (checkedToday) return;
    const today = todayStr();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const userId = user?.id ?? null;

    const isConsecutive = lastCheckin === yesterdayStr;
    const newStreak = isConsecutive ? streak + 1 : 1;
    const newReadDays = [...readDays, today].filter((d, i, arr) => arr.indexOf(d) === i);
    const newCheckinCount = checkinCount + 1;

    setStreak(newStreak);
    setReadDays(newReadDays);
    setCheckinCount(newCheckinCount);
    setCheckedToday(true);
    setLastCheckin(today);

    setLocalState(userId, {
      streak: newStreak,
      lastCheckin: today,
      readDays: newReadDays,
      checkinCount: newCheckinCount,
    });

    if (userId) {
      await upsertStreak(userId, {
        streak: newStreak,
        last_checkin: today,
        read_days: newReadDays.join(','),
        checkin_count: newCheckinCount,
      }).catch(() => {});
    }

    if (newStreak >= 1 && !hasBadge('streak_1')) awardBadge('streak_1');
    if (newStreak >= 3 && !hasBadge('streak_3')) awardBadge('streak_3');
    if (newStreak >= 7 && !hasBadge('streak_7')) awardBadge('streak_7');
    if (newStreak >= 30 && !hasBadge('streak_30')) awardBadge('streak_30');
    if (newStreak >= 100 && !hasBadge('streak_100')) awardBadge('streak_100');

    return newStreak;
  };

  const toggleDay = async (dateStr) => {
    const userId = user?.id ?? null;
    const isRead = readDays.includes(dateStr);
    const newReadDays = isRead ? readDays.filter((d) => d !== dateStr) : [...readDays, dateStr];
    setReadDays(newReadDays);
    setLocalState(userId, { ...getLocalState(userId), readDays: newReadDays });
    if (userId) await upsertStreak(userId, { read_days: newReadDays.join(',') }).catch(() => {});
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
