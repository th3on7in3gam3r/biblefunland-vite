import { useState } from 'react';

export default function PinSetupModal({ onComplete, onSkip }) {
  const [step, setStep] = useState(1); // 1: intro, 2: enter PIN, 3: confirm PIN
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handlePinInput = (digit) => {
    if (step === 2 && pin.length < 4) {
      setPin(pin + digit);
    } else if (step === 3 && confirmPin.length < 4) {
      setConfirmPin(confirmPin + digit);
    }
  };

  const handleBackspace = () => {
    if (step === 2) {
      setPin(pin.slice(0, -1));
    } else if (step === 3) {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2 && pin.length === 4) {
      setStep(3);
    } else if (step === 3 && confirmPin.length === 4) {
      if (pin === confirmPin) {
        onComplete(pin);
      } else {
        setError('PINs do not match');
        setShake(true);
        setConfirmPin('');
        setTimeout(() => {
          setShake(false);
          setError('');
        }, 600);
      }
    }
  };

  const handleBack = () => {
    if (step === 3) {
      setConfirmPin('');
      setError('');
      setStep(2);
    } else if (step === 2) {
      setPin('');
      setStep(1);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.8)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        fontFamily: 'Poppins,sans-serif',
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 24,
          padding: '36px 32px',
          maxWidth: 420,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 40px 100px rgba(0,0,0,.5)',
          animation: shake ? 'shake .4s ease' : 'none',
        }}
      >
        {/* Step 1: Introduction */}
        {step === 1 && (
          <>
            <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🔐</div>
            <h3
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '1.6rem',
                fontWeight: 800,
                color: 'var(--ink)',
                marginBottom: 12,
              }}
            >
              Set Up Your Parent PIN
            </h3>
            <p
              style={{
                fontSize: '.88rem',
                color: 'var(--ink2)',
                fontWeight: 500,
                marginBottom: 8,
                lineHeight: 1.7,
              }}
            >
              Your PIN protects parental controls and sensitive actions like deleting child
              profiles.
            </p>
            <p
              style={{
                fontSize: '.88rem',
                color: 'var(--ink2)',
                fontWeight: 500,
                marginBottom: 24,
                lineHeight: 1.7,
              }}
            >
              Choose a 4-digit PIN that you'll remember but your children won't guess.
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={onSkip}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  borderRadius: 12,
                  border: '1.5px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--ink3)',
                  fontFamily: 'Poppins,sans-serif',
                  fontWeight: 700,
                  fontSize: '.88rem',
                  cursor: 'pointer',
                  transition: 'all .2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface)')}
              >
                Skip for Now
              </button>
              <button
                onClick={handleNext}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  borderRadius: 12,
                  border: 'none',
                  background: 'var(--blue)',
                  color: 'white',
                  fontFamily: 'Poppins,sans-serif',
                  fontWeight: 700,
                  fontSize: '.88rem',
                  cursor: 'pointer',
                  transition: 'all .2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                Set Up PIN
              </button>
            </div>
          </>
        )}

        {/* Step 2: Enter PIN */}
        {step === 2 && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔢</div>
            <h3
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '1.4rem',
                fontWeight: 800,
                color: 'var(--ink)',
                marginBottom: 6,
              }}
            >
              Create Your PIN
            </h3>
            <p
              style={{
                fontSize: '.82rem',
                color: 'var(--ink3)',
                fontWeight: 500,
                marginBottom: 22,
                lineHeight: 1.6,
              }}
            >
              Enter a 4-digit PIN
            </p>

            {/* PIN Display */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 52,
                    height: 60,
                    borderRadius: 12,
                    border: `2.5px solid ${pin.length > i ? 'var(--blue)' : 'var(--border)'}`,
                    background: pin.length > i ? 'var(--blue-bg)' : 'var(--bg2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    color: 'var(--ink)',
                    transition: 'all .2s',
                  }}
                >
                  {pin.length > i ? '●' : ''}
                </div>
              ))}
            </div>

            {/* PIN Pad */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3,1fr)',
                gap: 10,
                maxWidth: 240,
                margin: '0 auto 20px',
              }}
            >
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (k === '⌫') handleBackspace();
                    else if (k !== '') handlePinInput(k);
                  }}
                  style={{
                    height: 56,
                    borderRadius: 12,
                    border: '1.5px solid var(--border)',
                    background: k === '' ? 'transparent' : 'var(--surface)',
                    color: 'var(--ink)',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    cursor: k === '' ? 'default' : 'pointer',
                    fontFamily: 'Poppins,sans-serif',
                    transition: 'all .15s',
                  }}
                  onMouseEnter={(e) => {
                    if (k) e.currentTarget.style.background = 'var(--blue-bg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = k === '' ? 'transparent' : 'var(--surface)';
                  }}
                >
                  {k}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleBack}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  borderRadius: 12,
                  border: '1.5px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--ink2)',
                  fontFamily: 'Poppins,sans-serif',
                  fontWeight: 700,
                  fontSize: '.86rem',
                  cursor: 'pointer',
                }}
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={pin.length < 4}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  borderRadius: 12,
                  border: 'none',
                  background: pin.length === 4 ? 'var(--blue)' : 'var(--bg3)',
                  color: pin.length === 4 ? 'white' : 'var(--ink3)',
                  fontFamily: 'Poppins,sans-serif',
                  fontWeight: 700,
                  fontSize: '.86rem',
                  cursor: pin.length === 4 ? 'pointer' : 'default',
                  transition: 'all .2s',
                }}
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Step 3: Confirm PIN */}
        {step === 3 && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
            <h3
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '1.4rem',
                fontWeight: 800,
                color: 'var(--ink)',
                marginBottom: 6,
              }}
            >
              Confirm Your PIN
            </h3>
            <p
              style={{
                fontSize: '.82rem',
                color: 'var(--ink3)',
                fontWeight: 500,
                marginBottom: 22,
                lineHeight: 1.6,
              }}
            >
              Enter your PIN again to confirm
            </p>

            {/* PIN Display */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 52,
                    height: 60,
                    borderRadius: 12,
                    border: `2.5px solid ${error ? 'var(--red)' : confirmPin.length > i ? 'var(--blue)' : 'var(--border)'}`,
                    background:
                      confirmPin.length > i
                        ? error
                          ? 'var(--red-bg)'
                          : 'var(--blue-bg)'
                        : 'var(--bg2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    color: 'var(--ink)',
                    transition: 'all .2s',
                  }}
                >
                  {confirmPin.length > i ? '●' : ''}
                </div>
              ))}
            </div>

            {/* PIN Pad */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3,1fr)',
                gap: 10,
                maxWidth: 240,
                margin: '0 auto 20px',
              }}
            >
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (k === '⌫') handleBackspace();
                    else if (k !== '') handlePinInput(k);
                  }}
                  style={{
                    height: 56,
                    borderRadius: 12,
                    border: '1.5px solid var(--border)',
                    background: k === '' ? 'transparent' : 'var(--surface)',
                    color: 'var(--ink)',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    cursor: k === '' ? 'default' : 'pointer',
                    fontFamily: 'Poppins,sans-serif',
                    transition: 'all .15s',
                  }}
                  onMouseEnter={(e) => {
                    if (k) e.currentTarget.style.background = 'var(--blue-bg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = k === '' ? 'transparent' : 'var(--surface)';
                  }}
                >
                  {k}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleBack}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  borderRadius: 12,
                  border: '1.5px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--ink2)',
                  fontFamily: 'Poppins,sans-serif',
                  fontWeight: 700,
                  fontSize: '.86rem',
                  cursor: 'pointer',
                }}
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={confirmPin.length < 4}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  borderRadius: 12,
                  border: 'none',
                  background: confirmPin.length === 4 ? 'var(--blue)' : 'var(--bg3)',
                  color: confirmPin.length === 4 ? 'white' : 'var(--ink3)',
                  fontFamily: 'Poppins,sans-serif',
                  fontWeight: 700,
                  fontSize: '.86rem',
                  cursor: confirmPin.length === 4 ? 'pointer' : 'default',
                  transition: 'all .2s',
                }}
              >
                Confirm
              </button>
            </div>

            {error && (
              <div
                style={{ fontSize: '.78rem', color: 'var(--red)', fontWeight: 700, marginTop: 12 }}
              >
                ❌ {error}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px)}40%{transform:translateX(10px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}
      `}</style>
    </div>
  );
}
