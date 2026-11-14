import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteTicket, getTicket, updateTicket } from '../api/ticketApi';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Alert, ConfirmModal, Loader } from '../components/Feedback';
import { PriorityBadge, StatusBadge } from '../components/Badges';
import { IconArrowLeft, IconEdit, IconTrash } from '../components/Icons';
import { PRIORITIES, STATUSES, formatDateTime, ownerId, ownerName, shortId } from '../utils/format';

export default function TicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const notify = useToast();
  const { user, isAdmin } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setTicket(await getTicket(id));
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load this ticket.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Same rule as the backend: the ticket creator or an admin can edit / delete
  const canManage = ticket && (isAdmin || ownerId(ticket) === String(user.id));

  const startEdit = () => {
    setForm({
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      status: ticket.status,
    });
    setSaveError('');
    setEditing(true);
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      return setSaveError('Title and description cannot be empty.');
    }
    setSaving(true);
    setSaveError('');
    try {
      await updateTicket(id, {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        status: form.status,
      });
      // Reload so "createdBy" stays populated with the owner's name
      await load();
      setEditing(false);
      notify('Ticket updated.');
    } catch (err) {
      setSaveError(getErrorMessage(err, 'Could not update the ticket.'));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    setDeleting(true);
    try {
      await deleteTicket(id);
      notify('Ticket deleted.');
      navigate('/tickets', { replace: true });
    } catch (err) {
      setConfirmOpen(false);
      setError(getErrorMessage(err, 'Could not delete the ticket.'));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="page"><Loader label="Loading ticket..." /></div>;

  if (!ticket) {
    return (
      <div className="page page-narrow">
        <Link to="/tickets" className="back-link"><IconArrowLeft size={18} /> Back to My Tickets</Link>
        <Alert onRetry={load}>{error || 'Ticket not found.'}</Alert>
      </div>
    );
  }

  return (
    <div className="page page-narrow">
      <Link to="/tickets" className="back-link"><IconArrowLeft size={18} /> Back to My Tickets</Link>
      <Alert>{error}</Alert>

      <section className="card ticket-card">
        <div className="ticket-head">
          <div>
            <span className="ticket-id mono">Ticket {shortId(ticket._id)}</span>
            <h2 className="ticket-title">{editing ? 'Edit Ticket' : ticket.title}</h2>
          </div>
          {!editing && canManage && (
            <div className="ticket-actions">
              <button type="button" className="btn btn-primary" onClick={startEdit}>
                <IconEdit size={18} /> Edit Ticket
              </button>
              <button type="button" className="btn btn-danger-outline" onClick={() => setConfirmOpen(true)}>
                <IconTrash size={18} /> Delete
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <form className="form" onSubmit={onSave} noValidate>
            <Alert>{saveError}</Alert>
            <div className="field">
              <label htmlFor="title">Ticket Title</label>
              <input id="title" name="title" value={form.title} onChange={onChange} maxLength={120} />
            </div>
            <div className="field">
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" rows={6} value={form.description} onChange={onChange} />
            </div>
            <div className="field-grid">
              <div className="field">
                <label htmlFor="priority">Priority</label>
                <select id="priority" name="priority" value={form.priority} onChange={onChange}>
                  {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="status">Status</label>
                <select id="status" name="status" value={form.status} onChange={onChange}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <>
            <dl className="detail-grid">
              <div>
                <dt>Ticket ID</dt>
                <dd className="mono" title={ticket._id}>{ticket._id}</dd>
              </div>
              <div>
                <dt>Current Status</dt>
                <dd><StatusBadge status={ticket.status} /></dd>
              </div>
              <div>
                <dt>Priority</dt>
                <dd><PriorityBadge priority={ticket.priority} /></dd>
              </div>
              <div>
                <dt>Date Created</dt>
                <dd>{formatDateTime(ticket.createdAt)}</dd>
              </div>
              <div>
                <dt>Last Updated</dt>
                <dd>{formatDateTime(ticket.updatedAt)}</dd>
              </div>
              <div>
                <dt>Submitted By</dt>
                <dd>{ownerName(ticket)}</dd>
              </div>
            </dl>

            <div className="description-block">
              <h3>Description</h3>
              <p>{ticket.description}</p>
            </div>

            {!canManage && (
              <p className="muted small">
                Only the person who created this ticket or an administrator can edit it.
              </p>
            )}
          </>
        )}
      </section>

      <ConfirmModal
        open={confirmOpen}
        title="Delete this ticket?"
        message={`“${ticket.title}” will be permanently removed. This cannot be undone.`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={onDelete}
        busy={deleting}
      />
    </div>
  );
}
