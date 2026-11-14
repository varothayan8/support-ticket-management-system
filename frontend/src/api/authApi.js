import api from './client';

// POST /api/auth/register  ->  { message, userId }
export const registerUser = (data) =>
  api.post('/auth/register', {
    name: data.name,
    email: data.email,
    password: data.password,
  }).then((res) => res.data);

// POST /api/auth/login  ->  { token, user: { id, name, email, role } }
export const loginUser = (email, password) =>
  api.post('/auth/login', { email, password }).then((res) => res.data);

// GET /api/auth/signout  ->  { message }  (JWT is stateless; the client deletes the token)
export const signoutUser = () => api.get('/auth/signout').then((res) => res.data);
