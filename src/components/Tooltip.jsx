/**
 * Tooltip — lightweight hover tooltip, no external deps.
 * Usage: <Tooltip text="Opens the game page">...</Tooltip>
 */
import { useState } from 'react';

export default function Tooltip({ text, children, position = 'top' }) {
  const [visible, setVisible] = useState(false);

  const pos =
    {
      top: { bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
      bottom: { top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)' },
      left: { right: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)' },
      right: { left: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)' },
    }[position] || {};

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          style={{
            position: 'absolute',
            ...pos,
            background: 'rgba(15,23,42,.92)',
            color: 'white',
            fontSize: '.72rem',
            fontWeight: 600,
            padding: '6px 10px',
            borderRadius: 8,
            maxWidth: 180,
            whiteSpace: 'normal',
            textAlign: 'center',
            lineHeight: 1.4,
            pointerEvents: 'none',
            zIndex: 9999,
            boxShadow: '0 4px 14px rgba(0,0,0,.25)',
            animation: 'tooltipIn .12s ease',
            fontFamily: 'Poppins,sans-serif',
          }}
        >
          {text}
          <style>{`@keyframes tooltipIn{from{opacity:0}to{opacity:1}}`}</style>
        </span>
      )}
    </span>
  );
}
