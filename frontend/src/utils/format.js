// Small helpers shared by several pages

export const STATUSES = ['Open', 'In Progress', 'Resolved'];
export const PRIORITIES = ['Low', 'Medium', 'High'];

// MongoDB ids are long, so we show the last 6 characters as a short ticket number
export const shortId = (id = '') => `#${String(id).slice(-6).toUpperCase()}`;

export const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// createdBy can be a populated object ({ _id, name, email }) or just an id string
export const ownerId = (ticket) =>
  ticket?.createdBy && typeof ticket.createdBy === 'object'
    ? String(ticket.createdBy._id)
    : String(ticket?.createdBy || '');

export const ownerName = (ticket) =>
  ticket?.createdBy && typeof ticket.createdBy === 'object'
    ? ticket.createdBy.name || ticket.createdBy.email
    : 'Unknown user';

export const countByStatus = (tickets) => ({
  total: tickets.length,
  open: tickets.filter((t) => t.status === 'Open').length,
  inProgress: tickets.filter((t) => t.status === 'In Progress').length,
  resolved: tickets.filter((t) => t.status === 'Resolved').length,
});

export const newestFirst = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || '?';
