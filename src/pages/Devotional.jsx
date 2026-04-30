import { useState } from 'react';
import { generateAIContent } from '../lib/ai';
const TOPICS = [
  '😌 Anxiety & Peace',
  '💪 Strength & Courage',
  '🤝 Forgiveness',
  '🙏 Gratitude',
  '👨‍👩‍👧 Parenting',
  '⭐ Hope & Faith',
  '🎯 Purpose & Calling',
  '✝️ Prayer',
];
export default function Devotional() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  async function generate() {
    if (!topic.trim()) {
      setError('Please enter or select a topic!');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const text = await generateAIContent({
        system: `You are a warm devotional writer for BibleFunLand. Write a personal scripture-rich devotional. Use exactly these labels on their own lines: TITLE: SCRIPTURE: REFLECTION: APPLICATION: PRAYER: Under APPLICATION write 3 bullet points starting with •. Keep it ~380 words, warm and conversational.`,
        messages: [{ role: 'user', content: `Write a daily devotional for: "${topic}"` }],
        max_tokens: 900,
      });

      if (text) {
        const t = text;
        setResult({
          title: (t.match(/TITLE:\s*(.+)/i)?.[1] || `Devotional: ${topic}`).trim(),
          scripture: (t.match(/SCRIPTURE:\s*([\s\S]+?)(?=REFLECTION:|$)/i)?.[1] || '').trim(),
          reflection: (t.match(/REFLECTION:\s*([\s\S]+?)(?=APPLICATION:|$)/i)?.[1] || '').trim(),
          application: (t.match(/APPLICATION:\s*([\s\S]+?)(?=PRAYER:|$)/i)?.[1] || '').trim(),
          prayer: (t.match(/PRAYER:\s*([\s\S]+?)$/i)?.[1] || '').trim(),
          raw: t,
        });
      } else setError('AI returned an empty response. Please try again.');
    } catch (err) {
      setError(err.message || 'Connection failed. Please try again later.');
    }
    setLoading(false);
  }
  function copy() {
    navigator.clipboard.writeText(result?.raw || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  const F = 'Poppins,sans-serif';
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: F }}>
      <style>{`@keyframes dlB{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-8px)}}`}</style>
      <div
        style={{
          background: 'linear-gradient(135deg,#1E1B4B,#312E81)',
          padding: '60px 36px 44px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: '.7rem',
            fontWeight: 700,
            background: 'rgba(139,92,246,.2)',
            color: '#C4B5FD',
            padding: '4px 12px',
            borderRadius: 100,
            marginBottom: 12,
          }}
        >
          🙏 AI-Powered
        </div>
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(2rem,4.5vw,3.4rem)',
            fontWeight: 800,
            background: 'linear-gradient(90deg,#A5B4FC,#DDD6FE,#F9A8D4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 8,
          }}
        >
          Devotional Generator
        </h1>
        <p
          style={{
            color: 'rgba(255,255,255,.5)',
            fontSize: '.9rem',
            fontWeight: 500,
            maxWidth: 440,
            margin: '0 auto',
          }}
        >
          Type a topic and receive a personalized devotional with scripture, reflection, and prayer
          — in seconds.
        </p>
      </div>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '44px 24px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            background: 'var(--violet-bg)',
            borderRadius: 14,
            padding: '14px 18px',
            marginBottom: 20,
            fontSize: '.78rem',
            color: 'var(--violet)',
            fontWeight: 500,
            lineHeight: 1.6,
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>✨</span>
          <span>
            This tool uses advanced AI to craft a personalized devotional just for you based on
            God's Word.
          </span>
        </div>
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 24,
            border: '1.5px solid var(--border)',
            boxShadow: '0 8px 32px rgba(0,0,0,.08)',
            padding: 32,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: '.72rem',
              fontWeight: 700,
              color: 'var(--ink3)',
              letterSpacing: '.5px',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            Quick Topics
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {TOPICS.map((t) => {
              const label = t.replace(/^.{2}\s/, '');
              return (
                <button
                  key={t}
                  onClick={() => setTopic(label)}
                  style={{
                    fontSize: '.76rem',
                    fontWeight: 700,
                    padding: '6px 14px',
                    borderRadius: 100,
                    border: `1.5px solid ${topic === label ? 'var(--violet)' : 'var(--border)'}`,
                    background: topic === label ? 'var(--violet-bg)' : 'var(--surface)',
                    color: topic === label ? 'var(--violet)' : 'var(--ink2)',
                    cursor: 'pointer',
                    transition: 'all .2s',
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
          <div
            style={{
              fontSize: '.72rem',
              fontWeight: 700,
              color: 'var(--ink3)',
              letterSpacing: '.5px',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Or type your own
          </div>
          <div style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
            <input
              className="input-field"
              placeholder="e.g. dealing with loneliness, trusting God..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generate()}
              style={{ flex: 1 }}
            />
            <button
              className="btn btn-violet"
              onClick={generate}
              disabled={loading}
              style={{ whiteSpace: 'nowrap' }}
            >
              {loading ? '...' : '✨ Generate'}
            </button>
          </div>
        </div>
        {error && (
          <div
            style={{
              background: 'var(--red-bg)',
              color: 'var(--red)',
              borderRadius: 12,
              padding: '10px 14px',
              fontSize: '.82rem',
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            ⚠️ {error}
          </div>
        )}
        {loading && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <span style={{ fontSize: '2.5rem' }}>✝️</span>
            <p style={{ fontSize: '.9rem', color: 'var(--ink2)', fontWeight: 600, marginTop: 12 }}>
              Crafting your devotional...
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14 }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: 'var(--violet)',
                    animation: `dlB 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        {result && !loading && (
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 24,
              border: '1.5px solid var(--border)',
              boxShadow: '0 8px 32px rgba(0,0,0,.08)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '20px 26px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0,
                }}
              >
                ✝️
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: 'var(--ink)',
                  }}
                >
                  {result.title}
                </div>
                <div style={{ fontSize: '.72rem', color: 'var(--ink3)', fontWeight: 500 }}>
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={copy}>
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
            <div style={{ padding: '24px 28px' }}>
              {result.scripture && (
                <>
                  <div
                    style={{
                      fontFamily: "'Baloo 2',cursive",
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: 'var(--ink)',
                      margin: '0 0 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                    }}
                  >
                    📖 Scripture
                  </div>
                  <div
                    style={{
                      background: 'var(--violet-bg)',
                      borderLeft: '3px solid var(--violet)',
                      borderRadius: '0 14px 14px 0',
                      padding: '14px 18px',
                      fontSize: '.88rem',
                      color: 'var(--ink)',
                      fontStyle: 'italic',
                      fontWeight: 500,
                      lineHeight: 1.7,
                      marginBottom: 16,
                    }}
                  >
                    {result.scripture}
                  </div>
                </>
              )}
              {result.reflection && (
                <>
                  <div
                    style={{
                      fontFamily: "'Baloo 2',cursive",
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: 'var(--ink)',
                      margin: '20px 0 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                    }}
                  >
                    ✍️ Reflection
                  </div>
                  {result.reflection
                    .split('\n\n')
                    .filter(Boolean)
                    .map((p, i) => (
                      <p
                        key={i}
                        style={{
                          fontSize: '.88rem',
                          color: 'var(--ink2)',
                          lineHeight: 1.8,
                          fontWeight: 500,
                          marginBottom: 12,
                        }}
                      >
                        {p.trim()}
                      </p>
                    ))}
                </>
              )}
              {result.application && (
                <>
                  <div
                    style={{
                      fontFamily: "'Baloo 2',cursive",
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: 'var(--ink)',
                      margin: '20px 0 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                    }}
                  >
                    🎯 Application
                  </div>
                  {result.application
                    .split('\n')
                    .filter((l) => l.trim().startsWith('•'))
                    .map((l, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 8,
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: 'var(--violet)',
                            marginTop: 8,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: '.88rem',
                            color: 'var(--ink2)',
                            lineHeight: 1.7,
                            fontWeight: 500,
                          }}
                        >
                          {l.replace(/^•\s*/, '').trim()}
                        </span>
                      </div>
                    ))}
                </>
              )}
              {result.prayer && (
                <>
                  <div
                    style={{
                      fontFamily: "'Baloo 2',cursive",
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: 'var(--ink)',
                      margin: '20px 0 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                    }}
                  >
                    🙏 Prayer
                  </div>
                  <div
                    style={{
                      background: 'var(--green-bg)',
                      borderLeft: '3px solid var(--green)',
                      borderRadius: '0 14px 14px 0',
                      padding: '14px 18px',
                      fontSize: '.88rem',
                      color: 'var(--ink)',
                      fontStyle: 'italic',
                      fontWeight: 500,
                      lineHeight: 1.7,
                    }}
                  >
                    {result.prayer}
                  </div>
                </>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
                <button className="btn btn-violet" onClick={generate}>
                  ✨ Regenerate
                </button>
                <button className="btn btn-outline" onClick={() => setResult(null)}>
                  ← New Topic
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
