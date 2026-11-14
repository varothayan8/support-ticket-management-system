import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTickets } from '../api/ticketApi';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Alert, EmptyState, Loader } from '../components/Feedback';
import { PriorityBadge, StatusBadge } from '../components/Badges';
import { IconEye, IconPlus, IconRefresh, IconSearch } from '../components/Icons';
import { STATUSES, formatDate, newestFirst, ownerId, ownerName, shortId } from '../utils/format';

export default function MyTicketsPage() {
  const { user, isAdmin } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  // Admins can switch between every ticket and only their own
  const [scope, setScope] = useState(isAdmin ? 'all' : 'mine');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setTickets((await getTickets()).sort(newestFirst));
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load tickets.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return tickets
      .filter((t) => scope === 'all' || ownerId(t) === String(user.id))
      .filter((t) => status === 'All' || t.status === status)
      .filter(
        (t) =>
          !term ||
          t.title?.toLowerCase().includes(term) ||
          t.description?.toLowerCase().includes(term) ||
          shortId(t._id).toLowerCase().includes(term.replace(/^#?/, '#'))
      );
  }, [tickets, scope, status, search, user.id]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>{scope === 'all' ? 'All Support Tickets' : 'My Tickets'}</h2>
          <p className="muted">
            {scope === 'all' ? 'Every ticket submitted to SupportDesk.' : 'Support requests you have submitted.'}
          </p>
        </div>
        <Link to="/tickets/new" className="btn btn-primary">
          <IconPlus size={18} /> Create Ticket
        </Link>
      </div>

      <section className="card">
        <div className="toolbar">
          <div className="search">
            <IconSearch size={18} />
            <input
              type="search"
              placeholder="Search by title, description or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search tickets"
            />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
            <option value="All">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {isAdmin && (
            <select value={scope} onChange={(e) => setScope(e.target.value)} aria-label="Ticket scope">
              <option value="all">All users</option>
              <option value="mine">Only mine</option>
            </select>
          )}
          <button type="button" className="btn btn-secondary btn-icon" onClick={load} title="Refresh" aria-label="Refresh">
            <IconRefresh size={18} />
          </button>
        </div>

        <Alert onRetry={load}>{error}</Alert>

        {loading ? (
          <Loader label="Loading tickets..." />
        ) : visible.length === 0 ? (
          <EmptyState
            title={tickets.length ? 'No tickets match your filters' : 'No tickets yet'}
            text={tickets.length ? 'Try a different search term or status.' : 'Create a ticket to get help from the support team.'}
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Title</th>
                    {scope === 'all' && <th className="hide-md">Created By</th>}
                    <th>Priority</th>
                    <th>Status</th>
                    <th className="hide-sm">Created Date</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((t) => (
                    <tr key={t._id}>
                      <td className="mono" title={t._id}>{shortId(t._id)}</td>
                      <td className="cell-title">{t.title}</td>
                      {scope === 'all' && <td className="hide-md">{ownerName(t)}</td>}
                      <td><PriorityBadge priority={t.priority} /></td>
                      <td><StatusBadge status={t.status} /></td>
                      <td className="hide-sm nowrap">{formatDate(t.createdAt)}</td>
                      <td className="text-right">
                        <Link to={`/tickets/${t._id}`} className="btn btn-outline btn-sm">
                          <IconEye size={16} /> <span className="hide-xs">View Details</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="table-foot muted">
              Showing {visible.length} of {scope === 'all' ? tickets.length : tickets.filter((t) => ownerId(t) === String(user.id)).length} tickets
            </p>
          </>
        )}
      </section>
    </div>
  );
}
