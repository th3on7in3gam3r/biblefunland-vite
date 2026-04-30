import React from 'react';

export default function FloatingActionButton({ onClick }) {
  return (
    <button
      className="fab-verse"
      onClick={onClick}
      aria-label="Open Verse of the Day or quick prayer entry"
      title="Verse of the Day"
      type="button"
    >
      📜
    </button>
  );
}
