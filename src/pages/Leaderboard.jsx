import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useKidsMode } from '../context/KidsModeContext';
import { useRealTime } from '../context/RealTimeContext';
import LeaderboardRow from '../components/LeaderboardRow';
import Podium from '../components/Podium';
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
          <div style={{
            marginTop: 40, textAlign: 'center',
            padding: '28px 24px',
            background: 'var(--surface)',
            borderRadius: 20,
            border: '1.5px solid var(--border)',
          }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>🚀</div>
            <div style={{
              fontFamily: "'Baloo 2', cursive", fontWeight: 800,
              fontSize: '1.1rem', color: 'var(--ink)', marginBottom: 6,
            }}>
              {kidsMode ? 'Want to climb higher?' : 'Improve your rank'}
            </div>
            <p style={{ fontSize: '.82rem', color: 'var(--ink3)', marginBottom: 16, lineHeight: 1.6 }}>
              {kidsMode
                ? 'Play games and read the Bible every day to grow your streak! 🔥'
                : 'Play trivia, earn badges, and keep your daily streak going to rise up the ranks.'}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/play/trivia" style={{
                padding: '10px 20px', borderRadius: 12,
                background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)',
                color: 'white', fontWeight: 800, fontSize: '.85rem',
                textDecoration: 'none', boxShadow: '0 4px 14px rgba(99,102,241,.3)',
              }}>
                🎮 Play Trivia
              </Link>
              <Link to="/devotional" style={{
                padding: '10px 20px', borderRadius: 12,
                background: 'var(--bg2)', color: 'var(--ink2)',
                fontWeight: 700, fontSize: '.85rem', textDecoration: 'none',
                border: '1.5px solid var(--border)',
              }}>
                🙏 Daily Devotional
              </Link>
            </div>
          </div>
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
            <div style={{
              width: s, height: s, borderRadius: '50%',
              background: 'var(--bg3)', margin: '0 auto 8px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
            <div style={{ height: 10, width: 60, background: 'var(--bg3)', borderRadius: 6, margin: '0 auto 6px', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ height: 8, width: 40, background: 'var(--bg3)', borderRadius: 6, margin: '0 auto', animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
        ))}
      </div>
      {/* Row skeletons */}
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 14px', borderRadius: 14,
          background: 'var(--surface)', border: '1.5px solid var(--border)',
          marginBottom: 8,
        }}>
          <div style={{ width: 32, height: 16, background: 'var(--bg3)', borderRadius: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg3)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ flex: 1, height: 14, background: 'var(--bg3)', borderRadius: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ width: 48, height: 14, background: 'var(--bg3)', borderRadius: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
      ))}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
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
