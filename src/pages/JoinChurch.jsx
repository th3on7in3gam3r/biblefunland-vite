import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as db from '../lib/db';

export default function JoinChurch() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleJoin() {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { data: church } = await db.getChurchByInviteCode(code.trim().toUpperCase());
      if (!church) {
        setError('❌ Invalid invite code. Please check with your pastor.');
      } else {
        await db.joinChurch(user.id, church.id);
        navigate('/dashboard');
        alert('🎉 Welcome! You have successfully joined ' + church.name);
      }
    } catch (err) {
      setError('❌ Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        background: 'var(--bg)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: '100%',
          background: 'var(--surface)',
          borderRadius: 28,
          border: '2px solid var(--border)',
          padding: 40,
          textAlign: 'center',
          boxShadow: 'var(--sh-lg)',
        }}
      >
        <div style={{ fontSize: '4.5rem', marginBottom: 24 }}>🤝</div>
        <h1
          style={{
            fontFamily: "'Baloo 2', cursive",
            fontSize: '2.4rem',
            fontWeight: 800,
            color: 'var(--ink)',
            marginBottom: 12,
          }}
        >
          Join Your Church
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--ink2)', marginBottom: 32, lineHeight: 1.6 }}>
          Connect with your local congregation to grow together, compare streaks, and participate in
          church-wide challenges.
        </p>

        <div
          style={{
            background: 'var(--bg2)',
            borderRadius: 20,
            padding: 24,
            border: '1.5px solid var(--border)',
            marginBottom: 24,
          }}
        >
          <label
            style={{
              fontSize: '.75rem',
              fontWeight: 800,
              color: 'var(--ink3)',
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              display: 'block',
              marginBottom: 12,
            }}
          >
            Invite Code (6-Digits)
          </label>
          <input
            className="input-field"
            placeholder="e.g. AB12XY"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            style={{
              textAlign: 'center',
              fontSize: '1.8rem',
              fontWeight: 800,
              letterSpacing: 4,
              textTransform: 'uppercase',
              background: 'white',
              border: '2px solid var(--blue)',
              color: 'var(--blue)',
            }}
          />
        </div>

        <button
          className="btn btn-blue btn-lg"
          onClick={handleJoin}
          disabled={loading}
          style={{ width: '100%', padding: '16px', fontSize: '1.1rem', borderRadius: 18 }}
        >
          {loading ? '🔗 Connecting...' : 'Connect to My Church'}
        </button>

        {error && (
          <div
            style={{
              marginTop: 20,
              color: 'var(--red)',
              background: 'var(--red-bg)',
              padding: '12px 16px',
              borderRadius: 12,
              fontSize: '.88rem',
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        <p style={{ marginTop: 40, fontSize: '.82rem', color: 'var(--ink3)', fontWeight: 600 }}>
          Don't have a code? Ask your pastor or leader to create a Church Hub on the "More" menu!
        </p>
      </div>
    </div>
  );
}
