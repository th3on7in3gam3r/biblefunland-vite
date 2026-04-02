/**
 * StoryForm — "Share your story" moderated testimonial submission
 */
import { useState } from 'react';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '/api');

export default function StoryForm({ onClose }) {
  const [form, setForm] = useState({ name: '', role: '', quote: '' });
  const [status, setStatus] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.quote.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch(`${API}/api/referrals/testimonial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 20,
        border: '1.5px solid var(--border)',
        padding: '28px 24px',
        maxWidth: 480,
      }}
    >
      <div
        style={{
          fontFamily: "'Baloo 2',cursive",
          fontSize: '1.1rem',
          fontWeight: 800,
          color: 'var(--ink)',
          marginBottom: 6,
        }}
      >
        💬 Share Your Story
      </div>
      <p style={{ fontSize: '.8rem', color: 'var(--ink3)', marginBottom: 18, lineHeight: 1.6 }}>
        How has BibleFunLand helped your family or church? We'd love to hear from you. Stories are
        reviewed before publishing.
      </p>

      {status === 'success' ? (
        <div
          style={{
            background: 'var(--green-bg)',
            color: 'var(--green)',
            borderRadius: 12,
            padding: '14px 18px',
            fontWeight: 700,
            fontSize: '.85rem',
          }}
        >
          ✅ Thank you! Your story has been submitted for review. We'll feature it soon. 🙏
        </div>
      ) : (
        <form onSubmit={submit}>
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}
          >
            <input
              className="input-field"
              placeholder="Your name *"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <input
              className="input-field"
              placeholder="Role (e.g. Parent, Pastor)"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            />
          </div>
          <textarea
            className="textarea-field"
            placeholder="Your story or quote (max 500 characters) *"
            value={form.quote}
            onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value.slice(0, 500) }))}
            style={{ height: 100, marginBottom: 6 }}
            required
          />
          <div
            style={{
              fontSize: '.68rem',
              color: 'var(--ink3)',
              marginBottom: 14,
              textAlign: 'right',
            }}
          >
            {form.quote.length}/500
          </div>
          {status === 'error' && (
            <div style={{ color: 'var(--red)', fontSize: '.78rem', marginBottom: 10 }}>
              ⚠️ Something went wrong. Please try again.
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn btn-blue"
              style={{ flex: 1 }}
            >
              {status === 'loading' ? '...' : '📤 Submit Story'}
            </button>
            {onClose && (
              <button type="button" onClick={onClose} className="btn btn-outline">
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
