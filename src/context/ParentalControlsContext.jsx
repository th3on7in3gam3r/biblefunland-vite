import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import * as db from '../lib/db';
import { requestQueue } from '../lib/requestQueue';

const ParentalControlsContext = createContext(null);

export function ParentalControlsProvider({ children }) {
  const { user, profile } = useAuth();
  const [controls, setControls] = useState({
    ai_toggles: {},
    daily_limit: 0,
    parent_pin: '4318',
    kids_mode_lock: 0,
    blocked_topics: [],
  });
  const [sessionTime, setSessionTime] = useState(0); // minutes
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Fetch controls when user/profile changes
  useEffect(() => {
    if (user?.id) {
      requestQueue
        .execute(`parental-controls:${user.id}`, () => db.getParentalControls(user.id), {
          priority: 3,
          cacheable: true,
          ttl: 15 * 60 * 1000,
        })
        .then(({ data }) => {
          if (data) setControls(data);
        })
        .catch(() => {});
    }
  }, [user?.id]);

  // Timer logic for daily limit
  useEffect(() => {
    if (controls.daily_limit > 0 && !isTimeUp) {
      const interval = setInterval(() => {
        setSessionTime((prev) => {
          const next = prev + 1;
          if (next >= controls.daily_limit) {
            setIsTimeUp(true);
            clearInterval(interval);
            return next;
          }
          return next;
        });
      }, 60000); // every minute
      return () => clearInterval(interval);
    }
  }, [controls.daily_limit, isTimeUp]);

  const isFeatureEnabled = (featureId) => {
    // If not a child/Kids Mode, always enabled?
    // Actually, parents might want to toggle AI for everyone.
    // Default is ENABLED (true) unless explicitly set to false.
    return controls.ai_toggles[featureId] !== false;
  };

  const updateControls = async (newData) => {
    if (!user?.id) return;
    const updated = { ...controls, ...newData };
    setControls(updated);
    await db.upsertParentalControls(user.id, updated).catch(() => {});
  };

  return (
    <ParentalControlsContext.Provider
      value={{ controls, isFeatureEnabled, updateControls, isTimeUp, setIsTimeUp }}
    >
      {children}
      {isTimeUp && <TimeLimitOverlay onExtend={() => setIsTimeUp(false)} />}
    </ParentalControlsContext.Provider>
  );
}

export const useParentalControls = () => {
  const ctx = useContext(ParentalControlsContext);
  if (!ctx) throw new Error('useParentalControls must be inside ParentalControlsProvider');
  return ctx;
};

function TimeLimitOverlay({ onExtend }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,23,42,0.95)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 24,
        backdropFilter: 'blur(10px)',
      }}
    >
      <div style={{ maxWidth: 400 }}>
        <div style={{ fontSize: '5rem', marginBottom: 20 }}>⏳</div>
        <h1
          style={{
            fontFamily: "'Baloo 2', cursive",
            fontSize: '2.5rem',
            fontWeight: 800,
            color: 'white',
            marginBottom: 12,
          }}
        >
          Time's Up for Today!
        </h1>
        <p
          style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '1.1rem',
            marginBottom: 32,
            lineHeight: 1.6,
          }}
        >
          You've reached the daily time limit set by your parents. Great job learning today! 🙏
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={() => (window.location.href = '/')}
            style={{
              padding: '16px',
              borderRadius: 16,
              border: 'none',
              background: 'var(--blue)',
              color: 'white',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Back to Home
          </button>
          <p style={{ fontSize: '.8rem', color: 'rgba(255,255,255,0.4)', marginTop: 12 }}>
            Ask a parent to enter their PIN to extend time.
          </p>
        </div>
      </div>
    </div>
  );
}
