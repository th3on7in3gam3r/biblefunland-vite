import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useT } from '../i18n/useT';
import { SkeletonPrayerCard } from '../components/Skeleton';
import {
  getPrayers,
  insertPrayer,
  incrementPrayCount,
  getPendingPrayers,
  moderatePrayer,
} from '../lib/db';
import { useRealTime } from '../context/RealTimeContext';

const CATS = ['General', 'Healing', 'Family', 'Provision', 'Guidance', 'Salvation', 'Praise'];
const CCOLORS = {
  Healing: 'var(--green)',
  Guidance: 'var(--blue)',
  Praise: 'var(--orange)',
  Family: 'var(--pink)',
  Salvation: 'var(--violet)',
  General: 'var(--yellow)',
  Provision: 'var(--teal)',
};
const CBGS = {
  Healing: 'var(--green-bg)',
  Guidance: 'var(--blue-bg)',
  Praise: 'var(--orange-bg)',
  Family: 'var(--pink-bg)',
  Salvation: 'var(--violet-bg)',
  General: 'var(--yellow-bg)',
  Provision: 'var(--teal-bg)',
};
const EMOJIS = ['🙏', '👩', '👨', '👧', '👦', '🤲', '✝️', '💝', '🌟'];

// Fallback local data when backend not connected
const FALLBACK = [
  {
    id: 1,
    name: 'Sarah M.',
    category: 'Healing',
    text: "Please pray for my mother's recovery from surgery. We believe God is the ultimate healer!",
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    pray_count: 14,
  },
  {
    id: 2,
    name: 'Anonymous',
    category: 'Guidance',
    text: "I'm at a crossroads in my career and need wisdom. Praying God would make the path clear.",
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    pray_count: 22,
  },
  {
    id: 3,
    name: 'Pastor James',
    category: 'Praise',
    text: 'Praising God for answered prayer! My son accepted Jesus last Sunday at youth service! 🎉',
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    pray_count: 48,
  },
  {
    id: 4,
    name: 'Grace F.',
    category: 'Family',
    text: 'Asking for prayers for unity in my family. We are going through a tough season but trust God.',
    created_at: new Date(Date.now() - 25 * 3600000).toISOString(),
    pray_count: 31,
  },
  {
    id: 5,
    name: 'FaithWalker',
    category: 'Salvation',
    text: 'Please intercede for my neighbor who has been asking questions about faith.',
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    pray_count: 19,
  },
  {
    id: 6,
    name: 'JoyfulKid',
    category: 'General',
    text: 'Thank you for this website! Please pray I do well in my Bible memory contest at church!',
    created_at: new Date(Date.now() - 72 * 3600000).toISOString(),
    pray_count: 37,
  },
];

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
}

export default function PrayerWallRealtime() {
  const { t } = useT();
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingBackend, setUsingBackend] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'General', text: '', anon: false });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [prayedIds, setPrayedIds] = useState(new Set());
  const [liveCount, setLiveCount] = useState(0);
  const [pendingPrayers, setPendingPrayers] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const channelRef = useRef(null);

  const { user, profile } = useAuth();
  const { prayers: livePrayers, refresh } = useRealTime();
  const isParentOrTeacher =
    profile?.role?.toLowerCase() === 'parent' || profile?.role?.toLowerCase() === 'teacher';

  // Sync live prayers from RealTimeContext when available
  useEffect(() => {
    if (livePrayers?.live && livePrayers.items?.length) {
      const nextCount = Math.max(0, livePrayers.items.length - (prayers?.length || 0));
      if (nextCount > 0) setLiveCount(nextCount);
      setPrayers(livePrayers.items);
      setUsingBackend(true);
      setLoading(false);
    }
  }, [livePrayers]);

  useEffect(() => {
    loadPrayers();
    if (isParentOrTeacher) loadPending();

    const interval = setInterval(() => {
      loadPrayers(true);
      if (isParentOrTeacher) loadPending();
    }, 12000);

    // SSE for live updates — only attempt if backend is reachable (not on Vercel static)
    let source = null;
    try {
      const streamUrl = `${import.meta.env.VITE_API_URL || ''}/api/prayers/stream`;
      // Only connect SSE if we have a real backend URL (not relative '/')
      if (streamUrl && !streamUrl.startsWith('/')) {
        source = new EventSource(streamUrl);
        channelRef.current = source;

        source.addEventListener('prayer_approved', () => loadPrayers(true));
        source.addEventListener('new_submission', ({ data }) => {
          const parsed = JSON.parse(data);
          setPendingCount(c => c + 1);
          if (parsed?.userId === user?.id) {
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 2500);
          }
        });
        source.addEventListener('pray_count', ({ data }) => {
          const payload = JSON.parse(data);
          setPrayers(prev => prev.map(p => p.id === payload.id ? { ...p, pray_count: payload.pray_count } : p));
        });
        source.onerror = () => source.close();
      }
    } catch {
      // SSE not available — polling handles updates
    }

    return () => {
      clearInterval(interval);
      channelRef.current?.close?.();
    };
  }, [user?.id, isParentOrTeacher]);

  async function loadPrayers(pushCount = false) {
    setLoading(true);
    try {
      const response = await getPrayers();
      const data = response?.data || [];
      if (pushCount) {
        const nextCount = Math.max(0, data.length - (prayers?.length || 0));
        if (nextCount > 0) setLiveCount(nextCount);
      }
      setPrayers(data);
      setUsingBackend(true);
    } catch (err) {
      console.warn('[PrayerWall] loadPrayers fallback', err?.message);
      setPrayers(FALLBACK);
      setUsingBackend(false);
    }
    setLoading(false);
  }

  async function loadPending() {
    try {
      const { data = [] } = await getPendingPrayers();
      setPendingPrayers(data);
      setPendingCount(data.length);
    } catch {
      setPendingCount(0);
    }
  }

  async function handleModeratePrayer(prayerId, action) {
    try {
      await moderatePrayer(prayerId, action, user?.id || 'system');
      await loadPending();
      if (action === 'approve') {
        await loadPrayers(true);
      }
    } catch (err) {
      console.warn('[PrayerWall] moderate error', err.message);
    }
  }

  async function submitPrayer() {
    if (!form.text.trim()) {
      alert(t('prayer.text'));
      return;
    }
    setSubmitting(true);
    const name = form.anon ? 'Anonymous' : form.name.trim() || 'Anonymous';
    const newPrayer = {
      name,
      category: form.category,
      text: form.text,
      pray_count: 0,
    };

    if (usingBackend) {
      await insertPrayer({ name, category: form.category, text: form.text });
      const { data } = await getPrayers();
      if (data) setPrayers(data);
    } else {
      // Local fallback
      setPrayers((prev) => [
        { ...newPrayer, id: Date.now(), created_at: new Date().toISOString() },
        ...prev,
      ]);
    }

    setForm({ name: '', category: 'General', text: '', anon: false });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setSubmitting(false);
    refresh('prayers');
  }

  async function prayFor(prayer) {
    if (prayedIds.has(prayer.id)) return;
    setPrayedIds((prev) => new Set([...prev, prayer.id]));

    if (usingBackend) {
      await incrementPrayCount(prayer.id);
    } else {
      setPrayers((prev) =>
        prev.map((p) => (p.id === prayer.id ? { ...p, pray_count: p.pray_count + 1 } : p))
      );
    }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>
      {/* Hero */}
      <div
        style={{
          background: 'linear-gradient(135deg,#064E3B,#065F46,#0F766E)',
          padding: '60px 36px 44px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(2rem,4.5vw,3.4rem)',
            fontWeight: 800,
            color: 'white',
            letterSpacing: -1,
            marginBottom: 8,
          }}
        >
          {t('prayer.title')}
        </h1>
        <p
          style={{
            color: 'rgba(255,255,255,.6)',
            fontSize: '.9rem',
            fontWeight: 500,
            marginBottom: 16,
          }}
        >
          {t('prayer.subtitle')}
        </p>

        {/* Live indicator */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(16,185,129,.15)',
            border: '1px solid rgba(16,185,129,.3)',
            borderRadius: 100,
            padding: '5px 14px',
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#34D399',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <span style={{ fontSize: '.72rem', fontWeight: 700, color: '#34D399' }}>
            {usingBackend
              ? t('prayer.live') + ' — Real-time Backend'
              : 'Local Mode — Connect backend for live updates'}
          </span>
          {liveCount > 0 && (
            <span
              style={{
                background: '#34D399',
                color: '#064E3B',
                fontSize: '.65rem',
                fontWeight: 800,
                padding: '1px 7px',
                borderRadius: 100,
                animation: 'popIn .3s ease',
              }}
            >
              +{liveCount} new
            </span>
          )}
        </div>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.85)}}@keyframes popIn{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:scale(1)}}`}</style>

      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '44px 24px' }}>
        {/* Submit form */}
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 24,
            border: '1.5px solid var(--border)',
            boxShadow: 'var(--sh)',
            padding: 32,
            marginBottom: 36,
          }}
        >
          <div
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--ink)',
              marginBottom: 6,
            }}
          >
            🙏 {t('prayer.submit')}
          </div>
          <div
            style={{ fontSize: '.84rem', color: 'var(--ink2)', fontWeight: 500, marginBottom: 20 }}
          >
            {t('prayer.subtitle')}
          </div>

          {submitted && (
            <div
              style={{
                background: 'var(--green-bg)',
                color: 'var(--green)',
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: '.82rem',
                fontWeight: 700,
                marginBottom: 14,
                animation: 'popIn .3s ease',
              }}
            >
              ✅ Your prayer request has been shared with the community!
            </div>
          )}

          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}
          >
            <input
              className="input-field"
              placeholder={t('prayer.name')}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <select
              className="input-field"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            >
              {CATS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <textarea
            className="textarea-field"
            placeholder={t('prayer.text')}
            value={form.text}
            onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
            style={{ marginBottom: 14, height: 90 }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '.8rem',
                color: 'var(--ink2)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={form.anon}
                onChange={(e) => setForm((f) => ({ ...f, anon: e.target.checked }))}
                style={{ accentColor: 'var(--green)' }}
              />
              {t('prayer.anon')}
            </label>
            <button className="btn btn-green" onClick={submitPrayer} disabled={submitting}>
              {submitting ? '...' : t('prayer.btn')}
            </button>
          </div>
        </div>

        {/* Wall header */}
        <div
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: '1.25rem',
            fontWeight: 800,
            color: 'var(--ink)',
            marginBottom: 22,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          🌍 Community Prayer Requests
          <span
            style={{
              fontFamily: 'Poppins,sans-serif',
              fontSize: '.8rem',
              fontWeight: 600,
              color: 'var(--ink3)',
            }}
          >
            ({prayers.length} {t('prayer.requests')})
          </span>
        </div>

        {/* Moderation queue for parent/teacher */}
        {isParentOrTeacher && (
          <div
            style={{
              marginBottom: 18,
              padding: 14,
              borderRadius: 14,
              background: 'rgba(59,130,246,.08)',
              border: '1px solid rgba(59,130,246,.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div>
              <strong>🛡️ Pending prayers:</strong> {pendingCount}
              <small style={{ color: '#3b82f6', marginLeft: 8 }}>(auto-refreshing)</small>
            </div>
            <button
              onClick={loadPending}
              className="btn btn-outline"
              style={{ padding: '8px 12px' }}
            >
              Refresh Queue
            </button>
          </div>
        )}

        {isParentOrTeacher && pendingPrayers.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '.9rem', fontWeight: 700, color: '#1d4ed8', marginBottom: 8 }}>
              🧾 Moderation Queue
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {pendingPrayers.map((pending) => (
                <div
                  key={pending.id}
                  style={{
                    background: 'white',
                    border: '1px solid #dbeafe',
                    borderRadius: 12,
                    padding: 10,
                  }}
                >
                  <div style={{ fontSize: '.76rem', color: '#475569', marginBottom: 4 }}>
                    {pending.name} • {pending.category} • {timeAgo(pending.created_at)}
                  </div>
                  <div style={{ color: 'var(--ink2)', fontSize: '.85rem', marginBottom: 8 }}>
                    {pending.text}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleModeratePrayer(pending.id, 'approve')}
                      className="btn btn-green"
                      style={{ fontSize: '.7rem', padding: '6px 10px' }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleModeratePrayer(pending.id, 'reject')}
                      className="btn btn-red"
                      style={{ fontSize: '.7rem', padding: '6px 10px' }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cards */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <SkeletonPrayerCard key={i} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {prayers.map((p, idx) => {
              const catC = CCOLORS[p.category] || 'var(--blue)';
              const catBg = CBGS[p.category] || 'var(--blue-bg)';
              const emoji = EMOJIS[idx % EMOJIS.length];
              const prayed = prayedIds.has(p.id);
              return (
                <div
                  key={p.id}
                  style={{
                    background: 'var(--surface)',
                    borderRadius: 20,
                    padding: 20,
                    border: '1.5px solid var(--border)',
                    transition: 'all .25s',
                    animation: idx === 0 && liveCount > 0 ? 'popIn .4s ease' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: catBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.1rem',
                        flexShrink: 0,
                      }}
                    >
                      {emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '.84rem', fontWeight: 700, color: 'var(--ink)' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '.7rem', color: 'var(--ink3)', fontWeight: 500 }}>
                        {timeAgo(p.created_at)}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: '.65rem',
                        fontWeight: 700,
                        padding: '3px 9px',
                        borderRadius: 100,
                        background: catBg,
                        color: catC,
                      }}
                    >
                      {p.category}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '.83rem',
                      color: 'var(--ink2)',
                      lineHeight: 1.7,
                      fontWeight: 500,
                      marginBottom: 14,
                    }}
                  >
                    {p.text}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <button
                      onClick={() => prayFor(p)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: '.78rem',
                        fontWeight: 700,
                        padding: '7px 14px',
                        borderRadius: 9,
                        border: `1.5px solid ${prayed ? 'var(--green)' : 'var(--border)'}`,
                        background: prayed ? 'var(--green-bg)' : 'var(--surface)',
                        color: prayed ? 'var(--green)' : 'var(--ink2)',
                        cursor: prayed ? 'default' : 'pointer',
                        transition: 'all .2s',
                      }}
                    >
                      🙏 {prayed ? t('prayer.praying') : t('prayer.pray')}
                    </button>
                    <span style={{ fontSize: '.75rem', color: 'var(--ink3)', fontWeight: 600 }}>
                      🙏 {p.pray_count} {t('prayer.praying').toLowerCase()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
