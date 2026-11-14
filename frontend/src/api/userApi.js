import api from './client';

// GET /api/users -> array of users (password is never returned)
export const getUsers = () => api.get('/users').then((res) => res.data);

// PUT /api/users/:id  body: any of { name, email, password, role }
// Backend rule: owner or admin; only an admin can change "role".
export const updateUser = (id, changes) =>
  api.put(`/users/${id}`, changes).then((res) => res.data);

// DELETE /api/users/:id -> { message }  (owner or admin)
export const deleteUser = (id) => api.delete(`/users/${id}`).then((res) => res.data);
