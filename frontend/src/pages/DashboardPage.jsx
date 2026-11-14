import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getTickets } from '../api/ticketApi';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Alert, EmptyState, Loader, StatCard } from '../components/Feedback';
import { PriorityBadge, StatusBadge } from '../components/Badges';
import { IconCheck, IconClock, IconInbox, IconLayers, IconPlus } from '../components/Icons';
import { countByStatus, formatDate, newestFirst, ownerId, shortId } from '../utils/format';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const all = await getTickets();
      // The backend returns every ticket. Regular users only see their own here.
      setTickets(isAdmin ? all : all.filter((t) => ownerId(t) === String(user.id)));
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load tickets.'));
    } finally {
      setLoading(false);
    }
  }, [isAdmin, user.id]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = countByStatus(tickets);
  const recent = [...tickets].sort(newestFirst).slice(0, 5);
  const scope = isAdmin ? 'All tickets in the system' : 'Tickets you submitted';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Welcome back, {user.name?.split(' ')[0]}</h2>
          <p className="muted">Here is an overview of {isAdmin ? 'all support activity' : 'your support requests'}.</p>
        </div>
        <Link to="/tickets/new" className="btn btn-primary">
          <IconPlus size={18} /> Create New Ticket
        </Link>
      </div>

      {location.state?.denied && (
        <Alert type="info">The Admin Dashboard is only available to administrators.</Alert>
      )}
      <Alert onRetry={load}>{error}</Alert>

      <div className="stats-grid">
        <StatCard label="Total Tickets" value={loading ? '–' : stats.total} icon={<IconLayers />} tone="blue" hint={scope} />
        <StatCard label="Open Tickets" value={loading ? '–' : stats.open} icon={<IconInbox />} tone="sky" hint="Waiting for action" />
        <StatCard label="In Progress" value={loading ? '–' : stats.inProgress} icon={<IconClock />} tone="amber" hint="Being worked on" />
        <StatCard label="Resolved Tickets" value={loading ? '–' : stats.resolved} icon={<IconCheck />} tone="green" hint="Closed successfully" />
      </div>

      <section className="card">
        <div className="card-header">
          <h3>Recent Tickets</h3>
          <Link to="/tickets" className="btn btn-link">View all</Link>
        </div>

        {loading ? (
          <Loader label="Loading tickets..." />
        ) : recent.length === 0 ? (
          <EmptyState
            title="No tickets yet"
            text="When you submit a support request it will appear here."
            action={<Link to="/tickets/new" className="btn btn-primary">Create your first ticket</Link>}
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th className="hide-sm">Created</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t._id}>
                    <td className="mono">
                      <Link to={`/tickets/${t._id}`}>{shortId(t._id)}</Link>
                    </td>
                    <td className="cell-title">
                      <Link to={`/tickets/${t._id}`}>{t.title}</Link>
                    </td>
                    <td><PriorityBadge priority={t.priority} /></td>
                    <td><StatusBadge status={t.status} /></td>
                    <td className="hide-sm nowrap">{formatDate(t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
