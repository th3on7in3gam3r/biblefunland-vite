import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as db from '../lib/db';

export default function OnboardingModal() {
  const { user, profile, refreshProfile } = useAuth();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('General');
  const [goal, setGoal] = useState('');
  const [readingPlan, setReadingPlan] = useState('');
  const [saving, setSaving] = useState(false);

  // Show modal only on first sign-in (no role set yet)
  useEffect(() => {
    if (user?.id && profile && !profile.role) {
      setShow(true);
    }
  }, [user?.id, profile]);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      // Save role, goal, and reading plan to database (persists across devices)
      await db.upsertProfile(user.id, { role, goal, reading_plan });

      // Also save to localStorage for quick access
      localStorage.setItem('bfl_goal', goal);
      localStorage.setItem('bfl_reading_plan', readingPlan);

      // Refresh profile to update UI
      await refreshProfile();

      setShow(false);
    } catch (err) {
      console.error('Onboarding save error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 999,
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          background: 'var(--surface)',
          borderRadius: 24,
          border: '1.5px solid var(--border)',
          padding: '40px 32px',
          maxWidth: 500,
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>✝️</div>
          <h2
            style={{
              fontFamily: "'Baloo 2',cursive",
              fontSize: '1.8rem',
              fontWeight: 800,
              color: 'var(--ink)',
              margin: '0 0 8px 0',
            }}
          >
            Welcome to BibleFunLand!
          </h2>
          <p style={{ fontSize: '.9rem', color: 'var(--ink3)', fontWeight: 500, margin: 0 }}>
            Step {step} of 3 — Let's get you set up
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: s <= step ? 'linear-gradient(135deg,#667eea,#764ba2)' : 'var(--border)',
                transition: 'all .3s',
              }}
            />
          ))}
        </div>

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div>
            <h3
              style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 16 }}
            >
              What's your role?
            </h3>
            <p style={{ fontSize: '.85rem', color: 'var(--ink3)', marginBottom: 20 }}>
              This helps us personalize your experience
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { value: 'General', label: '👤 Just Me', desc: 'Personal Bible learning' },
                { value: 'Parent', label: '👨‍👩‍👧 Parent', desc: 'Manage child profiles' },
                { value: 'Teacher', label: '🏫 Teacher', desc: 'Classroom management' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRole(opt.value)}
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    border: `2px solid ${role === opt.value ? 'var(--blue)' : 'var(--border)'}`,
                    background: role === opt.value ? 'var(--blue-bg)' : 'var(--bg2)',
                    color: role === opt.value ? 'var(--blue)' : 'var(--ink)',
                    cursor: 'pointer',
                    transition: 'all .2s',
                    textAlign: 'left',
                    fontFamily: 'Poppins,sans-serif',
                    fontWeight: 600,
                  }}
                >
                  <div style={{ fontSize: '1.1rem', marginBottom: 4 }}>{opt.label}</div>
                  <div style={{ fontSize: '.75rem', opacity: 0.7 }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Goal Setting */}
        {step === 2 && (
          <div>
            <h3
              style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 16 }}
            >
              What's your goal?
            </h3>
            <p style={{ fontSize: '.85rem', color: 'var(--ink3)', marginBottom: 20 }}>
              Pick what matters most to you
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { value: 'daily-reading', label: '📖 Daily Bible Reading', emoji: '📖' },
                { value: 'memorize', label: '🧠 Memorize Scripture', emoji: '🧠' },
                { value: 'understand', label: '🤔 Understand the Bible', emoji: '🤔' },
                { value: 'grow-faith', label: '🙏 Grow My Faith', emoji: '🙏' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setGoal(opt.value)}
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    border: `2px solid ${goal === opt.value ? 'var(--green)' : 'var(--border)'}`,
                    background: goal === opt.value ? 'rgba(16,185,129,.1)' : 'var(--bg2)',
                    color: goal === opt.value ? 'var(--green)' : 'var(--ink)',
                    cursor: 'pointer',
                    transition: 'all .2s',
                    textAlign: 'left',
                    fontFamily: 'Poppins,sans-serif',
                    fontWeight: 600,
                  }}
                >
                  <span style={{ fontSize: '1.1rem', marginRight: 8 }}>{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Reading Plan */}
        {step === 3 && (
          <div>
            <h3
              style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: 16 }}
            >
              Pick a reading plan
            </h3>
            <p style={{ fontSize: '.85rem', color: 'var(--ink3)', marginBottom: 20 }}>
              Start your journey today
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { value: 'ot-nt', label: '📚 Old & New Testament', desc: 'Full Bible in 1 year' },
                { value: 'gospels', label: '✝️ The Gospels', desc: 'Life of Jesus' },
                { value: 'psalms', label: '🎵 Psalms & Proverbs', desc: 'Wisdom & worship' },
                { value: 'topical', label: '🎯 Topical Study', desc: 'Themes that matter' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setReadingPlan(opt.value)}
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    border: `2px solid ${readingPlan === opt.value ? 'var(--violet)' : 'var(--border)'}`,
                    background: readingPlan === opt.value ? 'rgba(139,92,246,.1)' : 'var(--bg2)',
                    color: readingPlan === opt.value ? 'var(--violet)' : 'var(--ink)',
                    cursor: 'pointer',
                    transition: 'all .2s',
                    textAlign: 'left',
                    fontFamily: 'Poppins,sans-serif',
                    fontWeight: 600,
                  }}
                >
                  <div style={{ marginBottom: 4 }}>{opt.label}</div>
                  <div style={{ fontSize: '.75rem', opacity: 0.7 }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          {step > 1 && (
            <button
              onClick={handleBack}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: 12,
                border: '1.5px solid var(--border)',
                background: 'var(--bg2)',
                color: 'var(--ink)',
                cursor: 'pointer',
                fontWeight: 700,
                fontFamily: 'Poppins,sans-serif',
                transition: 'all .2s',
              }}
            >
              ← Back
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={handleNext}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg,#667eea,#764ba2)',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 700,
                fontFamily: 'Poppins,sans-serif',
                transition: 'all .2s',
              }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={saving}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: 12,
                border: 'none',
                background: saving ? 'var(--border)' : 'linear-gradient(135deg,#10b981,#059669)',
                color: 'white',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: 700,
                fontFamily: 'Poppins,sans-serif',
                transition: 'all .2s',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? '⏳ Setting up...' : '✅ Get Started'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
