import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteTicket, getTickets, updateTicket } from '../api/ticketApi';
import { deleteUser, getUsers, updateUser } from '../api/userApi';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Alert, ConfirmModal, EmptyState, Loader, StatCard } from '../components/Feedback';
import { PriorityBadge, RoleBadge } from '../components/Badges';
import { IconCheck, IconEye, IconInbox, IconLayers, IconRefresh, IconSearch, IconTrash, IconUsers } from '../components/Icons';
import { STATUSES, countByStatus, formatDate, initials, newestFirst, ownerId, ownerName, shortId } from '../utils/format';

export default function AdminDashboardPage() {
  const { user: me } = useAuth();
  const notify = useToast();

  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('tickets');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [busyId, setBusyId] = useState(null);
  const [confirm, setConfirm] = useState(null); // { kind: 'ticket' | 'user', item }

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [t, u] = await Promise.all([getTickets(), getUsers()]);
      setTickets(t.sort(newestFirst));
      setUsers(u);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load admin data.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = countByStatus(tickets);

  const ticketCountByUser = useMemo(() => {
    const map = {};
    tickets.forEach((t) => {
      const id = ownerId(t);
      map[id] = (map[id] || 0) + 1;
    });
    return map;
  }, [tickets]);

  const term = search.trim().toLowerCase();
  const visibleTickets = tickets
    .filter((t) => statusFilter === 'All' || t.status === statusFilter)
    .filter((t) => !term || t.title?.toLowerCase().includes(term) || ownerName(t).toLowerCase().includes(term) || shortId(t._id).toLowerCase().includes(term));
  const visibleUsers = users.filter(
    (u) => !term || u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term)
  );

  // ---- Ticket management -------------------------------------------------
  const changeStatus = async (ticket, status) => {
    setBusyId(ticket._id);
    try {
      await updateTicket(ticket._id, { status });
      // keep the populated createdBy from the list, just swap the status
      setTickets((list) => list.map((t) => (t._id === ticket._id ? { ...t, status } : t)));
      notify(`Ticket ${shortId(ticket._id)} marked as ${status}.`);
    } catch (err) {
      notify(getErrorMessage(err, 'Could not update status.'), 'error');
    } finally {
      setBusyId(null);
    }
  };

  // ---- User management ---------------------------------------------------
  const changeRole = async (u, role) => {
    setBusyId(u._id);
    try {
      await updateUser(u._id, { role });
      setUsers((list) => list.map((x) => (x._id === u._id ? { ...x, role } : x)));
      notify(`${u.name} is now ${role === 'admin' ? 'an admin' : 'a regular user'}.`);
    } catch (err) {
      notify(getErrorMessage(err, 'Could not change role.'), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const runDelete = async () => {
    const { kind, item } = confirm;
    setBusyId(item._id);
    try {
      if (kind === 'ticket') {
        await deleteTicket(item._id);
        setTickets((list) => list.filter((t) => t._id !== item._id));
        notify('Ticket deleted.');
      } else {
        await deleteUser(item._id);
        setUsers((list) => list.filter((u) => u._id !== item._id));
        notify('User deleted.');
      }
    } catch (err) {
      notify(getErrorMessage(err, 'Delete failed.'), 'error');
    } finally {
      setBusyId(null);
      setConfirm(null);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p className="muted">Manage every support ticket and user account.</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={load}>
          <IconRefresh size={18} /> Refresh
        </button>
      </div>

      <Alert onRetry={load}>{error}</Alert>

      <div className="stats-grid">
        <StatCard label="All Support Tickets" value={loading ? '–' : stats.total} icon={<IconLayers />} tone="blue" hint={`${stats.inProgress} in progress`} />
        <StatCard label="Total Users" value={loading ? '–' : users.length} icon={<IconUsers />} tone="slate" hint={`${users.filter((u) => u.role === 'admin').length} administrator(s)`} />
        <StatCard label="Open Tickets" value={loading ? '–' : stats.open} icon={<IconInbox />} tone="sky" hint="Need attention" />
        <StatCard label="Resolved Tickets" value={loading ? '–' : stats.resolved} icon={<IconCheck />} tone="green" hint={stats.total ? `${Math.round((stats.resolved / stats.total) * 100)}% resolution rate` : 'No tickets yet'} />
      </div>

      <section className="card">
        <div className="tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'tickets'} className={`tab ${tab === 'tickets' ? 'active' : ''}`} onClick={() => { setTab('tickets'); setSearch(''); }}>
            <IconLayers size={18} /> Ticket Management <span className="tab-count">{tickets.length}</span>
          </button>
          <button type="button" role="tab" aria-selected={tab === 'users'} className={`tab ${tab === 'users' ? 'active' : ''}`} onClick={() => { setTab('users'); setSearch(''); }}>
            <IconUsers size={18} /> User Management <span className="tab-count">{users.length}</span>
          </button>
        </div>

        <div className="toolbar">
          <div className="search">
            <IconSearch size={18} />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tab === 'tickets' ? 'Search tickets or submitters...' : 'Search users by name or email...'}
              aria-label="Search"
            />
          </div>
          {tab === 'tickets' && (
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
              <option value="All">All statuses</option>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          )}
        </div>

        {loading ? (
          <Loader />
        ) : tab === 'tickets' ? (
          visibleTickets.length === 0 ? (
            <EmptyState title="No tickets found" text="No tickets match the current filters." />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Title</th>
                    <th className="hide-md">Submitted By</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th className="hide-sm">Created</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTickets.map((t) => (
                    <tr key={t._id}>
                      <td className="mono" title={t._id}>{shortId(t._id)}</td>
                      <td className="cell-title">{t.title}</td>
                      <td className="hide-md">{ownerName(t)}</td>
                      <td><PriorityBadge priority={t.priority} /></td>
                      <td>
                        <select
                          className={`status-select st-${t.status.replace(' ', '-').toLowerCase()}`}
                          value={t.status}
                          disabled={busyId === t._id}
                          onChange={(e) => changeStatus(t, e.target.value)}
                          aria-label={`Status of ${t.title}`}
                        >
                          {STATUSES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="hide-sm nowrap">{formatDate(t.createdAt)}</td>
                      <td className="text-right nowrap">
                        <Link to={`/tickets/${t._id}`} className="btn btn-outline btn-sm" title="View details">
                          <IconEye size={16} /> <span className="hide-xs">View</span>
                        </Link>{' '}
                        <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => setConfirm({ kind: 'ticket', item: t })} title="Delete ticket" aria-label="Delete ticket">
                          <IconTrash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : visibleUsers.length === 0 ? (
          <EmptyState title="No users found" text="No users match your search." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th className="hide-sm">Email</th>
                  <th>Role</th>
                  <th className="hide-md">Tickets</th>
                  <th className="hide-md">Joined</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((u) => {
                  const isMe = String(u._id) === String(me.id);
                  return (
                    <tr key={u._id}>
                      <td>
                        <div className="user-cell">
                          <span className="avatar avatar-sm">{initials(u.name)}</span>
                          <div>
                            <div className="strong">{u.name} {isMe && <span className="you-tag">You</span>}</div>
                            <div className="muted small show-sm">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="hide-sm">{u.email}</td>
                      <td>
                        {isMe ? (
                          <RoleBadge role={u.role} />
                        ) : (
                          <select
                            className="role-select"
                            value={u.role}
                            disabled={busyId === u._id}
                            onChange={(e) => changeRole(u, e.target.value)}
                            aria-label={`Role of ${u.name}`}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                      </td>
                      <td className="hide-md">{ticketCountByUser[String(u._id)] || 0}</td>
                      <td className="hide-md nowrap">{formatDate(u.createdAt)}</td>
                      <td className="text-right">
                        <button
                          type="button"
                          className="btn btn-danger-outline btn-sm"
                          disabled={isMe}
                          title={isMe ? 'You cannot delete your own account here' : 'Delete user'}
                          onClick={() => setConfirm({ kind: 'user', item: u })}
                        >
                          <IconTrash size={16} /> <span className="hide-xs">Delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmModal
        open={Boolean(confirm)}
        title={confirm?.kind === 'user' ? 'Delete this user?' : 'Delete this ticket?'}
        message={
          confirm?.kind === 'user'
            ? `${confirm?.item.name} (${confirm?.item.email}) will be removed. Their existing tickets stay in the system.`
            : `“${confirm?.item.title}” will be permanently removed.`
        }
        onCancel={() => setConfirm(null)}
        onConfirm={runDelete}
        busy={Boolean(confirm) && busyId === confirm?.item._id}
      />
    </div>
  );
}
