import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useBadges } from '../context/BadgeContext';
import { useKidsMode } from '../context/KidsModeContext';

// ── Default habits ────────────────────────────────────────────────────────────
const DEFAULT_HABITS = [
  { id: 'prayer',      emoji: '🙏', label: 'Prayer',        verse: 'Philippians 4:6',  color: '#8B5CF6' },
  { id: 'bible',       emoji: '📖', label: 'Bible Reading', verse: 'Psalm 119:105',    color: '#3B82F6' },
  { id: 'gratitude',   emoji: '🌟', label: 'Gratitude',     verse: '1 Thess 5:18',     color: '#F59E0B' },
  { id: 'worship',     emoji: '🎵', label: 'Worship',       verse: 'Psalm 100:2',      color: '#EC4899' },
  { id: 'kindness',    emoji: '💛', label: 'Kindness',      verse: 'Ephesians 4:32',   color: '#10B981' },
  { id: 'memorize',    emoji: '🧠', label: 'Memorization',  verse: 'Psalm 119:11',     color: '#6366F1' },
  { id: 'fasting',     emoji: '✨', label: 'Fasting/Quiet', verse: 'Matthew 6:6',      color: '#14B8A6' },
  { id: 'serve',       emoji: '🤝', label: 'Serve Others',  verse: 'Mark 10:45',       color: '#F97316' },
];

const STREAK_VERSES = [
  { streak: 1,  text: '"Well done, good and faithful servant!"', ref: 'Matthew 25:21' },
  { streak: 3,  text: '"Be strong and courageous. Do not be afraid."', ref: 'Joshua 1:9' },
  { streak: 7,  text: '"His mercies are new every morning."', ref: 'Lamentations 3:23' },
  { streak: 14, text: '"I can do all things through Christ who strengthens me."', ref: 'Philippians 4:13' },
  { streak: 30, text: '"Blessed is the one who perseveres under trial."', ref: 'James 1:12' },
];

function getTodayKey() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

function getVerseForStreak(streak) {
  const match = [...STREAK_VERSES].reverse().find(v => streak >= v.streak);
  return match || STREAK_VERSES[0];
}

function loadState() {
  try {
    return JSON.parse(localStorage.getItem('bfl_habits') || '{}');
  } catch { return {}; }
}

function saveState(state) {
  localStorage.setItem('bfl_habits', JSON.stringify(state));
}

export default function DailyHabits() {
  const { user } = useAuth();
  const { awardBadge, hasBadge } = useBadges();
  const { kidsMode } = useKidsMode();

  const today = getTodayKey();

  const [state, setState] = useState(() => {
    const s = loadState();
    return {
      checkedToday: s.checkedToday || {},   // { habitId: true }
      lastDate: s.lastDate || null,
      streak: s.streak || 0,
      totalDays: s.totalDays || 0,
      customHabits: s.customHabits || [],   // [{ id, emoji, label, color }]
      history: s.history || {},             // { 'YYYY-MM-DD': [habitIds] }
    };
  });

  const [newHabit, setNewHabit] = useState('');
  const [addingHabit, setAddingHabit] = useState(false);
  const [celebrated, setCelebrated] = useState(false);

  // Reset check-ins if it's a new day
  useEffect(() => {
    if (state.lastDate && state.lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yKey = yesterday.toISOString().split('T')[0];
      const wasYesterday = state.lastDate === yKey;

      setState(prev => {
        const next = {
          ...prev,
          checkedToday: {},
          lastDate: today,
          streak: wasYesterday ? prev.streak : 0,
        };
        saveState(next);
        return next;
      });
    }
  }, [today]);

  const allHabits = [...DEFAULT_HABITS, ...state.customHabits];
  const checkedCount = Object.keys(state.checkedToday).length;
  const allDone = checkedCount === allHabits.length;

  function toggleHabit(habitId) {
    setState(prev => {
      const alreadyChecked = prev.checkedToday[habitId];
      const nextChecked = { ...prev.checkedToday };

      if (alreadyChecked) {
        delete nextChecked[habitId];
      } else {
        nextChecked[habitId] = true;
      }

      const newCount = Object.keys(nextChecked).length;
      const justCompletedAll = newCount === allHabits.length && !alreadyChecked;

      // Update streak when all habits done for the day
      let newStreak = prev.streak;
      let newTotalDays = prev.totalDays;
      if (justCompletedAll) {
        newStreak = prev.lastDate === today ? prev.streak : prev.streak + 1;
        newTotalDays = prev.totalDays + 1;
        setCelebrated(true);
        setTimeout(() => setCelebrated(false), 3000);
      }

      // Save history
      const history = { ...prev.history, [today]: Object.keys(nextChecked) };

      const next = {
        ...prev,
        checkedToday: nextChecked,
        lastDate: today,
        streak: newStreak,
        totalDays: newTotalDays,
        history,
      };
      saveState(next);

      // Award badges
      if (newStreak >= 7 && !hasBadge('habit_week')) awardBadge('habit_week');
      if (newStreak >= 30 && !hasBadge('habit_month')) awardBadge('habit_month');
      if (newTotalDays >= 1 && !hasBadge('habit_first')) awardBadge('habit_first');

      return next;
    });
  }

  function addCustomHabit() {
    if (!newHabit.trim() || state.customHabits.length >= 3) return;
    const habit = {
      id: `custom_${Date.now()}`,
      emoji: '⭐',
      label: newHabit.trim(),
      color: '#8B5CF6',
    };
    setState(prev => {
      const next = { ...prev, customHabits: [...prev.customHabits, habit] };
      saveState(next);
      return next;
    });
    setNewHabit('');
    setAddingHabit(false);
  }

  function removeCustomHabit(id) {
    setState(prev => {
      const next = { ...prev, customHabits: prev.customHabits.filter(h => h.id !== id) };
      saveState(next);
      return next;
    });
  }

  const verseData = getVerseForStreak(state.streak);
  const progress = allHabits.length > 0 ? (checkedCount / allHabits.length) * 100 : 0;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg,#064E3B 0%,#065F46 40%,#1E1B4B 100%)',
        padding: kidsMode ? '48px 24px 40px' : '56px 24px 44px',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {[['#10B981','5%','15%'],['#6366F1','88%','20%'],['#FCD34D','45%','80%']].map(([c,l,t],i) => (
          <div key={i} style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', background: `radial-gradient(circle,${c}18 0%,transparent 70%)`, left: l, top: t, pointerEvents: 'none' }} />
        ))}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: kidsMode ? '3.5rem' : '2.8rem', marginBottom: 10, filter: 'drop-shadow(0 4px 16px rgba(16,185,129,0.5))' }}>🌱</div>
          <h1 style={{
            fontFamily: "'Baloo 2', cursive", fontWeight: 800,
            fontSize: kidsMode ? 'clamp(1.8rem,5vw,2.8rem)' : 'clamp(1.6rem,4vw,2.4rem)',
            background: 'linear-gradient(90deg,#6EE7B7,#A5B4FC,#FCD34D)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', marginBottom: 8,
          }}>
            {kidsMode ? '🌟 Daily Faith Habits!' : 'Daily Faith Habits'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: kidsMode ? '.95rem' : '.88rem', maxWidth: 440, margin: '0 auto 16px', lineHeight: 1.7 }}>
            Small daily steps build a strong faith. Check off your habits each day and watch your streak grow.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              [`🔥 ${state.streak}`, 'Day Streak'],
              [`✅ ${checkedCount}/${allHabits.length}`, 'Today'],
              [`📅 ${state.totalDays}`, 'Total Days'],
            ].map(([v, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: '1.3rem', color: '#6EE7B7', lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: '.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* Verse card */}
        <div style={{
          background: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)',
          border: '1.5px solid #DDD6FE', borderRadius: 16,
          padding: '14px 18px', marginBottom: 24,
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>📜</span>
          <div>
            <p style={{ fontSize: kidsMode ? '.9rem' : '.82rem', fontStyle: 'italic', color: '#4C1D95', fontWeight: 600, margin: '0 0 3px', lineHeight: 1.6 }}>
              "{verseData.text}"
            </p>
            <span style={{ fontSize: '.7rem', fontWeight: 700, color: '#7C3AED' }}>{verseData.ref}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Today's Progress</span>
            <span style={{ fontSize: '.75rem', fontWeight: 800, color: '#10B981' }}>{Math.round(progress)}%</span>
          </div>
          <div style={{ height: 10, background: 'var(--bg3)', borderRadius: 99, overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg,#10B981,#6366F1)' }}
            />
          </div>
        </div>

        {/* Celebration */}
        <AnimatePresence>
          {celebrated && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                background: 'linear-gradient(135deg,#ECFDF5,#D1FAE5)',
                border: '2px solid #6EE7B7', borderRadius: 16,
                padding: '14px 18px', marginBottom: 20, textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: 4 }}>🎉</div>
              <div style={{ fontWeight: 800, color: '#065F46', fontSize: kidsMode ? '1rem' : '.9rem' }}>
                All habits done! {kidsMode ? 'Amazing! ✨' : `Streak: ${state.streak} days 🔥`}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Habit list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {allHabits.map((habit, i) => {
            const checked = !!state.checkedToday[habit.id];
            const isCustom = habit.id.startsWith('custom_');
            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                onClick={() => toggleHabit(habit.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: kidsMode ? '16px 18px' : '13px 16px',
                  borderRadius: 16, cursor: 'pointer',
                  background: checked ? `${habit.color}12` : 'var(--surface)',
                  border: `2px solid ${checked ? habit.color : 'var(--border)'}`,
                  transition: 'all 0.2s',
                  boxShadow: checked ? `0 4px 16px ${habit.color}20` : 'none',
                }}
              >
                {/* Checkbox */}
                <div style={{
                  width: kidsMode ? 32 : 26, height: kidsMode ? 32 : 26,
                  borderRadius: '50%', flexShrink: 0,
                  background: checked ? habit.color : 'var(--bg3)',
                  border: `2px solid ${checked ? habit.color : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: kidsMode ? '.9rem' : '.75rem', color: 'white',
                  transition: 'all 0.2s',
                }}>
                  {checked ? '✓' : ''}
                </div>

                {/* Emoji + label */}
                <span style={{ fontSize: kidsMode ? '1.5rem' : '1.2rem', flexShrink: 0 }}>{habit.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: 700, fontSize: kidsMode ? '.95rem' : '.88rem',
                    color: checked ? habit.color : 'var(--ink)',
                    textDecoration: checked ? 'line-through' : 'none',
                    transition: 'all 0.2s',
                  }}>
                    {habit.label}
                  </div>
                  {habit.verse && !kidsMode && (
                    <div style={{ fontSize: '.68rem', color: 'var(--ink3)', fontWeight: 600 }}>{habit.verse}</div>
                  )}
                </div>

                {/* Remove custom */}
                {isCustom && (
                  <button
                    onClick={e => { e.stopPropagation(); removeCustomHabit(habit.id); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink3)', fontSize: '.8rem', padding: '4px', flexShrink: 0 }}
                  >✕</button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Add custom habit */}
        {state.customHabits.length < 3 && (
          <div style={{ marginBottom: 32 }}>
            {!addingHabit ? (
              <button
                onClick={() => setAddingHabit(true)}
                style={{
                  width: '100%', padding: '12px', borderRadius: 14,
                  border: '2px dashed var(--border)', background: 'var(--surface)',
                  color: 'var(--ink3)', fontWeight: 700, fontSize: '.85rem',
                  cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
                  transition: 'all 0.2s',
                }}
              >
                + Add Custom Habit ({3 - state.customHabits.length} remaining)
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  autoFocus
                  value={newHabit}
                  onChange={e => setNewHabit(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addCustomHabit(); if (e.key === 'Escape') setAddingHabit(false); }}
                  placeholder="e.g. Journal, Tithe, Fast..."
                  style={{
                    flex: 1, padding: '11px 14px', borderRadius: 12,
                    border: '1.5px solid var(--border)', background: 'var(--bg)',
                    color: 'var(--ink)', fontSize: '.88rem',
                    fontFamily: 'Poppins, sans-serif', outline: 'none',
                  }}
                />
                <button onClick={addCustomHabit} style={{
                  padding: '11px 18px', borderRadius: 12,
                  background: '#10B981', color: 'white', fontWeight: 800,
                  fontSize: '.85rem', border: 'none', cursor: 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                }}>Add</button>
                <button onClick={() => setAddingHabit(false)} style={{
                  padding: '11px 14px', borderRadius: 12,
                  background: 'var(--bg3)', color: 'var(--ink3)', fontWeight: 700,
                  fontSize: '.85rem', border: 'none', cursor: 'pointer',
                  fontFamily: 'Poppins, sans-serif',
                }}>✕</button>
              </div>
            )}
          </div>
        )}

        {/* Streak milestones */}
        <div style={{ background: 'var(--surface)', borderRadius: 18, border: '1.5px solid var(--border)', padding: '18px 20px', marginBottom: 24 }}>
          <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: '.95rem', color: 'var(--ink)', marginBottom: 12 }}>
            🏅 Streak Milestones
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { days: 1,  label: '1 Day',   badge: 'habit_first', emoji: '🌱' },
              { days: 7,  label: '7 Days',  badge: 'habit_week',  emoji: '🔥' },
              { days: 30, label: '30 Days', badge: 'habit_month', emoji: '👑' },
            ].map(m => {
              const earned = state.streak >= m.days || hasBadge(m.badge);
              return (
                <div key={m.days} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 99,
                  background: earned ? '#ECFDF5' : 'var(--bg2)',
                  border: `1.5px solid ${earned ? '#6EE7B7' : 'var(--border)'}`,
                  fontSize: '.75rem', fontWeight: 700,
                  color: earned ? '#065F46' : 'var(--ink3)',
                }}>
                  {m.emoji} {m.label} {earned ? '✓' : `(${Math.max(0, m.days - state.streak)} to go)`}
                </div>
              );
            })}
          </div>
        </div>

        {/* Back link */}
        <div style={{ textAlign: 'center' }}>
          <Link to="/grow" style={{ fontSize: '.82rem', color: 'var(--ink3)', textDecoration: 'none', fontWeight: 600 }}>
            ← Back to Grow
          </Link>
        </div>
      </div>
    </div>
  );
}
