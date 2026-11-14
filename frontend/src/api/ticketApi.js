import api from './client';

// All routes below are protected by the JWT middleware in Project A.

// GET /api/tickets -> array of tickets (createdBy populated with name, email, role)
export const getTickets = () => api.get('/tickets').then((res) => res.data);

// GET /api/tickets/:id -> single ticket (createdBy populated with name, email)
export const getTicket = (id) => api.get(`/tickets/${id}`).then((res) => res.data);

// POST /api/tickets  body: { title, description, priority }
export const createTicket = (ticket) => api.post('/tickets', ticket).then((res) => res.data);

// PUT /api/tickets/:id  body: any of { title, description, priority, status }
// Backend rule: only the ticket creator or an admin can update.
export const updateTicket = (id, changes) =>
  api.put(`/tickets/${id}`, changes).then((res) => res.data);

// DELETE /api/tickets/:id  -> { message }
// Backend rule: only the ticket creator or an admin can delete.
export const deleteTicket = (id) => api.delete(`/tickets/${id}`).then((res) => res.data);
