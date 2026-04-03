import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AB_TESTS, forceVariant, clearVariant } from '../lib/abtest';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');

function pct(conv, imp) {
  if (!imp) return '—';
  return ((conv / imp) * 100).toFixed(1) + '%';
}

function StatPill({ value, color }) {
  return (
    <span
      style={{
        fontSize: '.72rem',
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: 99,
        background: color + '18',
        color,
      }}
    >
      {value}
    </span>
  );
}

export default function ABTestAdmin() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/abtest/results`);
      if (res.ok) setResults(await res.json());
    } catch {
      /* backend may be down */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  async function setWinner(testId, variantId, apply) {
    setSaving((s) => ({ ...s, [testId]: true }));
    try {
      await fetch(`${API}/api/abtest/winner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId, variantId, apply }),
      });
      if (apply) forceVariant(testId, variantId);
      showToast(
        apply
          ? `✅ Winner applied — all users will see "${variantId}"`
          : `📌 Winner saved (not yet applied)`
      );
      await load();
    } catch {
      showToast('❌ Failed — is the backend running?');
    }
    setSaving((s) => ({ ...s, [testId]: false }));
  }

  function handleForce(testId, variantId) {
    forceVariant(testId, variantId);
    showToast(`🔧 Your browser now shows variant "${variantId}" for ${testId}`);
  }

  function handleClear(testId) {
    clearVariant(testId);
    showToast(`🗑️ Cleared assignment for ${testId} — reload to get a fresh variant`);
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      {/* Header */}
      <div
        style={{ background: 'linear-gradient(135deg,#0F0F1A,#1E1B4B)', padding: '48px 32px 36px' }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Link
            to="/admin"
            style={{
              fontSize: '.8rem',
              color: 'rgba(255,255,255,.4)',
              textDecoration: 'none',
              display: 'inline-block',
              marginBottom: 16,
            }}
          >
            ← Admin
          </Link>
          <h1
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: 'clamp(1.8rem,4vw,2.8rem)',
              fontWeight: 800,
              color: 'white',
              marginBottom: 6,
            }}
          >
            🧪 A/B Test Dashboard
          </h1>
          <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.88rem' }}>
            Manage experiments, view conversion rates, and apply winners
          </p>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 24,
            zIndex: 9999,
            background: '#1E1B4B',
            color: 'white',
            borderRadius: 12,
            padding: '12px 20px',
            fontSize: '.85rem',
            fontWeight: 600,
            boxShadow: '0 8px 32px rgba(0,0,0,.3)',
            animation: 'popIn .2s ease',
          }}
        >
          {toast}
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 80px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--ink3)' }}>
            Loading results…
          </div>
        )}

        {!loading && !results && (
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 16,
              border: '1.5px solid var(--border)',
              padding: 28,
              textAlign: 'center',
              color: 'var(--ink3)',
            }}
          >
            ⚠️ Backend not reachable — impression/conversion data unavailable. You can still preview
            variants below.
          </div>
        )}

        <div style={{ display: 'grid', gap: 24, marginTop: results ? 0 : 24 }}>
          {Object.values(AB_TESTS).map((test) => {
            const imp = results?.impressions?.[test.id] || {};
            const conv = results?.conversions?.[test.id] || {};
            const winner = results?.winners?.[test.id];
            const totalImp = Object.values(imp).reduce((s, n) => s + n, 0);

            // Find best variant by conversion rate
            let bestVariant = null,
              bestRate = -1;
            for (const v of test.variants) {
              const rate = imp[v.id] ? (conv[v.id] || 0) / imp[v.id] : 0;
              if (rate > bestRate) {
                bestRate = rate;
                bestVariant = v.id;
              }
            }

            return (
              <div
                key={test.id}
                style={{
                  background: 'var(--surface)',
                  borderRadius: 20,
                  border: '1.5px solid var(--border)',
                  overflow: 'hidden',
                }}
              >
                {/* Test header */}
                <div
                  style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "'Baloo 2',cursive",
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        color: 'var(--ink)',
                        marginBottom: 2,
                      }}
                    >
                      {test.name}
                      {!test.active && (
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: '.65rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 99,
                            background: 'var(--border)',
                            color: 'var(--ink3)',
                          }}
                        >
                          PAUSED
                        </span>
                      )}
                      {winner?.applied && (
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: '.65rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 99,
                            background: 'var(--green-bg)',
                            color: 'var(--green)',
                          }}
                        >
                          WINNER APPLIED
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '.78rem', color: 'var(--ink3)' }}>
                      {test.description}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <StatPill value={`${totalImp.toLocaleString()} impressions`} color="#3B82F6" />
                    {test.kidsModeSafe && <StatPill value="Kids Safe" color="#10B981" />}
                    <button
                      onClick={() => handleClear(test.id)}
                      style={{
                        fontSize: '.72rem',
                        padding: '5px 10px',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        background: 'var(--bg)',
                        color: 'var(--ink3)',
                        cursor: 'pointer',
                      }}
                    >
                      Reset my variant
                    </button>
                  </div>
                </div>

                {/* Variants table */}
                <div style={{ padding: '16px 24px' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 80px 80px 90px 1fr',
                      gap: 8,
                      marginBottom: 8,
                      fontSize: '.7rem',
                      fontWeight: 700,
                      color: 'var(--ink3)',
                      textTransform: 'uppercase',
                      letterSpacing: '.04em',
                    }}
                  >
                    <span>Variant</span>
                    <span>Impressions</span>
                    <span>Conversions</span>
                    <span>Conv. Rate</span>
                    <span>Actions</span>
                  </div>
                  {test.variants.map((v) => {
                    const vImp = imp[v.id] || 0;
                    const vConv = conv[v.id] || 0;
                    const rate = pct(vConv, vImp);
                    const isBest = v.id === bestVariant && totalImp > 0;
                    const isWinner = winner?.variantId === v.id;

                    return (
                      <div
                        key={v.id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 80px 80px 90px 1fr',
                          gap: 8,
                          alignItems: 'center',
                          padding: '10px 0',
                          borderTop: '1px solid var(--border)',
                          background: isWinner ? 'var(--green-bg)' : 'transparent',
                          borderRadius: isWinner ? 8 : 0,
                          paddingLeft: isWinner ? 8 : 0,
                        }}
                      >
                        <div>
                          <span
                            style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--ink)' }}
                          >
                            {v.label}
                          </span>
                          <span style={{ marginLeft: 6, fontSize: '.65rem', color: 'var(--ink3)' }}>
                            ({v.id})
                          </span>
                          {isBest && (
                            <span
                              style={{
                                marginLeft: 6,
                                fontSize: '.62rem',
                                fontWeight: 800,
                                padding: '1px 6px',
                                borderRadius: 99,
                                background: '#FEF3C7',
                                color: '#D97706',
                              }}
                            >
                              LEADING
                            </span>
                          )}
                          {isWinner && (
                            <span
                              style={{
                                marginLeft: 6,
                                fontSize: '.62rem',
                                fontWeight: 800,
                                padding: '1px 6px',
                                borderRadius: 99,
                                background: 'var(--green-bg)',
                                color: 'var(--green)',
                              }}
                            >
                              WINNER
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '.82rem', color: 'var(--ink2)', fontWeight: 600 }}>
                          {vImp.toLocaleString()}
                        </span>
                        <span style={{ fontSize: '.82rem', color: 'var(--ink2)', fontWeight: 600 }}>
                          {vConv.toLocaleString()}
                        </span>
                        <span
                          style={{
                            fontSize: '.85rem',
                            fontWeight: 700,
                            color: isBest ? 'var(--green)' : 'var(--ink2)',
                          }}
                        >
                          {rate}
                        </span>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleForce(test.id, v.id)}
                            style={{
                              fontSize: '.7rem',
                              padding: '4px 10px',
                              borderRadius: 7,
                              border: '1px solid var(--border)',
                              background: 'var(--bg)',
                              color: 'var(--ink2)',
                              cursor: 'pointer',
                            }}
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => setWinner(test.id, v.id, false)}
                            disabled={saving[test.id]}
                            style={{
                              fontSize: '.7rem',
                              padding: '4px 10px',
                              borderRadius: 7,
                              border: '1px solid var(--blue)',
                              background: 'var(--blue-bg)',
                              color: 'var(--blue)',
                              cursor: 'pointer',
                              fontWeight: 700,
                            }}
                          >
                            Set Winner
                          </button>
                          <button
                            onClick={() => setWinner(test.id, v.id, true)}
                            disabled={saving[test.id]}
                            style={{
                              fontSize: '.7rem',
                              padding: '4px 10px',
                              borderRadius: 7,
                              border: 'none',
                              background: 'var(--green)',
                              color: 'white',
                              cursor: 'pointer',
                              fontWeight: 700,
                            }}
                          >
                            Apply to All
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Conversion bar chart */}
                {totalImp > 0 && (
                  <div style={{ padding: '0 24px 20px' }}>
                    <div
                      style={{
                        fontSize: '.72rem',
                        fontWeight: 700,
                        color: 'var(--ink3)',
                        marginBottom: 8,
                        textTransform: 'uppercase',
                        letterSpacing: '.04em',
                      }}
                    >
                      Conversion Rate Comparison
                    </div>
                    {test.variants.map((v) => {
                      const vImp = imp[v.id] || 0;
                      const vConv = conv[v.id] || 0;
                      const rate = vImp ? (vConv / vImp) * 100 : 0;
                      const maxRate = Math.max(
                        ...test.variants.map((vv) =>
                          vImp ? ((conv[vv.id] || 0) / (imp[vv.id] || 1)) * 100 : 0
                        ),
                        0.1
                      );
                      return (
                        <div key={v.id} style={{ marginBottom: 8 }}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '.75rem',
                              fontWeight: 600,
                              color: 'var(--ink2)',
                              marginBottom: 3,
                            }}
                          >
                            <span>{v.id}</span>
                            <span>{rate.toFixed(1)}%</span>
                          </div>
                          <div
                            style={{
                              height: 7,
                              borderRadius: 99,
                              background: 'var(--border)',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                borderRadius: 99,
                                background: v.id === bestVariant ? 'var(--green)' : 'var(--blue)',
                                width: `${(rate / maxRate) * 100}%`,
                                transition: 'width .6s ease',
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 32,
            padding: 20,
            borderRadius: 14,
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            fontSize: '.82rem',
            color: 'var(--ink3)',
            lineHeight: 1.7,
          }}
        >
          <strong style={{ color: 'var(--ink)' }}>How it works:</strong> Each visitor is assigned a
          stable variant via cookie. Impressions are tracked on page load, conversions on CTA click.
          "Set Winner" saves the winner without forcing it. "Apply to All" forces all new visitors
          to see that variant. Kids Mode always shows the control variant.
        </div>
      </div>
      <style>{`@keyframes popIn{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}
