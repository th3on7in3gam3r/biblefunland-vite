// src/context/KidsModeContext.jsx
// ─────────────────────────────────────────────────────────────────────
// Kids Mode: one-tap switch that transforms BibleFunLand for under-8s
//   • Larger fonts, rounder corners, brighter saturated colors
//   • Hides adult content (Chat Rooms, Encouragement Wall, Blog)
//   • Adds cartoon "Baloo 2" font everywhere
//   • PIN-protected toggle so parents control it
//   • Persists in localStorage
//
// Usage:
//   const { kidsMode, toggleKidsMode } = useKidsMode()
//   {kidsMode ? <KidsVersion /> : <AdultVersion />}
// ─────────────────────────────────────────────────────────────────────

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useClerk } from '@clerk/clerk-react';

const KidsModeContext = createContext(null);
const STORAGE_KEY = 'bfl_kids_mode';
const PIN_KEY = 'bfl_kids_pin';
const DEFAULT_PIN = '1234';

export function KidsModeProvider({ children }) {
  const { profile, user } = useAuth();
  const { user: clerkUser } = useClerk();
  const [kidsMode, setKidsMode] = useState(() => {
    // Check localStorage first, then Clerk metadata
    const local = localStorage.getItem(STORAGE_KEY);
    if (local !== null) return local === 'true';
    return false;
  });
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinAction, setPinAction] = useState(null);

  // Sync from Clerk metadata on login
  useEffect(() => {
    if (clerkUser?.unsafeMetadata?.kidsMode !== undefined) {
      const clerkKidsMode = clerkUser.unsafeMetadata.kidsMode === true;
      setKidsMode(clerkKidsMode);
      localStorage.setItem(STORAGE_KEY, String(clerkKidsMode));
    }
  }, [clerkUser?.id]);

  // Force kids mode for under-13
  useEffect(() => {
    if (profile?.age && parseInt(profile.age) < 13 && !kidsMode) {
      setKidsMode(true);
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  }, [profile]);

  // Apply CSS variables + body class
  useEffect(() => {
    const root = document.documentElement;
    if (kidsMode) {
      root.setAttribute('data-kids', 'true');
      root.style.setProperty('--kids-font-scale', '1.2');
      root.style.setProperty('--kids-radius-scale', '1.5');
      root.style.setProperty('--kids-btn-padding', '14px 28px');
      document.body.classList.add('kids-mode');
    } else {
      root.removeAttribute('data-kids');
      root.style.removeProperty('--kids-font-scale');
      root.style.removeProperty('--kids-radius-scale');
      root.style.removeProperty('--kids-btn-padding');
      document.body.classList.remove('kids-mode');
    }
  }, [kidsMode]);

  async function persistKidsMode(val) {
    localStorage.setItem(STORAGE_KEY, String(val));
    // Sync to Clerk metadata if logged in
    if (clerkUser) {
      try {
        await clerkUser.update({ unsafeMetadata: { ...clerkUser.unsafeMetadata, kidsMode: val } });
      } catch (e) {
        console.warn('Could not sync kids mode to Clerk:', e.message);
      }
    }
  }

  function enableKidsMode() {
    setKidsMode(true);
    persistKidsMode(true);
  }

  function disableKidsMode() {
    setKidsMode(false);
    persistKidsMode(false);
    setShowPinModal(false);
  }

  function requestToggle(action) {
    if (action === 'disable') {
      // Always require PIN to exit kids mode
      setPinAction('disable');
      setShowPinModal(true);
    } else {
      enableKidsMode();
    }
  }

  // Alias for components that call toggleKidsMode()
  function toggleKidsMode() {
    requestToggle(kidsMode ? 'disable' : 'enable');
  }

  const getPin = () => localStorage.getItem(PIN_KEY) || DEFAULT_PIN;
  const setPin = (pin) => localStorage.setItem(PIN_KEY, pin);

  return (
    <KidsModeContext.Provider
      value={{
        kidsMode,
        requestToggle,
        toggleKidsMode,
        enableKidsMode,
        disableKidsMode,
        getPin,
        setPin,
      }}
    >
      {children}
      {showPinModal && (
        <PinModal
          action={pinAction}
          onConfirm={() => {
            disableKidsMode();
          }}
          onClose={() => setShowPinModal(false)}
          getPin={getPin}
        />
      )}
    </KidsModeContext.Provider>
  );
}

export const useKidsMode = () => {
  const ctx = useContext(KidsModeContext);
  if (!ctx) throw new Error('useKidsMode must be inside KidsModeProvider');
  return ctx;
};

// ── PIN Modal ──────────────────────────────────────────────────────────
function PinModal({ onConfirm, onClose, getPin }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  function tryPin() {
    if (input === getPin()) {
      onConfirm();
    } else {
      setError(true);
      setShake(true);
      setInput('');
      setTimeout(() => {
        setShake(false);
        setError(false);
      }, 600);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.7)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 24,
          padding: '36px 32px',
          maxWidth: 360,
          width: '100%',
          textAlign: 'center',
          fontFamily: 'Poppins,sans-serif',
          boxShadow: '0 40px 100px rgba(0,0,0,.4)',
          animation: shake ? 'shake .4s ease' : 'none',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔒</div>
        <h3
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: '1.4rem',
            fontWeight: 800,
            color: 'var(--ink)',
            marginBottom: 6,
          }}
        >
          Parent PIN Required
        </h3>
        <p
          style={{
            fontSize: '.82rem',
            color: 'var(--ink3)',
            fontWeight: 500,
            marginBottom: 22,
            lineHeight: 1.6,
          }}
        >
          Enter your 4-digit parent PIN to turn off Kids Mode.
          <br />
          Default PIN is <strong>1234</strong> — change it in Settings.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16 }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: 48,
                height: 56,
                borderRadius: 12,
                border: `2.5px solid ${error ? 'var(--red)' : input.length > i ? 'var(--blue)' : 'var(--border)'}`,
                background: input.length > i ? 'var(--blue-bg)' : 'var(--bg2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                fontWeight: 800,
                color: 'var(--ink)',
                transition: 'all .2s',
              }}
            >
              {input.length > i ? '●' : ''}
            </div>
          ))}
        </div>
        {/* PIN Pad */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3,1fr)',
            gap: 10,
            maxWidth: 220,
            margin: '0 auto 20px',
          }}
        >
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, i) => (
            <button
              key={i}
              onClick={() => {
                if (k === '⌫') setInput((v) => v.slice(0, -1));
                else if (k === '') return;
                else if (input.length < 4) setInput((v) => v + k);
              }}
              style={{
                height: 52,
                borderRadius: 12,
                border: '1.5px solid var(--border)',
                background: k === '' ? 'transparent' : 'var(--surface)',
                color: 'var(--ink)',
                fontSize: '1.1rem',
                fontWeight: 700,
                cursor: k === '' ? 'default' : 'pointer',
                fontFamily: 'Poppins,sans-serif',
                transition: 'all .15s',
              }}
              onMouseEnter={(e) => {
                if (k) e.currentTarget.style.background = 'var(--blue-bg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = k === '' ? 'transparent' : 'var(--surface)';
              }}
            >
              {k}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '11px 0',
              borderRadius: 12,
              border: '1.5px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--ink2)',
              fontFamily: 'Poppins,sans-serif',
              fontWeight: 700,
              fontSize: '.86rem',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={tryPin}
            disabled={input.length < 4}
            style={{
              flex: 1,
              padding: '11px 0',
              borderRadius: 12,
              border: 'none',
              background: input.length === 4 ? 'var(--blue)' : 'var(--bg3)',
              color: input.length === 4 ? 'white' : 'var(--ink3)',
              fontFamily: 'Poppins,sans-serif',
              fontWeight: 700,
              fontSize: '.86rem',
              cursor: input.length === 4 ? 'pointer' : 'default',
              transition: 'all .2s',
            }}
          >
            Confirm
          </button>
        </div>
        {error && (
          <div style={{ fontSize: '.78rem', color: 'var(--red)', fontWeight: 700, marginTop: 10 }}>
            ❌ Wrong PIN. Try again.
          </div>
        )}
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px)}40%{transform:translateX(10px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}`}</style>
    </div>
  );
}

// ── Kids Mode Toggle Button (drop into Nav) ────────────────────────────
export function KidsModeToggle({ className = '' }) {
  const { kidsMode, requestToggle } = useKidsMode();
  return (
    <button
      onClick={() => requestToggle(kidsMode ? 'disable' : 'enable')}
      title={kidsMode ? 'Exit Kids Mode (PIN required)' : 'Switch to Kids Mode'}
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 100,
        border: `1.5px solid ${kidsMode ? '#FCD34D' : 'var(--border)'}`,
        background: kidsMode ? 'rgba(252,211,77,.15)' : 'transparent',
        color: kidsMode ? '#FCD34D' : 'var(--ink3)',
        cursor: 'pointer',
        fontFamily: 'Poppins,sans-serif',
        fontSize: '.72rem',
        fontWeight: 700,
        transition: 'all .2s',
      }}
    >
      <span style={{ fontSize: '1.1rem' }}>👶</span>
      <span className="kids-mode-label" style={{ display: 'inline-block' }}>
        {kidsMode ? 'Kids Mode ON' : 'Kids Mode'}
      </span>
    </button>
  );
}

// ── Kids-safe route list (used in Nav to hide adult routes) ───────────
export const KIDS_ALLOWED_ROUTES = [
  '/',
  '/trivia',
  '/flashcards',
  '/map',
  '/game/david-goliath',
  '/game/runner',
  '/game/escape-room',
  '/game/spin-the-verse',
  '/challenge',
  '/play/activity-sheets',
  '/quiz/character',
  '/voice-reader',
  '/videos',
  '/prayer-beads',
  '/grow/certification',
  '/prayer',
  '/auth',
  '/profile',
  '/dashboard',
  '/explore/bible',
];

export const KIDS_HIDDEN_ROUTES = [
  '/community/chat',
  '/encouragement',
  '/ai/rap-generator',
  '/ai/miracle-art',
  '/chat/characters',
  '/notes',
  '/blog',
  '/community/family',
  '/community/events',
  '/premium',
  '/grow/worship',
  '/fasting',
  '/couples-devotional',
  '/sermon-writer',
  '/sermon-illustrations',
  '/study-generator',
  '/parent-hub',
];
