import { useEffect } from 'react';
import Icon from './Icons';

export default function ConfirmDialog({ open, title, message, confirmText = 'Delete', busy, onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="dialog" role="alertdialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-icon danger"><Icon name="alert" size={28} /></div>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="dialog-actions">
          <button className="btn btn-outline" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={busy} autoFocus>
            {busy ? 'Deleting...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}