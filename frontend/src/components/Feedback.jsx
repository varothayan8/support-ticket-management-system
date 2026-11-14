import { IconAlert, IconInbox } from './Icons';

export function Loader({ label = 'Loading...' }) {
  return (
    <div className="loader" role="status">
      <span className="spinner" />
      <span>{label}</span>
    </div>
  );
}

export function Alert({ type = 'error', children, onRetry }) {
  if (!children) return null;
  return (
    <div className={`alert alert-${type}`} role="alert">
      <IconAlert size={18} />
      <span>{children}</span>
      {onRetry && (
        <button type="button" className="btn btn-link" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, text, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <IconInbox size={28} />
      </div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function StatCard({ label, value, icon, tone = 'blue', hint }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {hint && <span className="stat-hint">{hint}</span>}
      </div>
    </div>
  );
}

export function ConfirmModal({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel, busy }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={onCancel}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h3 id="modal-title">{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Please wait...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
