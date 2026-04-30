import { Link } from 'react-router-dom';
import ContentCard from './ContentCard';

export default function RelatedItems({ items = [] }) {
  if (!items.length) return null;

  return (
    <section style={{ marginTop: 32 }}>
      <h2
        style={{
          margin: '0 0 14px',
          fontFamily: "'Baloo 2',cursive",
          color: '#1E1B4B',
          fontSize: '1.3rem',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        ✨ Related Items
      </h2>
      <div
        style={{
          display: 'grid',
          gap: 14,
          gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))',
        }}
      >
        {items.map((item) => (
          <ContentCard
            key={item.link || item.to}
            thumbnail={
              item.thumbnail ||
              `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="230"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1E1B4B"/><stop offset="100%" stop-color="#8B5CF6"/></linearGradient></defs><rect width="400" height="230" fill="url(#g)"/><text x="200" y="105" text-anchor="middle" font-size="56">✝️</text><text x="200" y="155" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="bold" fill="white">BibleFunLand</text></svg>')}`
            }
            title={item.title}
            description={item.description}
            bibleRef={item.bibleRef}
            age={item.ageGroup || item.age || 'All ages'}
            link={item.link || item.to}
            cta={item.cta || 'Open'}
          />
        ))}
      </div>
    </section>
  );
}
