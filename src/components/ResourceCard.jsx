import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ResourceCard({ resource, onUnauthorizedClick }) {
  const { user } = useAuth()

  function handleClick(e) {
    if (!user && onUnauthorizedClick) {
      e.preventDefault()
      onUnauthorizedClick()
    }
  }

  const cardStyle = {
    background: 'var(--surface)',
    borderRadius: 20,
    border: '1.5px solid var(--border)',
    padding: 20,
    transition: 'all 0.3s',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  }

  const iconBoxStyle = {
    width: 56,
    height: 56,
    borderRadius: 14,
    background: resource.role === 'Teacher' ? 'var(--purple-bg)' : 'var(--blue-bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.8rem',
    marginBottom: 14,
  }

  const badgeStyle = {
    fontSize: '.65rem',
    fontWeight: 800,
    color: resource.role === 'Teacher' ? 'var(--purple)' : 'var(--blue)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  }

  const titleStyle = {
    fontFamily: "'Baloo 2', cursive",
    fontSize: '.95rem',
    fontWeight: 800,
    color: 'var(--ink)',
    marginBottom: 8,
    lineHeight: 1.3,
  }

  const descStyle = {
    fontSize: '.78rem',
    color: 'var(--ink2)',
    fontWeight: 500,
    marginBottom: 12,
    lineHeight: 1.5,
    flex: 1,
  }

  const tagsStyle = {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 14,
  }

  const tagStyle = {
    fontSize: '.62rem',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: 6,
    background: 'var(--bg2)',
    color: 'var(--ink3)',
    border: '1px solid var(--border)',
  }

  const actionStyle = {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTop: '1px solid var(--border)',
  }

  const linkStyle = {
    flex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '8px 12px',
    borderRadius: 10,
    background: resource.role === 'Teacher' ? 'var(--purple-bg)' : 'var(--blue-bg)',
    color: resource.role === 'Teacher' ? 'var(--purple)' : 'var(--blue)',
    fontWeight: 700,
    fontSize: '.75rem',
    textDecoration: 'none',
    transition: 'all 0.2s',
    border: `1.5px solid ${resource.role === 'Teacher' ? 'var(--purple)' : 'var(--blue)'}`,
    cursor: 'pointer',
  }

  return (
    <div
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = 'var(--sh-lg)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'var(--sh)'
      }}
    >
      {/* Icon */}
      <div style={iconBoxStyle}>{resource.icon || '📚'}</div>

      {/* Badge */}
      <div style={badgeStyle}>{resource.category}</div>

      {/* Title */}
      <div style={titleStyle}>{resource.title}</div>

      {/* Description */}
      <div style={descStyle}>{resource.description}</div>

      {/* Tags */}
      <div style={tagsStyle}>
        {resource.ageRange && (
          <div style={tagStyle}>👶 Ages {resource.ageRange}</div>
        )}
        {resource.role && (
          <div style={tagStyle}>
            {resource.role === 'Teacher' ? '🏫' : '👨‍👩‍👧'} {resource.role}
          </div>
        )}
      </div>

      {/* Action */}
      <div style={actionStyle}>
        {resource.link ? (
          <a
            href={resource.link}
            target="_blank"
            rel="noopener noreferrer"
            style={linkStyle}
            onClick={handleClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            {resource.downloadable ? '⬇️ Download' : '🔗 View'}
          </a>
        ) : (
          <button
            style={linkStyle}
            onClick={handleClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            {resource.downloadable ? '⬇️ Download' : '📖 View'}
          </button>
        )}
      </div>
    </div>
  )
}
