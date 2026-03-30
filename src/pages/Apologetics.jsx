import { useState, useRef, useEffect } from 'react';
import { generateAIContent } from '../lib/ai';

const COMMON_QUESTIONS = [
  'How can a good God allow suffering?',
  'Is the Bible historically reliable?',
  "Doesn't evolutionary science contradict Genesis?",
  'What about people who never heard of Jesus?',
  'How can there be only one way to God?',
  "Wasn't Christianity historically spread by violence?",
];

const SYSTEM_PROMPT = `You are a world-class Christian philosopher and apologist in the intellectual tradition of C.S. Lewis, Tim Keller, and William Lane Craig. 
Your goal is to provide intellectually rigorous, deeply compassionate, and non-defensive answers to the toughest questions about historic Christianity.
Rules:
1. Never sound preachy, combative, or dismissive. Treat the questioner's doubt as a valid intellectual challenge.
2. Acknowledge nuance and the genuine difficulty of the question before providing the Christian response.
3. Structure your response logically using standard Markdown (use ## for headers, **bold** for emphasis, and - for bullet points).
4. Keep answers relatively concise and highly readable (max 350 words). Provide a robust defense of historic Christianity.`;

// Simple recursive regex-based Markdown parser to avoid adding a heavy dependency
function SimpleMarkdown({ text }) {
  if (!text) return null;

  const content = text.split('\n\n').map((paragraph, i) => {
    // Check if it's a header
    if (paragraph.startsWith('### ')) {
      return (
        <h3
          key={i}
          style={{
            fontSize: '1.2rem',
            fontWeight: 800,
            color: 'var(--ink)',
            marginTop: 20,
            marginBottom: 10,
          }}
        >
          {parseInline(paragraph.replace('### ', ''))}
        </h3>
      );
    }
    if (paragraph.startsWith('## ')) {
      return (
        <h2
          key={i}
          style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            color: 'var(--ink)',
            marginTop: 24,
            marginBottom: 12,
          }}
        >
          {parseInline(paragraph.replace('## ', ''))}
        </h2>
      );
    }

    // Check if it's a list (simple detection)
    if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
      const items = paragraph.split('\n').map((item, idx) => {
        const clean = item.replace(/^[-*]\s+/, '');
        return (
          <li key={idx} style={{ marginBottom: 8 }}>
            {parseInline(clean)}
          </li>
        );
      });
      return (
        <ul
          key={i}
          style={{ paddingLeft: 20, color: 'var(--ink2)', lineHeight: 1.6, marginBottom: 16 }}
        >
          {items}
        </ul>
      );
    }

    // Default Paragraph
    return (
      <p key={i} style={{ color: 'var(--ink)', lineHeight: 1.7, marginBottom: 16 }}>
        {parseInline(paragraph)}
      </p>
    );
  });

  return <div className="markdown-content">{content}</div>;
}

function parseInline(text) {
  // Ultra-simple bold parsing `**text**` and italics `*text*`
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{ color: 'var(--ink)' }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} style={{ fontStyle: 'italic' }}>
          {part.slice(1, -1)}
        </em>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function Apologetics() {
  const [question, setQuestion] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState(null);
  const answerRef = useRef(null);

  const askQuestion = async (qText) => {
    if (!qText.trim() || isTyping) return;

    setQuestion(qText);
    setIsTyping(true);
    setAnswer(null);
    setError(null);

    // Scroll down slightly if needed
    setTimeout(() => {
      answerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    try {
      const messages = [{ role: 'user', content: qText }];
      const responseText = await generateAIContent({
        system: SYSTEM_PROMPT,
        messages: messages,
        max_tokens: 600,
      });

      setAnswer(responseText);
    } catch (err) {
      console.error(err);
      setError(
        'We encountered an issue connecting to the defense matrix. Please try asking again.'
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    askQuestion(question);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'Poppins, sans-serif' }}>
      {/* Hero Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F0F1A, #1A1A2E)',
          padding: '60px 20px 80px',
          textAlign: 'center',
          borderBottom: '1px solid var(--border)',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🤔</div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 800,
              color: 'white',
              marginBottom: 16,
            }}
          >
            Ask the Hard Questions
          </h1>
          <p
            style={{
              color: 'rgba(255,255,255,.7)',
              fontSize: '1.1rem',
              lineHeight: 1.6,
              maxWidth: 600,
              margin: '0 auto 40px',
            }}
          >
            "Always be prepared to give an answer to everyone who asks you to give the reason for
            the hope that you have. But do this with gentleness and respect." — 1 Peter 3:15
          </p>

          <form
            onSubmit={handleSubmit}
            style={{
              position: 'relative',
              maxWidth: 600,
              margin: '0 auto',
              transform: 'translateY(40px)',
              zIndex: 10,
            }}
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Why would a loving God..."
              style={{
                width: '100%',
                padding: '24px 80px 24px 30px',
                borderRadius: 100,
                border: 'none',
                fontSize: '1.2rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                outline: 'none',
                background: 'white',
                color: '#111827',
                fontFamily: 'Poppins, sans-serif',
              }}
            />
            <button
              type="submit"
              disabled={!question.trim() || isTyping}
              style={{
                position: 'absolute',
                right: 8,
                top: 8,
                bottom: 8,
                padding: '0 30px',
                borderRadius: 100,
                background: !question.trim() || isTyping ? '#9CA3AF' : 'var(--blue)',
                color: 'white',
                border: 'none',
                fontWeight: 800,
                fontSize: '1.1rem',
                cursor: !question.trim() || isTyping ? 'not-allowed' : 'pointer',
                transition: 'background .2s',
              }}
            >
              Ask
            </button>
          </form>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '80px 20px 100px' }}>
        {/* State 1: Nothing typing, no answer yet (Show Ideas) */}
        {!isTyping && !answer && (
          <div style={{ marginTop: 40 }}>
            <h2
              style={{
                fontSize: '1rem',
                fontWeight: 800,
                color: 'var(--ink3)',
                textTransform: 'uppercase',
                letterSpacing: 2,
                textAlign: 'center',
                marginBottom: 30,
              }}
            >
              Commonly Asked Questions
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 20,
              }}
            >
              {COMMON_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => askQuestion(q)}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    padding: '24px',
                    borderRadius: 16,
                    textAlign: 'left',
                    cursor: 'pointer',
                    boxShadow: 'var(--sh)',
                    transition: 'all .2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--blue)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = '';
                  }}
                >
                  <p
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: 'var(--ink)',
                      lineHeight: 1.4,
                    }}
                  >
                    "{q}"
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* State 2: Loading / Typing */}
        {isTyping && (
          <div
            ref={answerRef}
            style={{
              marginTop: 60,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              background: 'var(--surface)',
              borderRadius: 24,
              border: '1px dashed var(--border)',
            }}
          >
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  background: 'var(--blue)',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite ease-in-out both',
                  animationDelay: '-0.32s',
                }}
              />
              <div
                style={{
                  width: 12,
                  height: 12,
                  background: 'var(--blue)',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite ease-in-out both',
                  animationDelay: '-0.16s',
                }}
              />
              <div
                style={{
                  width: 12,
                  height: 12,
                  background: 'var(--blue)',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s infinite ease-in-out both',
                }}
              />
            </div>
            <p style={{ fontSize: '1.1rem', color: 'var(--ink2)', fontWeight: 600 }}>
              Synthesizing philosophy, theology, and scripture...
            </p>
          </div>
        )}

        {/* State 3: Error */}
        {error && !isTyping && (
          <div
            style={{
              marginTop: 60,
              padding: 30,
              background: '#FEF2F2',
              border: '1px solid #F87171',
              borderRadius: 16,
              textAlign: 'center',
              color: '#B91C1C',
            }}
          >
            <p style={{ fontWeight: 700 }}>{error}</p>
          </div>
        )}

        {/* State 4: The Answer */}
        {answer && !isTyping && (
          <div
            ref={answerRef}
            style={{
              marginTop: 40,
              background: 'var(--surface)',
              borderRadius: 24,
              border: '1px solid var(--border)',
              boxShadow: 'var(--sh)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                background: 'var(--bg2)',
                padding: '24px 40px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <p
                style={{
                  fontSize: '.85rem',
                  fontWeight: 800,
                  color: 'var(--ink3)',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 8,
                }}
              >
                Your Question:
              </p>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ink)' }}>
                "{question}"
              </h2>
            </div>
            <div style={{ padding: '40px', position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  top: 40,
                  left: 24,
                  fontSize: '3rem',
                  opacity: 0.1,
                  color: 'var(--blue)',
                }}
              >
                ❝
              </div>

              {/* Custom Markdown Parser Output */}
              <div style={{ paddingLeft: 30 }}>
                <SimpleMarkdown text={answer} />
              </div>

              <div
                style={{
                  marginTop: 40,
                  paddingTop: 30,
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 20,
                }}
              >
                <p style={{ fontSize: '.85rem', color: 'var(--ink3)', fontStyle: 'italic' }}>
                  Powered by Claude 3.5 Sonnet • Theology Persona
                </p>
                <button
                  onClick={() => {
                    setQuestion('');
                    setAnswer(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--blue)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Ask another question →
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
}
