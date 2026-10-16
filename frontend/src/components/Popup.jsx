import { useEffect } from 'react';

const PIECES = [
  [-105, -30], [105, -35], [-70, -85], [72, -90], [-125, 20], [125, 15],
  [-40, -112], [45, -115], [-90, 60], [95, 55], [0, -120], [-15, 85],
];

export default function Popup({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [message, onClose]);

  if (!message) return null;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="dialog dialog-success" role="alertdialog" aria-live="polite" onClick={(e) => e.stopPropagation()}>
        <div className="confetti" aria-hidden="true">
          {PIECES.map(([x, y], i) => (
            <span key={i} style={{ '--x': `${x}px`, '--y': `${y}px`, '--d': `${i * 25}ms` }} />
          ))}
        </div>

        <div className="success-badge">
          <svg viewBox="0 0 52 52" className="check-svg" aria-hidden="true">
            <circle className="check-circle" cx="26" cy="26" r="24" fill="none" />
            <path className="check-path" d="M14 27l8 8 16-17" fill="none" />
          </svg>
        </div>

        <h3>Success!</h3>
        <p>{message}</p>
        <button className="btn btn-primary btn-block" onClick={onClose} autoFocus>Continue</button>
        <span className="dialog-hint">or press Esc</span>
      </div>
    </div>
  );
}