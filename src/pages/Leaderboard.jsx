import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useKidsMode } from '../context/KidsModeContext';
import { useRealTime } from '../context/RealTimeContext';
import LeaderboardRow from '../components/LeaderboardRow';
import Podium from '../components/Podium';
import { BibleLoader, SkeletonLeaderRow, Skeleton } from '../components/Skeleton';
import API_URL from '../lib/api-config';

const TABS = [
  { id: 'streaks',  label: '🔥 Top Streaks',      color: '#F97316', bg: '#FFF7ED', border: '#FED7AA' },
  { id: 'badges',   label: '🏅 Most Badges',       color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE' },
  { id: 'trivia',   label: '🏆 Trivia Champions',  color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE' },
];

async function fetchLeaderboard(category, userId) {
  try {
    const url = `${API_URL}/api/leaderboard/${category}${userId ? `?userId=${userId}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) return { entries: [], currentUser: null, success: false };
    return await res.json();
  } catch {
    return { entries: [], currentUser: null, success: false };
  }
}

export default function Leaderboard() {
  const { user } = useAuth();
  const { kidsMode } = useKidsMode();
  const { leaderboard, refresh } = useRealTime();
  const [activeTab, setActiveTab] = useState('streaks');
  const [data, setData] = useState({ entries: [], currentUser: null });
  const [loading, setLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const activeTabData = TABS.find(t => t.id === activeTab);

  useEffect(() => {
    if (leaderboard?.live && activeTab === 'streaks' && leaderboard.streaks?.length) {
      setData(prev => ({ ...prev, entries: leaderboard.streaks }));
      setLoading(false);
    }
  }, [leaderboard, activeTab]);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetchLeaderboard(activeTab, user?.id);
    setData(result);
    setLastUpdated(new Date());
    setLoading(false);
  }, [activeTab, user?.id, retryKey]); // eslint-disable-line

  useEffect(() => {
    load();
    refresh('leaderboard');
  }, [load]);

  const topThree = data.entries.slice(0, 3);
  const rest = data.entries.slice(3);
  const isLive = leaderboard?.live;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0F0F1A 0%, #1E1B4B 50%, #0F172A 100%)',
        padding: kidsMode ? '56px 24px 48px' : '64px 24px 52px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow blobs */}
        {[['#FBBF24','15%','20%'],['#8B5CF6','80%','30%'],['#3B82F6','50%','70%']].map(([c,l,t],i) => (
          <div key={i} style={{
            position: 'absolute', width: 300, height: 300, borderRadius: '50%',
            background: `radial-gradient(circle, ${c}18 0%, transparent 70%)`,
            left: l, top: t, pointerEvents: 'none',
          }} />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <div style={{
            fontSize: kidsMode ? '4rem' : '3rem',
            marginBottom: 12,
            filter: 'drop-shadow(0 4px 16px rgba(251,191,36,0.5))',
          }}>
            🏆
          </div>
          <h1 style={{
            fontFamily: "'Baloo 2', cursive",
            fontSize: kidsMode ? 'clamp(2rem,6vw,3.5rem)' : 'clamp(1.8rem,4.5vw,3rem)',
            fontWeight: 800,
            background: 'linear-gradient(90deg, #FBBF24, #F59E0B, #FCD34D)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 10,
            lineHeight: 1.1,
          }}>
            {kidsMode ? '🌟 Hall of Champions! 🌟' : 'Leaderboard'}
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: kidsMode ? '1rem' : '.9rem',
            fontWeight: 500,
            maxWidth: 480,
            margin: '0 auto 20px',
            lineHeight: 1.6,
          }}>
            {kidsMode
              ? 'Who has the biggest streak? Can you make it to the top? 🔥'
              : 'Top streaks, badges, and trivia champions across the community'}
          </p>

          {/* Live indicator */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: '.72rem', fontWeight: 700,
            color: isLive ? '#4ADE80' : 'rgba(255,255,255,0.35)',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '4px 12px', borderRadius: 100,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: isLive ? '#4ADE80' : '#6B7280',
              boxShadow: isLive ? '0 0 8px #4ADE80' : 'none',
              display: 'inline-block',
            }} />
            {isLive ? 'Live' : 'Updated'} · {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </motion.div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px 80px' }}>

        {/* ── Tabs ─────────────────────────────────────────── */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 32,
          overflowX: 'auto', paddingBottom: 4,
        }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: kidsMode ? '10px 20px' : '9px 18px',
                  borderRadius: 12,
                  border: `2px solid ${isActive ? tab.color : 'var(--border)'}`,
                  background: isActive ? tab.bg : 'var(--surface)',
                  color: isActive ? tab.color : 'var(--ink3)',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: kidsMode ? '.9rem' : '.85rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all .2s',
                  boxShadow: isActive ? `0 4px 14px ${tab.color}30` : 'none',
                  transform: isActive ? 'translateY(-1px)' : 'none',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Content ──────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {loading && <LoadingSkeleton />}

            {!loading && data.entries.length === 0 && (
              <EmptyState tab={activeTab} kidsMode={kidsMode} />
            )}

            {!loading && data.entries.length > 0 && (
              <>
                <Podium entries={topThree} category={activeTab} kidsMode={kidsMode} />

                {rest.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    {rest.map((entry, i) => (
                      <motion.div
                        key={entry.userId}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.3 }}
                      >
                        <LeaderboardRow
                          entry={entry}
                          category={activeTab}
                          isCurrentUser={entry.userId === user?.id}
                          isPinned={false}
                          kidsMode={kidsMode}
                          accentColor={activeTabData?.color}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}

                {data.currentUser && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{
                      textAlign: 'center', fontSize: '.7rem', fontWeight: 700,
                      color: 'var(--ink3)', letterSpacing: '.05em',
                      textTransform: 'uppercase', padding: '8px 0 4px',
                    }}>
                      — Your Rank —
                    </div>
                    <LeaderboardRow
                      entry={data.currentUser}
                      category={activeTab}
                      isCurrentUser={true}
                      isPinned={false}
                      kidsMode={kidsMode}
                      accentColor={activeTabData?.color}
                    />
                  </div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Footer CTA ───────────────────────────────────── */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{
              marginTop: 40, textAlign: 'center',
              padding: '36px 28px',
              background: 'linear-gradient(135deg, var(--surface), var(--bg2))',
              borderRadius: 24,
              border: '1.5px solid var(--border)',
              position: 'relative', overflow: 'hidden',
            }}
          >
            {/* Subtle bg glow */}
            <div style={{
              position: 'absolute', top: '-30%', right: '-10%',
              width: 200, height: 200, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            <div style={{
              fontSize: kidsMode ? '4rem' : '3rem',
              marginBottom: 10,
              filter: 'drop-shadow(0 4px 12px rgba(99,102,241,0.4))',
              animation: 'rocketBounce 2s ease-in-out infinite',
            }}>
              🚀
            </div>
            <div style={{
              fontFamily: "'Baloo 2', cursive", fontWeight: 800,
              fontSize: kidsMode ? '1.4rem' : '1.2rem',
              color: 'var(--ink)', marginBottom: 8,
            }}>
              {kidsMode ? '🌟 Want to climb higher? 🌟' : 'Ready to climb the ranks?'}
            </div>
            <p style={{
              fontSize: kidsMode ? '.9rem' : '.84rem',
              color: 'var(--ink3)', marginBottom: 22,
              lineHeight: 1.65, maxWidth: 360, margin: '0 auto 22px',
            }}>
              {kidsMode
                ? 'Play games and read the Bible every day to grow your streak! 🔥'
                : 'Play trivia, earn badges, and keep your daily streak going to rise up the ranks.'}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/play/trivia" style={{
                padding: kidsMode ? '13px 26px' : '11px 22px',
                borderRadius: 14,
                background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)',
                color: 'white', fontWeight: 800,
                fontSize: kidsMode ? '.95rem' : '.88rem',
                textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(99,102,241,.4)',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                🎮 {kidsMode ? 'Play Trivia Now!' : 'Play Trivia'}
              </a>
              <a href="/devotional" style={{
                padding: kidsMode ? '13px 26px' : '11px 22px',
                borderRadius: 14,
                background: 'linear-gradient(135deg,#10B981,#059669)',
                color: 'white', fontWeight: 800,
                fontSize: kidsMode ? '.95rem' : '.88rem',
                textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(16,185,129,.35)',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                🙏 {kidsMode ? 'Daily Devotional!' : 'Daily Devotional'}
              </a>
            </div>
            <style>{`
              @keyframes rocketBounce {
                0%,100% { transform: translateY(0) rotate(-5deg); }
                50%      { transform: translateY(-10px) rotate(5deg); }
              }
            `}</style>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div>
      {/* Podium skeleton */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, padding: '24px 0', alignItems: 'flex-end' }}>
        {[80, 96, 80].map((s, i) => (
          <div key={i} style={{ textAlign: 'center', flex: 1 }}>
            <Skeleton width={s} height={s} radius="50%" style={{ margin: '0 auto 8px' }} />
            <Skeleton height={10} width={60} radius={6} style={{ margin: '0 auto 6px' }} />
            <Skeleton height={8} width={40} radius={6} style={{ margin: '0 auto' }} />
          </div>
        ))}
      </div>
      {[1,2,3,4,5].map(i => <SkeletonLeaderRow key={i} />)}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ tab, kidsMode }) {
  const msgs = {
    streaks: { emoji: '🔥', title: 'No streaks yet!', desc: 'Start a daily reading streak and be the first on the board.' },
    badges:  { emoji: '🏅', title: 'No badges yet!', desc: 'Earn badges by playing games, completing devotionals, and more.' },
    trivia:  { emoji: '🏆', title: 'No champions yet!', desc: 'Play trivia and score points to claim the top spot.' },
  };
  const m = msgs[tab];
  return (
    <div style={{
      textAlign: 'center', padding: '60px 24px',
      background: 'var(--surface)', borderRadius: 24,
      border: '1.5px solid var(--border)',
    }}>
      <div style={{ fontSize: kidsMode ? '4rem' : '3rem', marginBottom: 16 }}>{m.emoji}</div>
      <div style={{
        fontFamily: "'Baloo 2', cursive", fontWeight: 800,
        fontSize: kidsMode ? '1.4rem' : '1.2rem',
        color: 'var(--ink)', marginBottom: 8,
      }}>
        {m.title}
      </div>
      <p style={{ color: 'var(--ink3)', fontSize: '.88rem', marginBottom: 24, maxWidth: 320, margin: '0 auto 24px', lineHeight: 1.6 }}>
        {m.desc}
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/play/trivia" style={{
          padding: '10px 22px', borderRadius: 12,
          background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)',
          color: 'white', fontWeight: 800, fontSize: '.85rem', textDecoration: 'none',
        }}>
          🎮 Play Now
        </Link>
        <Link to="/devotional" style={{
          padding: '10px 22px', borderRadius: 12,
          background: 'var(--bg2)', color: 'var(--ink2)',
          fontWeight: 700, fontSize: '.85rem', textDecoration: 'none',
          border: '1.5px solid var(--border)',
        }}>
          🙏 Devotional
        </Link>
      </div>
    </div>
  );
}
