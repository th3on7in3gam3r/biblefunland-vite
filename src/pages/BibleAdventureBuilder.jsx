import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAIContent } from '../lib/ai';
import { useBadges } from '../context/BadgeContext';
import { useKidsMode } from '../context/KidsModeContext';
import { HEROES, QUESTION_TEMPLATES } from '../data/adventureHeroes';

// ── AI system prompt ──────────────────────────────────────────────────────────
const buildSystem = () => `You are a master Bible storyteller creating an interactive adventure for children and families.

Write a short, branching adventure story in the warm, parable-like style of Jesus. Use vivid, age-appropriate language with short paragraphs and dialogue.

Use EXACTLY this format with labels on their own lines:

ADVENTURE_TITLE: [Creative, exciting title]
OPENING:
[2 short paragraphs setting the scene. Vivid, exciting, warm. End with the hero facing the challenge.]

CHOICE_1_QUESTION: [A decision the child must make — 1 sentence]
CHOICE_1_A: [Option A — brave/faithful path]
CHOICE_1_B: [Option B — cautious/different path]

PATH_A:
[2 paragraphs — what happens if they chose A. Exciting, faith-affirming.]

PATH_B:
[2 paragraphs — what happens if they chose B. Still positive, shows God's grace.]

CHOICE_2_QUESTION: [A second decision point]
CHOICE_2_A: [Option A]
CHOICE_2_B: [Option B]

CLIMAX:
[2 paragraphs — the hero faces the ultimate challenge. The Bible verse gives them courage. God shows up powerfully.]

VICTORY:
[1-2 paragraphs — the resolution. Warm, triumphant, faith-filled. The helper played a key role.]

BIBLE_TRUTH: [One sentence — the core spiritual truth of this adventure]

REFLECTION_1: [Simple question for the child]
REFLECTION_2: [Question about the hero's choice]
REFLECTION_3: [Application: "How can you be like [hero] this week?"]

CERTIFICATE_TITLE: [Fun title for their adventure certificate, e.g. "Brave Heart of Bethlehem"]

Keep the entire story warm, exciting, Scripture-faithful, and wonder-filled. Maximum 600 words total.`;

// ── Step indicator ────────────────────────────────────────────────────────────
function StepBar({ step, total, kidsMode }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          height: kidsMode ? 8 : 6,
          flex: 1, maxWidth: 60,
          borderRadius: 99,
          background: i < step ? '#8B5CF6' : i === step ? '#C084FC' : 'var(--border)',
          transition: 'background 0.3s',
          boxShadow: i < step ? '0 0 8px rgba(139,92,246,0.4)' : 'none',
        }} />
      ))}
      <span style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--ink3)', marginLeft: 6, whiteSpace: 'nowrap' }}>
        {step + 1}/{total}
      </span>
    </div>
  );
}

// ── Hero card ─────────────────────────────────────────────────────────────────
function HeroCard({ hero, selected, onSelect, kidsMode }) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: `0 16px 40px ${hero.color}30` }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(hero)}
      style={{
        background: selected ? `linear-gradient(135deg,${hero.color}20,${hero.color}08)` : hero.bg,
        borderRadius: 20,
        padding: kidsMode ? '22px 18px' : '18px 16px',
        border: `2px solid ${selected ? hero.color : hero.color + '30'}`,
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'all 0.2s',
        boxShadow: selected ? `0 8px 24px ${hero.color}30` : '0 2px 8px rgba(0,0,0,0.04)',
        position: 'relative',
      }}
    >
      {selected && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          width: 22, height: 22, borderRadius: '50%',
          background: hero.color, color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '.75rem', fontWeight: 800,
        }}>✓</div>
      )}
      <div style={{ fontSize: kidsMode ? '2.8rem' : '2.2rem', marginBottom: 8 }}>{hero.emoji}</div>
      <div style={{
        fontFamily: "'Baloo 2', cursive", fontWeight: 800,
        fontSize: kidsMode ? '1.05rem' : '.95rem', color: '#1E1B4B', marginBottom: 3,
      }}>{hero.name}</div>
      <div style={{
        fontSize: '.65rem', fontWeight: 700, color: hero.color,
        background: `${hero.color}15`, padding: '2px 8px', borderRadius: 99,
        display: 'inline-block',
      }}>{hero.tag}</div>
    </motion.div>
  );
}

// ── Choice button ─────────────────────────────────────────────────────────────
function ChoiceBtn({ label, selected, onClick, color, kidsMode }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        width: '100%', padding: kidsMode ? '14px 18px' : '12px 16px',
        borderRadius: 14, textAlign: 'left',
        border: `2px solid ${selected ? color : 'var(--border)'}`,
        background: selected ? `${color}12` : 'var(--surface)',
        color: selected ? color : 'var(--ink2)',
        fontWeight: selected ? 800 : 600,
        fontSize: kidsMode ? '.95rem' : '.88rem',
        cursor: 'pointer', transition: 'all .15s',
        fontFamily: 'Poppins, sans-serif',
        display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: selected ? `0 4px 14px ${color}25` : 'none',
      }}
    >
      <span style={{
        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
        background: selected ? color : 'var(--bg3)',
        color: selected ? 'white' : 'var(--ink3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '.7rem', fontWeight: 800,
      }}>
        {selected ? '✓' : '○'}
      </span>
      {label}
    </motion.button>
  );
}

// ── Adventure result renderer ─────────────────────────────────────────────────
function AdventureResult({ result, hero, answers, kidsMode, onRestart, onPrint }) {
  const [choice1, setChoice1] = useState(null);
  const [choice2, setChoice2] = useState(null);

  const sections = [
    { key: 'OPENING', label: '📖 The Adventure Begins', color: '#3B82F6' },
    { key: choice1 === 'A' ? 'PATH_A' : 'PATH_B', label: choice1 === 'A' ? '⚡ The Brave Path' : '🌿 The Careful Path', color: '#10B981' },
    { key: 'CLIMAX', label: '🔥 The Greatest Challenge', color: '#F97316' },
    { key: 'VICTORY', label: '🏆 Victory!', color: '#F59E0B' },
  ];

  function getSection(key) {
    const regex = new RegExp(`${key}:\\s*([\\s\\S]+?)(?=\\n[A-Z_]+:|$)`, 'i');
    return result.match(regex)?.[1]?.trim() || '';
  }

  function getLine(key) {
    return result.match(new RegExp(`${key}:\\s*(.+)`, 'i'))?.[1]?.trim() || '';
  }

  const c1q = getLine('CHOICE_1_QUESTION');
  const c1a = getLine('CHOICE_1_A');
  const c1b = getLine('CHOICE_1_B');
  const c2q = getLine('CHOICE_2_QUESTION');
  const c2a = getLine('CHOICE_2_A');
  const c2b = getLine('CHOICE_2_B');
  const bibleTruth = getLine('BIBLE_TRUTH');
  const certTitle = getLine('CERTIFICATE_TITLE');
  const r1 = getLine('REFLECTION_1');
  const r2 = getLine('REFLECTION_2');
  const r3 = getLine('REFLECTION_3');
  const title = getLine('ADVENTURE_TITLE');

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Title */}
      <div style={{
        background: `linear-gradient(135deg,${hero.color}20,${hero.color}08)`,
        border: `2px solid ${hero.color}30`,
        borderRadius: 20, padding: '20px 24px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <span style={{ fontSize: '2.5rem' }}>{hero.emoji}</span>
        <div>
          <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: kidsMode ? '1.3rem' : '1.15rem', color: '#1E1B4B' }}>
            {title || `${hero.name}'s Adventure`}
          </div>
          <div style={{ fontSize: '.72rem', fontWeight: 700, color: hero.color }}>
            ✝️ {hero.verse} · {hero.era}
          </div>
        </div>
      </div>

      {/* Opening */}
      <StorySection text={getSection('OPENING')} label="📖 The Adventure Begins" color="#3B82F6" kidsMode={kidsMode} />

      {/* Choice 1 */}
      {c1q && (
        <ChoicePoint
          question={c1q} optA={c1a} optB={c1b}
          selected={choice1} onSelect={setChoice1}
          color={hero.color} kidsMode={kidsMode} num={1}
        />
      )}

      {/* Path */}
      {choice1 && (
        <StorySection
          text={getSection(choice1 === 'A' ? 'PATH_A' : 'PATH_B')}
          label={choice1 === 'A' ? '⚡ The Brave Path' : '🌿 The Careful Path'}
          color="#10B981" kidsMode={kidsMode}
        />
      )}

      {/* Choice 2 */}
      {choice1 && c2q && (
        <ChoicePoint
          question={c2q} optA={c2a} optB={c2b}
          selected={choice2} onSelect={setChoice2}
          color={hero.color} kidsMode={kidsMode} num={2}
        />
      )}

      {/* Climax + Victory */}
      {choice2 && <>
        <StorySection text={getSection('CLIMAX')} label="🔥 The Greatest Challenge" color="#F97316" kidsMode={kidsMode} />
        <StorySection text={getSection('VICTORY')} label="🏆 Victory!" color="#F59E0B" kidsMode={kidsMode} />
      </>}

      {/* Bible Truth */}
      {choice2 && bibleTruth && (
        <div style={{
          background: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)',
          border: '2px solid #DDD6FE', borderRadius: 16,
          padding: '16px 20px', marginBottom: 16,
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <span style={{ fontSize: '1.4rem' }}>💡</span>
          <div>
            <div style={{ fontSize: '.65rem', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Bible Truth</div>
            <div style={{ fontSize: kidsMode ? '.95rem' : '.88rem', fontWeight: 700, color: '#4C1D95', lineHeight: 1.6 }}>{bibleTruth}</div>
          </div>
        </div>
      )}

      {/* Reflection */}
      {choice2 && (r1 || r2 || r3) && (
        <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 16, padding: '18px 20px', marginBottom: 16 }}>
          <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: kidsMode ? '1.05rem' : '.95rem', color: 'var(--ink)', marginBottom: 12 }}>
            🤔 {kidsMode ? 'Think About It!' : 'Reflection Questions'}
          </div>
          {[r1, r2, r3].filter(Boolean).map((q, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '9px 12px', borderRadius: 10, background: 'var(--bg2)', marginBottom: 8, border: '1px solid var(--border)' }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: hero.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
              <span style={{ fontSize: kidsMode ? '.9rem' : '.83rem', color: 'var(--ink2)', lineHeight: 1.6, fontWeight: 500 }}>{q}</span>
            </div>
          ))}
        </div>
      )}

      {/* Certificate */}
      {choice2 && (
        <div style={{
          background: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)',
          border: '2px solid #F59E0B', borderRadius: 20,
          padding: '24px', textAlign: 'center', marginBottom: 20,
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>🏅</div>
          <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: kidsMode ? '1.2rem' : '1.05rem', color: '#92400E', marginBottom: 4 }}>
            Adventure Certificate
          </div>
          <div style={{ fontSize: kidsMode ? '1rem' : '.9rem', fontWeight: 700, color: '#B45309', marginBottom: 8 }}>
            "{certTitle || `${hero.name}'s Brave Journey`}"
          </div>
          <div style={{ fontSize: '.75rem', color: '#D97706', marginBottom: 16 }}>
            Completed on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <button onClick={onPrint} style={{
            padding: '10px 22px', borderRadius: 12,
            background: 'linear-gradient(135deg,#F59E0B,#D97706)',
            color: 'white', fontWeight: 800, fontSize: '.85rem',
            border: 'none', cursor: 'pointer', fontFamily: 'Poppins,sans-serif',
            boxShadow: '0 4px 14px rgba(245,158,11,0.4)',
          }}>
            🖨️ Print Certificate
          </button>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={onRestart} style={{
          flex: 1, padding: '12px', borderRadius: 12,
          background: `linear-gradient(135deg,${hero.color},${hero.color}cc)`,
          color: 'white', fontWeight: 800, fontSize: '.9rem',
          border: 'none', cursor: 'pointer', fontFamily: 'Poppins,sans-serif',
          boxShadow: `0 4px 14px ${hero.color}40`,
        }}>
          🗺️ New Adventure
        </button>
        <Link to="/ai" style={{
          flex: 1, padding: '12px', borderRadius: 12,
          background: 'var(--surface)', color: 'var(--ink2)',
          fontWeight: 700, fontSize: '.9rem', textDecoration: 'none',
          border: '1.5px solid var(--border)', textAlign: 'center',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          ← AI Fun Hub
        </Link>
      </div>
    </motion.div>
  );
}

function StorySection({ text, label, color, kidsMode }) {
  if (!text) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: kidsMode ? '1.05rem' : '.95rem', color, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        {label}
      </div>
      <div style={{ background: 'var(--surface)', border: `1.5px solid ${color}20`, borderLeft: `3px solid ${color}`, borderRadius: '0 14px 14px 0', padding: '16px 18px' }}>
        {text.split('\n\n').filter(Boolean).map((p, i) => (
          <p key={i} style={{ fontSize: kidsMode ? '.95rem' : '.88rem', color: 'var(--ink)', lineHeight: 1.85, fontWeight: 500, margin: '0 0 10px' }}>{p.trim()}</p>
        ))}
      </div>
    </div>
  );
}

function ChoicePoint({ question, optA, optB, selected, onSelect, color, kidsMode, num }) {
  return (
    <div style={{ background: `${color}08`, border: `2px solid ${color}25`, borderRadius: 18, padding: '18px 20px', marginBottom: 16 }}>
      <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: kidsMode ? '1.05rem' : '.95rem', color, marginBottom: 12 }}>
        🎯 {kidsMode ? `Your Choice #${num}!` : `Decision Point ${num}`}
      </div>
      <p style={{ fontSize: kidsMode ? '.95rem' : '.88rem', fontWeight: 600, color: 'var(--ink)', marginBottom: 12, lineHeight: 1.6 }}>{question}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {optA && <ChoiceBtn label={optA} selected={selected === 'A'} onClick={() => onSelect('A')} color={color} kidsMode={kidsMode} />}
        {optB && <ChoiceBtn label={optB} selected={selected === 'B'} onClick={() => onSelect('B')} color={color} kidsMode={kidsMode} />}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function BibleAdventureBuilder() {
  const { awardBadge, hasBadge } = useBadges();
  const { kidsMode } = useKidsMode();
  const printRef = useRef(null);

  const [step, setStep] = useState(0); // 0=hero, 1=challenge, 2=helper, 3=verse, 4=decision
  const [hero, setHero] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const TOTAL_STEPS = 6; // hero + 4 questions + generate

  function selectHero(h) { setHero(h); setAnswers({}); }

  function setAnswer(key, val) { setAnswers(a => ({ ...a, [key]: val })); }

  function canAdvance() {
    if (step === 0) return !!hero;
    const q = QUESTION_TEMPLATES[step - 1];
    return !!answers[q?.id];
  }

  function advance() {
    if (step < QUESTION_TEMPLATES.length) { setStep(s => s + 1); return; }
    generate();
  }

  async function generate() {
    setLoading(true);
    setError('');
    const q = QUESTION_TEMPLATES;
    const prompt = `Bible Hero: ${hero.name}
Setting: ${hero.setting}
Challenge: ${answers[q[0].id]}
Helper: ${answers[q[1].id]}
Courage Verse: ${answers[q[2].id]}
Child's Decision: ${answers[q[3].id]}

Create a branching Bible adventure story for this hero and situation.`;

    try {
      const text = await generateAIContent({
        system: buildSystem(),
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1400,
      });
      if (!text) { setError('Try again — something went wrong.'); setLoading(false); return; }
      setResult(text);
      if (!hasBadge('adventure_builder')) awardBadge('adventure_builder');
    } catch (err) {
      setError(err.message || 'Connection failed. Please try again.');
    }
    setLoading(false);
  }

  function restart() { setStep(0); setHero(null); setAnswers({}); setResult(null); setError(''); }

  function handlePrint() {
    window.print();
  }

  const currentQ = step > 0 && step <= QUESTION_TEMPLATES.length ? QUESTION_TEMPLATES[step - 1] : null;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>

      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg,#1E1B4B 0%,#312E81 40%,#064E3B 100%)',
        padding: kidsMode ? '52px 24px 44px' : '60px 24px 48px',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {[['#8B5CF6','8%','10%'],['#10B981','88%','25%'],['#F59E0B','45%','78%']].map(([c,l,t],i) => (
          <div key={i} style={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', background: `radial-gradient(circle,${c}20 0%,transparent 70%)`, left: l, top: t, pointerEvents: 'none' }} />
        ))}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ position: 'relative', zIndex: 1 }}>
          <motion.div animate={{ rotate: [0, -8, 8, -4, 0] }} transition={{ repeat: Infinity, duration: 5 }} style={{ fontSize: kidsMode ? '4rem' : '3.2rem', marginBottom: 14, display: 'inline-block', filter: 'drop-shadow(0 4px 20px rgba(139,92,246,0.5))' }}>
            🗺️
          </motion.div>
          <h1 style={{
            fontFamily: "'Baloo 2', cursive", fontWeight: 800,
            fontSize: kidsMode ? 'clamp(2rem,6vw,3rem)' : 'clamp(1.8rem,4.5vw,2.8rem)',
            background: 'linear-gradient(90deg,#A5B4FC,#6EE7B7,#FCD34D)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text', marginBottom: 10, lineHeight: 1.1,
          }}>
            {kidsMode ? '🌟 Bible Adventure Builder! 🌟' : 'Bible Adventure Builder'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: kidsMode ? '1rem' : '.92rem', maxWidth: 500, margin: '0 auto 16px', lineHeight: 1.75, fontWeight: 500 }}>
            {kidsMode
              ? 'Pick a Bible hero, answer some fun questions, and go on an amazing adventure! 🎉'
              : 'Choose a Bible hero, answer a few questions, and AI creates a personalized branching adventure story — just for you.'}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '.7rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#A5B4FC', background: 'rgba(165,180,252,0.12)', border: '1px solid rgba(165,180,252,0.25)', padding: '5px 14px', borderRadius: 100 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 8px #4ADE80', display: 'inline-block' }} />
              8 Heroes · Branching Story · Your Choices Matter
            </span>
            {!hasBadge('adventure_builder') && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '.7rem', fontWeight: 800, color: '#FCD34D', background: 'rgba(252,211,77,0.12)', border: '1px solid rgba(252,211,77,0.25)', padding: '5px 14px', borderRadius: 100 }}>
                🏅 Earn the Adventure Builder badge
              </span>
            )}
          </div>
        </motion.div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* Result view */}
        {result && !loading && (
          <AdventureResult result={result} hero={hero} answers={answers} kidsMode={kidsMode} onRestart={restart} onPrint={handlePrint} />
        )}

        {/* Loading */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '64px 24px' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: 'linear' }} style={{ fontSize: '4rem', marginBottom: 16, display: 'inline-block' }}>🗺️</motion.div>
            <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: '1.3rem', color: 'var(--ink)', marginBottom: 8 }}>
              {kidsMode ? 'Building your adventure...' : 'Crafting your adventure...'}
            </div>
            <p style={{ color: 'var(--ink3)', fontSize: '.85rem' }}>
              "Your word is a lamp for my feet, a light on my path." — Psalm 119:105
            </p>
          </motion.div>
        )}

        {/* Step flow */}
        {!result && !loading && (
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>

              <StepBar step={step} total={TOTAL_STEPS} kidsMode={kidsMode} />

              {/* Step 0: Hero selection */}
              {step === 0 && (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: kidsMode ? '1.5rem' : '1.3rem', color: 'var(--ink)', marginBottom: 6 }}>
                      {kidsMode ? '👇 Pick your Bible hero!' : 'Step 1: Choose your Bible hero'}
                    </div>
                    <p style={{ fontSize: '.85rem', color: 'var(--ink3)' }}>
                      {kidsMode ? 'Who do you want to go on an adventure with?' : 'Your adventure will be built around this hero\'s story and setting.'}
                    </p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
                    {HEROES.map(h => (
                      <HeroCard key={h.id} hero={h} selected={hero?.id === h.id} onSelect={selectHero} kidsMode={kidsMode} />
                    ))}
                  </div>
                  {hero && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{
                      background: `${hero.color}10`, border: `1.5px solid ${hero.color}30`,
                      borderRadius: 14, padding: '12px 16px', marginBottom: 20,
                      fontSize: '.82rem', color: 'var(--ink2)', lineHeight: 1.6,
                    }}>
                      <strong style={{ color: hero.color }}>{hero.emoji} {hero.name}</strong> — {hero.setting}. Key verse: <em>{hero.verse}</em>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Steps 1–4: Questions */}
              {currentQ && (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: kidsMode ? '1.4rem' : '1.2rem', color: 'var(--ink)', marginBottom: 6 }}>
                      {kidsMode ? currentQ.kidsQuestion(hero) : currentQ.question(hero)}
                    </div>
                  </div>

                  {currentQ.type === 'choice' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                      {(hero[currentQ.id === 'challenge' ? 'challenges' : currentQ.id === 'helper' ? 'helpers' : 'verses'] || []).map((opt, i) => (
                        <ChoiceBtn
                          key={i} label={opt}
                          selected={answers[currentQ.id] === opt}
                          onClick={() => setAnswer(currentQ.id, opt)}
                          color={hero.color} kidsMode={kidsMode}
                        />
                      ))}
                    </div>
                  )}

                  {currentQ.type === 'text' && (
                    <textarea
                      value={answers[currentQ.id] || ''}
                      onChange={e => setAnswer(currentQ.id, e.target.value)}
                      placeholder={kidsMode ? currentQ.kidPlaceholder : currentQ.placeholder}
                      rows={3}
                      style={{
                        width: '100%', padding: '14px 16px', borderRadius: 14,
                        border: '1.5px solid var(--border)', background: 'var(--bg)',
                        color: 'var(--ink)', fontSize: kidsMode ? '1rem' : '.9rem',
                        fontFamily: 'Poppins, sans-serif', lineHeight: 1.6,
                        resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                        marginBottom: 20,
                      }}
                    />
                  )}
                </div>
              )}

              {error && (
                <div style={{ background: 'var(--red-bg)', color: 'var(--red)', borderRadius: 10, padding: '10px 14px', fontSize: '.82rem', fontWeight: 600, marginBottom: 16 }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Nav buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                {step > 0 && (
                  <button onClick={() => setStep(s => s - 1)} style={{
                    padding: '12px 20px', borderRadius: 12, border: '1.5px solid var(--border)',
                    background: 'var(--surface)', color: 'var(--ink2)', fontWeight: 700,
                    fontSize: '.9rem', cursor: 'pointer', fontFamily: 'Poppins,sans-serif',
                  }}>
                    ← Back
                  </button>
                )}
                <button
                  onClick={advance}
                  disabled={!canAdvance()}
                  style={{
                    flex: 1, padding: kidsMode ? '15px' : '12px', borderRadius: 12,
                    background: canAdvance() ? (hero ? `linear-gradient(135deg,${hero.color},${hero.color}cc)` : 'linear-gradient(135deg,#8B5CF6,#6D28D9)') : 'var(--bg3)',
                    color: canAdvance() ? 'white' : 'var(--ink3)',
                    fontWeight: 800, fontSize: kidsMode ? '1rem' : '.95rem',
                    border: 'none', cursor: canAdvance() ? 'pointer' : 'not-allowed',
                    boxShadow: canAdvance() && hero ? `0 6px 20px ${hero.color}40` : 'none',
                    transition: 'all .2s', fontFamily: 'Poppins,sans-serif',
                  }}
                >
                  {step === QUESTION_TEMPLATES.length
                    ? (kidsMode ? '🗺️ Start My Adventure! 🌟' : '🗺️ Build My Adventure')
                    : (kidsMode ? 'Next →' : 'Continue →')}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
