import { Link } from 'react-router-dom';
import usePageMetadata from '../../hooks/usePageMetadata';

const cards = [
  { title: 'AI Devotional', path: '/ai/devotional', desc: 'Personalized devotional generator' },
  { title: 'Bible Character Chat', path: '/ai/chat/characters', desc: 'Chat with biblical heroes' },
  { title: 'Rap Generator', path: '/ai/rap-generator', desc: 'Create scripture rap songs' },
  { title: 'Miracle Art', path: '/ai/miracle-art', desc: 'Generate Bible art prompts' },
];

export default function AIOverview() {
  usePageMetadata({
    title: 'AI Hub',
    description: 'AI tools for Bible learning: devotional, chat, rap, and art generator.',
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
