export default function SectionError({ error }) {
  return (
    <div
      style={{
        padding: '40px 24px',
        textAlign: 'center',
        color: '#b91c1c',
        border: '1px solid #fecaca',
        borderRadius: 12,
        background: '#fef2f2',
      }}
    >
      <h2 style={{ margin: 0 }}>Oops! Something went wrong</h2>
      <p style={{ margin: '8px 0 0' }}>
        Unable to load this section. Please refresh or try again later.
      </p>
      {error?.message && <p style={{ margin: '8px 0 0', fontSize: '.9rem' }}>{error.message}</p>}
    </div>
  );
}
