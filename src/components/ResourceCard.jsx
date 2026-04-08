import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_CONFIG = {
  Teacher: { color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE', label: '🏫 Teacher' },
  Parent:  { color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', label: '👨‍👩‍👧 Parent' },
};

export default function ResourceCard({ resource, onUnauthorizedClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = ROLE_CONFIG[resource.role] || ROLE_CONFIG.Parent;

  function handleActionClick(e) {
    if (!user && onUnauthorizedClick) {
      e.preventDefault();
      onUnauthorizedClick();
      return;
    }
    if (resource.downloadable) {
      e.preventDefault();
      navigate(`/parents/resource/${resource.id}`);
    }
  }

  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 18,
        border: '1.5px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = `0 12px 32px ${role.color}18`;
        e.currentTarget.style.borderColor = `${role.color}40`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      {/* Colored top accent */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${role.color}, ${role.color}80)` }} />

      <div style={{ padding: '18px 18px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Icon + category row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: role.bg, border: `1.5px solid ${role.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', flexShrink: 0,
          }}>
            {resource.icon || '📚'}
          </div>
          <span style={{
            fontSize: '.6rem', fontWeight: 800, letterSpacing: '.5px',
            textTransform: 'uppercase', color: role.color,
            background: role.bg, border: `1px solid ${role.border}`,
            padding: '3px 8px', borderRadius: 6,
          }}>
            {resource.category}
          </span>
        </div>

        {/* Title */}
        <div style={{
          fontFamily: "'Baloo 2', cursive", fontWeight: 800,
          fontSize: '1rem', color: 'var(--ink)', marginBottom: 6, lineHeight: 1.3,
        }}>
          {resource.title}
        </div>

        {/* Description */}
        <p style={{
          fontSize: '.78rem', color: 'var(--ink3)', fontWeight: 500,
          lineHeight: 1.6, marginBottom: 12, flex: 1,
        }}>
          {resource.description}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {resource.ageRange && (
            <span style={{
              fontSize: '.62rem', fontWeight: 700, padding: '3px 8px',
              borderRadius: 6, background: 'var(--bg2)',
              color: 'var(--ink3)', border: '1px solid var(--border)',
            }}>
              Ages {resource.ageRange}
            </span>
          )}
          {resource.role && (
            <span style={{
              fontSize: '.62rem', fontWeight: 700, padding: '3px 8px',
              borderRadius: 6, background: role.bg,
              color: role.color, border: `1px solid ${role.border}`,
            }}>
              {role.label}
            </span>
          )}
          {resource.downloadable && (
            <span style={{
              fontSize: '.62rem', fontWeight: 700, padding: '3px 8px',
              borderRadius: 6, background: '#ECFDF5',
              color: '#059669', border: '1px solid #A7F3D0',
            }}>
              ✨ AI Generated
            </span>
          )}
        </div>

        {/* Action button */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          {resource.downloadable ? (
            <button
              onClick={handleActionClick}
              style={{
                width: '100%', padding: '10px 16px',
                borderRadius: 10, border: 'none',
                background: `linear-gradient(135deg, ${role.color}, ${role.color}cc)`,
                color: 'white', fontWeight: 700, fontSize: '.82rem',
                cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                boxShadow: `0 4px 12px ${role.color}30`,
                transition: 'opacity 0.2s, transform 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'scale(1.01)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
            >
              🖨️ Generate & Print
            </button>
          ) : resource.link ? (
            <Link
              to={resource.link}
              onClick={handleActionClick}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                width: '100%', padding: '10px 16px',
                borderRadius: 10, textDecoration: 'none',
                background: 'var(--bg2)', color: 'var(--ink2)',
                fontWeight: 700, fontSize: '.82rem',
                border: '1.5px solid var(--border)',
                transition: 'background 0.2s, border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = role.bg; e.currentTarget.style.borderColor = role.border; e.currentTarget.style.color = role.color; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg2)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--ink2)'; }}
            >
              → Open Resource
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
