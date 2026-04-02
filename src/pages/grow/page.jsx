import { Link } from 'react-router-dom';
import usePageMetadata from '../../hooks/usePageMetadata';

const cards = [
  { title: 'Certification', path: '/grow/certification', desc: 'Bible certification course' },
  { title: 'Reading Plan', path: '/grow/reading-plan', desc: 'Daily Bible reading schedule' },
  {
    title: 'Faith Milestones',
    path: '/grow/faith-milestones',
    desc: 'Track your spiritual achievements',
  },
  { title: 'Family Tree', path: '/grow/family-tree', desc: 'Explore biblical genealogy' },
  { title: 'Worship Discovery', path: '/grow/worship', desc: 'Find worship music by mood' },
];

export default function GrowOverview() {
  usePageMetadata({
    title: 'Grow Hub',
    description: 'Grow your Bible skills with reading plans, certification, and milestones.',
  });
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))',
        gap: 14,
      }}
    >
      {cards.map((c) => (
        <Link
          key={c.path}
          to={c.path}
          style={{
            padding: '18px',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            background: 'white',
            textDecoration: 'none',
            color: '#111827',
          }}
        >
          <h2 style={{ margin: '0 0 8px 0' }}>{c.title}</h2>
          <p style={{ margin: 0, color: '#6b7280' }}>{c.desc}</p>
        </Link>
      ))}
    </div>
  );
}
