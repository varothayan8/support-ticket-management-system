import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AUTH_STORAGE_KEY } from '../api/client';
import { loginUser, registerUser, signoutUser } from '../api/authApi';

const AuthContext = createContext(null);

// Read the saved session ({ token, user }) from localStorage
function readSession() {
  try {
    const saved = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
    if (!saved?.token || !saved?.user) return null;

    // The JWT expires after 1 day (see authController.login).
    // Decode the payload to check the "exp" time without calling the server.
    const payload = JSON.parse(atob(saved.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
    return saved;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);
  // true right after the user presses "Sign out" (used so the next login
  // starts on the Dashboard instead of the page the last user was on)
  const [signedOut, setSignedOut] = useState(false);

  const login = useCallback(async (email, password) => {
    const data = await loginUser(email, password); // { token, user }
    const next = { token: data.token, user: data.user };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
    setSession(next);
    setSignedOut(false);
    return data.user;
  }, []);

  // The register endpoint does not return a token, so we log in right after.
  const register = useCallback(
    async ({ name, email, password }) => {
      await registerUser({ name, email, password });
      return login(email, password);
    },
    [login]
  );

  const logout = useCallback(() => {
    // Tell the backend (GET /api/auth/signout), but don't wait for it:
    // JWT is stateless, so deleting the token is what actually signs out.
    signoutUser().catch(() => {});
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setSignedOut(true);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user || null,
      token: session?.token || null,
      isAuthenticated: Boolean(session?.token),
      isAdmin: session?.user?.role === 'admin',
      signedOut,
      login,
      register,
      logout,
    }),
    [session, signedOut, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
