import axios from 'axios';

// Key used to keep the login session in the browser
export const AUTH_STORAGE_KEY = 'gc_supportdesk_auth';

// In development VITE_API_URL is empty, so requests go to "/api" and the
// Vite proxy forwards them to the Express backend on port 5000.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT to every request: "Authorization: Bearer <token>"
// (this is the format expected by middleware/authMiddleware.js)
api.interceptors.request.use((config) => {
  try {
    const saved = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
    if (saved?.token) config.headers.Authorization = `Bearer ${saved.token}`;
  } catch {
    /* no saved session */
  }
  return config;
});

// If the token is missing / expired, the backend answers 401.
// Clear the session and send the user back to the login page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAuthCall = url.includes('/auth/login') || url.includes('/auth/register');
    if (error.response?.status === 401 && !isAuthCall) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      if (window.location.pathname !== '/login') {
        window.location.assign('/login?expired=1');
      }
    }
    return Promise.reject(error);
  }
);

// Turn any backend / network error into a readable message.
// The backend sends either { message: '...' } or { error: '...' }.
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;
  if (error.response) {
    const data = error.response.data;
    if (typeof data === 'string' && data.trim()) return data;
    return data?.message || data?.error || fallback;
  }
  if (error.request) {
    return 'Cannot reach the server. Make sure the backend is running on port 5000.';
  }
  return error.message || fallback;
}

export default api;
