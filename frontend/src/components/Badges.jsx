// Coloured labels for ticket status, priority and user role

const statusClass = {
  Open: 'badge-open',
  'In Progress': 'badge-progress',
  Resolved: 'badge-resolved',
};

const priorityClass = {
  Low: 'badge-low',
  Medium: 'badge-medium',
  High: 'badge-high',
};

export function StatusBadge({ status }) {
  return <span className={`badge ${statusClass[status] || ''}`}>{status || 'Unknown'}</span>;
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`badge badge-dot ${priorityClass[priority] || ''}`}>{priority || 'Unknown'}</span>
  );
}

export function RoleBadge({ role }) {
  return (
    <span className={`badge ${role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
      {role === 'admin' ? 'Admin' : 'User'}
    </span>
  );
}
