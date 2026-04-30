import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAIContent } from '../lib/ai';
import { useAuth } from '../context/AuthContext';
import { useBadges } from '../context/BadgeContext';
import { useKidsMode } from '../context/KidsModeContext';

// Kid-friendly situation prompts
const PROMPTS = [
  { emoji: '😤', label: 'I had a fight with my friend' },
  { emoji: '😢', label: "I feel left out at school" },
  { emoji: '😠', label: "I didn't get what I wanted" },
  { emoji: '😰', label: "I'm scared about something" },
  { emoji: '🤥', label: "I told a lie and feel bad" },
  { emoji: '💔', label: "Someone was mean to me" },
  { emoji: '🤝', label: "I want to help someone" },
  { emoji: '😔', label: "I made a mistake" },
  { emoji: '🌟', label: "I want to be a better person" },
  { emoji: '🙏', label: "I want to get closer to God" },
];

const BASE_PARABLES = [
  'The Prodigal Son', 'The Good Samaritan', 'The Lost Sheep',
  'The Mustard Seed', 'The Talents', 'The Sower and the Seeds',
  'The Lost Coin', 'The Wise and Foolish Builders',
];

const SYSTEM = `You are a gentle, wise storyteller who creates modern-day parables in the style of Jesus for children and families.

When given a real-life situation, create a short original parable that:
1. Mirrors a real Bible parable (mention which one inspired it)
2. Uses a modern, relatable setting (school, playground, neighborhood, family)
3. Has simple, warm, age-appropriate language
4. Ends with a clear, gentle lesson

Use EXACTLY this format with these labels on their own lines:

PARABLE_TITLE: [Creative title]
INSPIRED_BY: [Name of the Bible parable it mirrors]
STORY:
[The parable story — 3-4 short paragraphs, vivid and warm. Use dialogue. Make it feel like a real story a child would love.]

LESSON: [One sentence — the heart of the parable]

REFLECTION_1: [Simple question a child can answer]
REFLECTION_2: [Question about the main character's choice]
REFLECTION_3: [Application: "What would you do if..."]

PRAYER: [A short, simple 3-sentence prayer the child can pray right now. Conversational with God.]

ACTION: [One concrete thing they can do today to live out the parable's lesson]

Keep the entire response warm, wonder-filled, and Scripture-faithful. The parable should feel like something Jesus himself might tell today.`;

export default function PersonalParable() {
  const { user } = useAuth();
  const { awardBadge, hasBadge } = useBadges();
  const { kidsMode } = useKidsMode();

  const [situation, setSituation] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [celebrated, setCelebrated] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!situation.trim()) {
      setError('Tell us what\'s going on first! 😊');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    setCelebrated(false);

    try {
      const text = await generateAIContent({
        system: SYSTEM,
        messages: [{ role: 'user', content: `My situation: "${situation}"\n\nCreate a personal parable for me.` }],
        max_tokens: 1200,
      });

      if (!text) { setError('Try again — something went wrong.'); setLoading(false); return; }

      const parsed = {
        title: text.match(/PARABLE_TITLE:\s*(.+)/i)?.[1]?.trim() || 'Your Personal Parable',
        inspiredBy: text.match(/INSPIRED_BY:\s*(.+)/i)?.[1]?.trim() || '',
        story: text.match(/STORY:\s*([\s\S]+?)(?=LESSON:|$)/i)?.[1]?.trim() || '',
        lesson: text.match(/LESSON:\s*(.+)/i)?.[1]?.trim() || '',
        r1: text.match(/REFLECTION_1:\s*(.+)/i)?.[1]?.trim() || '',
        r2: text.match(/REFLECTION_2:\s*(.+)/i)?.[1]?.trim() || '',
        r3: text.match(/REFLECTION_3:\s*(.+)/i)?.[1]?.trim() || '',
        prayer: text.match(/PRAYER:\s*([\s\S]+?)(?=ACTION:|$)/i)?.[1]?.trim() || '',
        action: text.match(/ACTION:\s*([\s\S]+?)$/i)?.[1]?.trim() || '',
        raw: text,
      };

      setResult(parsed);

      // Award badge
      if (!hasBadge('parable_maker')) {
        awardBadge('parable_maker');
      }
      setCelebrated(true);
    } catch (err) {
      setError(err.message || 'Connection failed. Please try again.');
    }
    setLoading(false);
  }

  function copy() {
    if (!result) return;
    navigator.clipboard.writeText(result.raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const sz = kidsMode ? { title: '2.8rem', body: '1rem', btn: '1rem', pad: '20px 18px' }
                      : { title: '2.2rem', body: '.88rem', btn: '.9rem', pad: '16px 14px' };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg,#1E1B4B 0%,#312E81 40%,#064E3B 100%)',
        padding: kidsMode ? '52px 24px 44px' : '60px 24px 48px',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {[['#8B5CF6','8%','15%'],['#10B981','88%','20%'],['#FCD34D','45%','75%']].map(([c,l,t],i) => (
          <div key={i} style={{
            position: 'absolute', width: 260, height: 260, borderRadius: '50%',
            background: `radial-gradient(circle,${c}20 0%,transparent 70%)`,
            left: l, top: t, pointerEvents: 'none',
          }} />
        ))}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <motion.div
            animate={{ rotate: [0, -5, 5, -3, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
            style={{ fontSize: kidsMode ? '4rem' : '3.2rem', marginBottom: 14, display: 'inline-block', filter: 'drop-shadow(0 4px 16px rgba(139,92,246,0.5))' }}
          >
            📜
          </motion.div>
          <h1 style={{
            fontFamily: "'Baloo 2', cursive", fontWeight: 800,
            fontSize: `clamp(${sz.title},6vw,3.2rem)`,
            background: 'linear-gradient(90deg,#A5B4FC,#6EE7B7,#FCD34D)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', marginBottom: 10, lineHeight: 1.1,
          }}>
            {kidsMode ? '✨ My Personal Parable! ✨' : 'My Personal Parable'}
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.6)', fontSize: kidsMode ? '1rem' : '.92rem',
            maxWidth: 500, margin: '0 auto 16px', lineHeight: 1.75, fontWeight: 500,
          }}>
            {kidsMode
              ? "Tell us what's happening in your life — and we'll create a special story just for you, just like Jesus did! 🌟"
              : "Share what's on your heart and receive a personal parable — an original story in the style of Jesus, written just for your situation."}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: '.7rem', fontWeight: 800, letterSpacing: '1px',
              textTransform: 'uppercase', color: '#A5B4FC',
              background: 'rgba(165,180,252,0.12)', border: '1px solid rgba(165,180,252,0.25)',
              padding: '5px 14px', borderRadius: 100,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 8px #4ADE80', display: 'inline-block' }} />
              AI-Powered · Scripture-Faithful
            </span>
            {!hasBadge('parable_maker') && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: '.7rem', fontWeight: 800, color: '#FCD34D',
                background: 'rgba(252,211,77,0.12)', border: '1px solid rgba(252,211,77,0.25)',
                padding: '5px 14px', borderRadius: 100,
              }}>
                🏅 Earn the Parable Maker badge
              </span>
            )}
          </div>
        </motion.div>
      </div>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* Input card */}
        <AnimatePresence>
          {!result && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              style={{
                background: 'var(--surface)', borderRadius: 24,
                border: '1.5px solid var(--border)',
                padding: kidsMode ? '28px 24px' : '28px 28px',
                marginBottom: 20,
              }}
            >
              {/* Prompt chips */}
              <div style={{
                fontSize: '.72rem', fontWeight: 800, color: 'var(--ink3)',
                textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 12,
              }}>
                {kidsMode ? '👇 Pick what\'s happening:' : 'Choose a situation or type your own'}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                {PROMPTS.map(p => (
                  <button
                    key={p.label}
                    onClick={() => setSituation(p.label)}
                    style={{
                      fontSize: kidsMode ? '.85rem' : '.75rem',
                      fontWeight: 700,
                      padding: kidsMode ? '9px 16px' : '7px 13px',
                      borderRadius: 100,
                      border: `1.5px solid ${situation === p.label ? '#8B5CF6' : 'var(--border)'}`,
                      background: situation === p.label ? '#F5F3FF' : 'var(--surface)',
                      color: situation === p.label ? '#7C3AED' : 'var(--ink2)',
                      cursor: 'pointer', transition: 'all .15s',
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}
                  >
                    <span>{p.emoji}</span> {p.label}
                  </button>
                ))}
              </div>

              {/* Free text */}
              <div style={{
                fontSize: '.72rem', fontWeight: 800, color: 'var(--ink3)',
                textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8,
              }}>
                {kidsMode ? '✏️ Or write it yourself:' : 'Or describe your situation'}
              </div>
              <textarea
                value={situation}
                onChange={e => setSituation(e.target.value)}
                placeholder={kidsMode
                  ? "Tell us what happened... (e.g. My friend took my toy and I got really mad)"
                  : "Describe what's going on in your life right now..."}
                rows={kidsMode ? 3 : 3}
                style={{
                  width: '100%', padding: '14px 16px',
                  borderRadius: 14, border: '1.5px solid var(--border)',
                  background: 'var(--bg)', color: 'var(--ink)',
                  fontSize: kidsMode ? '1rem' : '.9rem',
                  fontFamily: 'Poppins, sans-serif', lineHeight: 1.6,
                  resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                  marginBottom: 16,
                }}
              />

              {error && (
                <div style={{
                  background: 'var(--red-bg)', color: 'var(--red)',
                  borderRadius: 10, padding: '10px 14px',
                  fontSize: '.82rem', fontWeight: 600, marginBottom: 14,
                }}>
                  ⚠️ {error}
                </div>
              )}

              <button
                onClick={generate}
                disabled={loading || !situation.trim()}
                style={{
                  width: '100%', padding: kidsMode ? '16px' : '13px',
                  borderRadius: 14,
                  background: situation.trim() ? 'linear-gradient(135deg,#8B5CF6,#6D28D9)' : 'var(--bg3)',
                  color: situation.trim() ? 'white' : 'var(--ink3)',
                  fontWeight: 800, fontSize: kidsMode ? '1.05rem' : '.95rem',
                  border: 'none', cursor: situation.trim() ? 'pointer' : 'not-allowed',
                  boxShadow: situation.trim() ? '0 6px 20px rgba(139,92,246,0.4)' : 'none',
                  transition: 'all .2s', fontFamily: 'Poppins, sans-serif',
                }}
              >
                {loading ? '✨ Creating your parable...' : kidsMode ? '📜 Create My Parable! 🌟' : '📜 Create My Personal Parable'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '56px 24px' }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ fontSize: '4rem', marginBottom: 16 }}
            >
              📜
            </motion.div>
            <div style={{
              fontFamily: "'Baloo 2', cursive", fontWeight: 800,
              fontSize: '1.2rem', color: 'var(--ink)', marginBottom: 8,
            }}>
              {kidsMode ? 'Writing your special story...' : 'Crafting your parable...'}
            </div>
            <p style={{ color: 'var(--ink3)', fontSize: '.85rem' }}>
              "He spoke to them in parables..." — Matthew 13:3
            </p>
          </motion.div>
        )}

        {/* Result */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Celebration banner */}
              {celebrated && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    background: 'linear-gradient(135deg,#FEF3C7,#FDE68A)',
                    border: '2px solid #F59E0B',
                    borderRadius: 18, padding: '16px 20px',
                    textAlign: 'center', marginBottom: 20,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  }}
                >
                  <span style={{ fontSize: '1.8rem' }}>🏅</span>
                  <div>
                    <div style={{ fontWeight: 800, color: '#92400E', fontSize: '.95rem' }}>
                      {hasBadge('parable_maker') ? 'Parable Maker badge earned! 🎉' : 'Your parable is ready!'}
                    </div>
                    <div style={{ fontSize: '.75rem', color: '#B45309' }}>
                      {kidsMode ? 'You did it! God loves your heart. ✨' : 'You\'ve earned the Parable Maker badge — keep exploring!'}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Parable card */}
              <div style={{
                background: 'var(--surface)', borderRadius: 24,
                border: '1.5px solid var(--border)',
                overflow: 'hidden', marginBottom: 16,
              }}>
                {/* Header */}
                <div style={{
                  background: 'linear-gradient(135deg,#1E1B4B,#312E81)',
                  padding: '20px 24px',
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
                }}>
                  <div>
                    <div style={{
                      fontFamily: "'Baloo 2', cursive", fontWeight: 800,
                      fontSize: kidsMode ? '1.4rem' : '1.2rem', color: 'white', marginBottom: 4,
                    }}>
                      📜 {result.title}
                    </div>
                    {result.inspiredBy && (
                      <div style={{
                        fontSize: '.72rem', fontWeight: 700, color: 'rgba(165,180,252,0.7)',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        ✝️ Inspired by: {result.inspiredBy}
                      </div>
                    )}
                  </div>
                  <button onClick={copy} style={{
                    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white', borderRadius: 10, padding: '7px 14px',
                    cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
                    fontSize: '.75rem', fontWeight: 700, flexShrink: 0,
                  }}>
                    {copied ? '✅ Copied' : '📋 Copy'}
                  </button>
                </div>

                <div style={{ padding: kidsMode ? '24px 22px' : '24px 26px' }}>
                  {/* Story */}
                  {result.story && (
                    <div style={{ marginBottom: 24 }}>
                      {result.story.split('\n\n').filter(Boolean).map((para, i) => (
                        <p key={i} style={{
                          fontSize: kidsMode ? '1rem' : '.9rem',
                          color: 'var(--ink)', lineHeight: 1.85,
                          fontWeight: 500, marginBottom: 12,
                        }}>
                          {para.trim()}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Lesson */}
                  {result.lesson && (
                    <div style={{
                      background: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)',
                      border: '1.5px solid #DDD6FE',
                      borderRadius: 14, padding: '14px 18px', marginBottom: 24,
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                    }}>
                      <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>💡</span>
                      <div>
                        <div style={{ fontSize: '.68rem', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>
                          The Lesson
                        </div>
                        <div style={{ fontSize: kidsMode ? '.95rem' : '.88rem', fontWeight: 700, color: '#4C1D95', lineHeight: 1.6 }}>
                          {result.lesson}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reflection questions */}
                  {(result.r1 || result.r2 || result.r3) && (
                    <div style={{ marginBottom: 24 }}>
                      <div style={{
                        fontFamily: "'Baloo 2', cursive", fontWeight: 800,
                        fontSize: kidsMode ? '1.1rem' : '1rem',
                        color: 'var(--ink)', marginBottom: 12,
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                        🤔 {kidsMode ? 'Think About It!' : 'Reflection Questions'}
                      </div>
                      {[result.r1, result.r2, result.r3].filter(Boolean).map((q, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'flex-start', gap: 10,
                          padding: '10px 14px', borderRadius: 12,
                          background: 'var(--bg2)', marginBottom: 8,
                          border: '1px solid var(--border)',
                        }}>
                          <span style={{
                            width: 24, height: 24, borderRadius: '50%',
                            background: '#8B5CF6', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '.72rem', fontWeight: 800, flexShrink: 0,
                          }}>
                            {i + 1}
                          </span>
                          <span style={{ fontSize: kidsMode ? '.92rem' : '.85rem', color: 'var(--ink2)', lineHeight: 1.6, fontWeight: 500 }}>
                            {q}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Prayer */}
                  {result.prayer && (
                    <div style={{
                      background: 'linear-gradient(135deg,#ECFDF5,#D1FAE5)',
                      border: '1.5px solid #6EE7B7',
                      borderRadius: 14, padding: '16px 18px', marginBottom: 20,
                    }}>
                      <div style={{
                        fontFamily: "'Baloo 2', cursive", fontWeight: 800,
                        fontSize: kidsMode ? '1.05rem' : '.95rem',
                        color: '#065F46', marginBottom: 8,
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                        🙏 {kidsMode ? 'Let\'s Pray Together' : 'A Prayer for You'}
                      </div>
                      <p style={{
                        fontSize: kidsMode ? '.95rem' : '.87rem',
                        color: '#064E3B', lineHeight: 1.75,
                        fontStyle: 'italic', fontWeight: 500, margin: 0,
                      }}>
                        {result.prayer}
                      </p>
                    </div>
                  )}

                  {/* Action step */}
                  {result.action && (
                    <div style={{
                      background: 'linear-gradient(135deg,#FFF7ED,#FFEDD5)',
                      border: '1.5px solid #FED7AA',
                      borderRadius: 14, padding: '14px 18px',
                    }}>
                      <div style={{
                        fontFamily: "'Baloo 2', cursive", fontWeight: 800,
                        fontSize: kidsMode ? '1.05rem' : '.95rem',
                        color: '#C2410C', marginBottom: 6,
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                        🎯 {kidsMode ? 'Your Challenge Today!' : 'Action Step'}
                      </div>
                      <p style={{
                        fontSize: kidsMode ? '.95rem' : '.87rem',
                        color: '#7C2D12', lineHeight: 1.7,
                        fontWeight: 600, margin: 0,
                      }}>
                        {result.action}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => { setResult(null); setSituation(''); setCelebrated(false); }}
                  style={{
                    flex: 1, padding: '12px', borderRadius: 12,
                    background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)',
                    color: 'white', fontWeight: 800, fontSize: '.9rem',
                    border: 'none', cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
                    boxShadow: '0 4px 14px rgba(139,92,246,0.35)',
                  }}
                >
                  📜 Create Another Parable
                </button>
                <Link to="/ai" style={{
                  flex: 1, padding: '12px', borderRadius: 12,
                  background: 'var(--surface)', color: 'var(--ink2)',
                  fontWeight: 700, fontSize: '.9rem', textDecoration: 'none',
                  border: '1.5px solid var(--border)', textAlign: 'center',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  ← Back to AI Fun
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes sparkle { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.2)} }
      `}</style>
    </div>
  );
}
