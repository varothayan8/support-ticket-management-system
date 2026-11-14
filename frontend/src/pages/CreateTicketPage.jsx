import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket } from '../api/ticketApi';
import { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Alert } from '../components/Feedback';
import { PRIORITIES } from '../utils/format';

const TITLE_MAX = 120;

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const notify = useToast();
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Ticket title is required.';
    else if (form.title.trim().length < 5) next.title = 'Title should be at least 5 characters.';
    if (!form.description.trim()) next.description = 'Please describe the problem.';
    else if (form.description.trim().length < 10) next.description = 'Please add a little more detail (10+ characters).';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setServerError('');
    try {
      // New tickets start as "Open" (default in models/Ticket.js)
      await createTicket({
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
      });
      notify('Ticket submitted successfully.');
      navigate('/tickets');
    } catch (err) {
      setServerError(getErrorMessage(err, 'Could not create the ticket.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <div>
          <h2>Create a Support Ticket</h2>
          <p className="muted">Tell us what went wrong and how urgent it is. New tickets start with the status “Open”.</p>
        </div>
      </div>

      <section className="card">
        <Alert>{serverError}</Alert>
        <form className="form" onSubmit={onSubmit} noValidate>
          <div className={`field ${errors.title ? 'has-error' : ''}`}>
            <label htmlFor="title">Ticket Title <span className="req">*</span></label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={onChange}
              maxLength={TITLE_MAX}
              placeholder="e.g. Cannot log in to the student portal"
            />
            <div className="field-row">
              {errors.title ? <span className="field-error">{errors.title}</span> : <span />}
              <span className="char-count">{form.title.length}/{TITLE_MAX}</span>
            </div>
          </div>

          <div className={`field ${errors.description ? 'has-error' : ''}`}>
            <label htmlFor="description">Description <span className="req">*</span></label>
            <textarea
              id="description"
              name="description"
              rows={7}
              value={form.description}
              onChange={onChange}
              placeholder="Describe the issue, what you expected to happen, and any steps to reproduce it."
            />
            {errors.description && <span className="field-error">{errors.description}</span>}
          </div>

          <fieldset className="field">
            <legend>Priority</legend>
            <div className="segmented" role="radiogroup">
              {PRIORITIES.map((p) => (
                <label key={p} className={`segment seg-${p.toLowerCase()} ${form.priority === p ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="priority"
                    value={p}
                    checked={form.priority === p}
                    onChange={onChange}
                  />
                  {p}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
