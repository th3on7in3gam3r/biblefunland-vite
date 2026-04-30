import { useState, useRef } from 'react';
import { generateAIContent } from '../lib/ai';

const AGE_GROUPS = [
  'Preschoolers (ages 3-5)',
  'Elementary Kids (ages 6-10)',
  'Youth/Teens (ages 11-17)',
  'Adults (ages 18+)',
  'Multi-Generational',
];
const SCENE_OPTIONS = [
  '1 Scene (Mini Skit)',
  '2 Scenes',
  '3 Scenes (Full Play)',
  'Continuous (Flowing)',
];
const LENGTH_OPTIONS = ['3-5 Minutes (Short)', '10 Minutes (Standard)', '15+ Minutes (Extended)'];

const SYSTEM_PROMPT = `You are a professional Christian playwright and theater director with decades of experience writing for Sunday school, Vacation Bible School (VBS), and church drama teams. 

Your goal is to generate a complete, high-quality drama script based on a specific Bible story or theme.

Format the output EXACTLY as follows using these headers:

🎭 SCRIPT OVERVIEW
[A 2-3 sentence summary of the play's core message and dramatic arc.]

👥 CAST OF CHARACTERS
- [Character Name]: [Brief personality description and actor age/type]
- [Character Name]: [Brief personality description]
(Note: Include suggestions for doubling roles if cast is small.)

👗 COSTUME & SET SUGGESTIONS
[Practical, low-budget suggestions for costumes, props, and simple stage backgrounds.]

🎬 SCRIPT: [The Title]
[Scene Number] — [Location/Setting]
[Stage directions in brackets: e.g., (PETER enters stage left, looking worried)]
[Character Name]: [Dialogue]

(Continue until all scenes are complete.)

💡 DIRECTOR'S NOTES
[2-3 tips on pacing, emotional tone, or key blocking moments.]

🙏 DISCUSSION GUIDE
[3-4 questions based on the script to help the audience or actors process the Biblical message.]

Guidelines:
1. Age Appropriateness: Ensure the vocabulary and humor fit the specified age group.
2. Biblical Accuracy: Stay true to the heart of the scripture while using creative license for dialogue and stage action.
3. Stage Directions: Include clear instructions for movement and emotion.
4. Engaging: Make it lively—limit long monologues unless specifically for an adult audience.`;

export default function BibleDramaScripts() {
  const [story, setStory] = useState('');
  const [ageGroup, setAgeGroup] = useState('Elementary Kids (ages 6-10)');
  const [scenes, setScenes] = useState('1 Scene (Mini Skit)');
  const [length, setLength] = useState('3-5 Minutes (Short)');
  const [actors, setActors] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const resultRef = useRef(null);

  async function handleGenerate() {
    if (!story.trim()) {
      setError('Please enter a Bible story or theme (e.g., "The Good Samaritan").');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    const userPrompt = `Write a Bible drama script for the story of "${story}".
Target Audience: ${ageGroup}
Number of Scenes: ${scenes}
Approximate Length: ${length}
Available Actors/Cast Size: ${actors || 'Flexible/Variable'}
Include stage directions, costume ideas, and a discussion guide.`;

    try {
      const text = await generateAIContent({
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
        max_tokens: 3500,
      });

      if (text) {
        setResult(text);
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      } else {
        setError('Generation failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Connection to the AI script engine failed.');
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  function renderScript(text) {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (/^🎭|^👥|^👗|^🎬|^💡|^🙏/.test(trimmed)) {
        return (
          <div
            key={i}
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: '1.2rem',
              fontWeight: 800,
              color: 'var(--violet)',
              margin: '30px 0 12px',
              paddingBottom: 10,
              borderBottom: '2px solid var(--border)',
            }}
          >
            {line}
          </div>
        );
      }
      if (/^\[Scene|^Scene \d/.test(trimmed)) {
        return (
          <div
            key={i}
            style={{
              fontSize: '.85rem',
              fontWeight: 800,
              color: 'var(--blue)',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginTop: 24,
              marginBottom: 8,
              background: 'var(--blue-bg)',
              padding: '4px 12px',
              borderRadius: 6,
              display: 'inline-block',
            }}
          >
            {line}
          </div>
        );
      }
      if (trimmed.startsWith('- ')) {
        return (
          <div
            key={i}
            style={{
              fontSize: '.9rem',
              color: 'var(--ink2)',
              fontWeight: 500,
              paddingLeft: 12,
              marginBottom: 6,
            }}
          >
            {line}
          </div>
        );
      }
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        return (
          <div
            key={i}
            style={{
              fontSize: '.82rem',
              color: 'var(--ink3)',
              fontStyle: 'italic',
              margin: '4px 0 12px',
              paddingLeft: 20,
            }}
          >
            {line}
          </div>
        );
      }
      if (line.includes(':')) {
        const [name, dialogue] = line.split(':');
        if (name.length < 25 && /^[A-Z]/.test(name.trim())) {
          return (
            <div key={i} style={{ marginBottom: 12 }}>
              <span
                style={{
                  fontWeight: 800,
                  color: 'var(--violet)',
                  fontSize: '.85rem',
                  textTransform: 'uppercase',
                  display: 'block',
                }}
              >
                {name.trim()}:
              </span>
              <span
                style={{
                  fontSize: '.95rem',
                  color: 'var(--ink)',
                  fontWeight: 500,
                  lineHeight: 1.6,
                }}
              >
                {dialogue?.trim()}
              </span>
            </div>
          );
        }
      }
      if (!trimmed) return <div key={i} style={{ height: 12 }} />;
      return (
        <div
          key={i}
          style={{
            fontSize: '.95rem',
            color: 'var(--ink)',
            lineHeight: 1.7,
            fontWeight: 500,
            marginBottom: 8,
          }}
        >
          {line}
        </div>
      );
    });
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <div
        style={{
          background: 'linear-gradient(135deg,#1E1B4B,#312E81)',
          padding: '60px 36px 44px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            fontSize: '.7rem',
            fontWeight: 700,
            background: 'rgba(255,255,255,.1)',
            color: '#C7D2FE',
            padding: '4px 14px',
            borderRadius: 100,
            marginBottom: 16,
          }}
        >
          🎭 Professional Scripts in Seconds · Save $50 on Curriculum
        </div>
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(2.2rem,5.5vw,3.6rem)',
            fontWeight: 800,
            background: 'linear-gradient(90deg,#C7D2FE,#FDE68A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 12,
          }}
        >
          Bible Drama Scripts
        </h1>
        <p
          style={{
            color: 'rgba(255,255,255,.5)',
            fontSize: '.95rem',
            fontWeight: 500,
            maxWidth: '700px',
            margin: '0 auto',
          }}
        >
          Generate custom theater scripts for Sunday school or your next VBS. Tailored for any age,
          cast size, and performance length.
        </p>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '44px 24px' }}>
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 28,
            border: '2px solid var(--border)',
            boxShadow: 'var(--sh)',
            padding: '36px',
          }}
        >
          <div style={{ marginBottom: 28 }}>
            <label
              style={{
                fontSize: '.78rem',
                fontWeight: 800,
                color: 'var(--ink2)',
                textTransform: 'uppercase',
                letterSpacing: 1,
                display: 'block',
                marginBottom: 12,
              }}
            >
              1. The Story or Theme
            </label>
            <input
              className="input-field"
              placeholder='e.g. "The Prodigal Son", "Esther Saves Her People", or "The Fruit of the Spirit"'
              value={story}
              onChange={(e) => setStory(e.target.value)}
              style={{ padding: '16px 20px', fontSize: '1rem' }}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 24,
              marginBottom: 28,
            }}
          >
            <div>
              <label
                style={{
                  fontSize: '.78rem',
                  fontWeight: 800,
                  color: 'var(--ink3)',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  display: 'block',
                  marginBottom: 10,
                }}
              >
                2. Age Group
              </label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="input-field"
                style={{ padding: '10px' }}
              >
                {AGE_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  fontSize: '.78rem',
                  fontWeight: 800,
                  color: 'var(--ink3)',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  display: 'block',
                  marginBottom: 10,
                }}
              >
                3. Scenes
              </label>
              <select
                value={scenes}
                onChange={(e) => setScenes(e.target.value)}
                className="input-field"
                style={{ padding: '10px' }}
              >
                {SCENE_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  fontSize: '.78rem',
                  fontWeight: 800,
                  color: 'var(--ink3)',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  display: 'block',
                  marginBottom: 10,
                }}
              >
                4. Target Length
              </label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="input-field"
                style={{ padding: '10px' }}
              >
                {LENGTH_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <label
              style={{
                fontSize: '.78rem',
                fontWeight: 800,
                color: 'var(--ink2)',
                textTransform: 'uppercase',
                letterSpacing: 1,
                display: 'block',
                marginBottom: 12,
              }}
            >
              5. Cast Details (Optional)
            </label>
            <input
              className="input-field"
              placeholder='e.g. "4 boys, 2 girls", "15 total actors", "Flexible cast size"'
              value={actors}
              onChange={(e) => setActors(e.target.value)}
            />
          </div>

          <button
            className="btn btn-violet"
            onClick={handleGenerate}
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '1.1rem',
              borderRadius: 18,
              boxShadow: '0 8px 30px rgba(99,102,241,.3)',
            }}
          >
            {loading ? '🎭 Writing Script...' : '🎬 Generate Bible Script'}
          </button>

          {error && (
            <div
              style={{
                marginTop: 16,
                color: 'var(--red)',
                background: 'var(--red-bg)',
                padding: '12px 16px',
                borderRadius: 12,
                fontSize: '.88rem',
                fontWeight: 600,
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}
            >
              ⚠️ {error}
            </div>
          )}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div
              style={{
                fontSize: '4rem',
                marginBottom: 16,
                animation: 'curtain 1.5s ease-in-out infinite',
              }}
            >
              🎭
            </div>
            <p style={{ fontSize: '1.1rem', color: 'var(--ink)', fontWeight: 700 }}>
              Curtains opening...
            </p>
            <p style={{ fontSize: '.85rem', color: 'var(--ink2)', marginTop: 6 }}>
              Claude is writing your scene-by-scene script
            </p>
          </div>
        )}

        {result && !loading && (
          <div
            ref={resultRef}
            style={{
              marginTop: 32,
              background: 'var(--surface)',
              borderRadius: 28,
              border: '2px solid var(--border)',
              overflow: 'hidden',
              boxShadow: 'var(--sh-lg)',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg,#312E81,#1E1B4B)',
                padding: '20px 32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: 'white',
                }}
              >
                🎭 {story}: {scenes}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={copyToClipboard}
                  style={{
                    background: 'rgba(255,255,255,.15)',
                    border: '1px solid rgba(255,255,255,.2)',
                    color: 'white',
                    borderRadius: 12,
                    padding: '8px 18px',
                    cursor: 'pointer',
                    fontFamily: 'Poppins,sans-serif',
                    fontSize: '.8rem',
                    fontWeight: 700,
                    transition: 'all .25s',
                  }}
                >
                  {copied ? '✅ Copied' : '📋 Copy All'}
                </button>
                <button
                  onClick={handleGenerate}
                  style={{
                    background: 'rgba(255,255,255,.08)',
                    border: 'none',
                    color: 'rgba(255,255,255,.6)',
                    borderRadius: 12,
                    padding: '8px 18px',
                    cursor: 'pointer',
                    fontFamily: 'Poppins,sans-serif',
                    fontSize: '.8rem',
                    fontWeight: 700,
                  }}
                >
                  ↺ Rewrite
                </button>
              </div>
            </div>
            <div style={{ padding: '40px' }}>{renderScript(result)}</div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes curtain {
          0%, 100% { transform: scaleX(1); }
          50% { transform: scaleX(1.15); filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2)); }
        }
      `}</style>
    </div>
  );
}
