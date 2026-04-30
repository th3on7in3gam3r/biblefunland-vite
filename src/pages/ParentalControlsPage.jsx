import ParentalControlsPanel from '../components/ParentalControlsPanel';

export default function ParentalControlsPage() {
  return (
    <div style={{ padding: 16 }}>
      <h1>Parental Controls</h1>
      <p style={{ color: '#4b5563', margin: '8px 0 16px' }}>
        Use the parental controls below to manage access and safety for children.
      </p>
      <ParentalControlsPanel />
    </div>
  );
}
