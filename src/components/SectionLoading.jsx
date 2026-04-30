export default function SectionLoading() {
  return (
    <div
      style={{
        padding: '40px 24px',
        textAlign: 'center',
        color: '#4b5563',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        background: '#f8fafc',
      }}
    >
      <div className="spinner" style={{ margin: '0 auto 12px' }} />
      <div>Loading section content...</div>
    </div>
  );
}
