import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Only logged-in users can see the wrapped page.
// Add adminOnly to also require role === 'admin'.
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, signedOut } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Remember the page so the user returns to it after logging in
    // (but not when they signed out on purpose)
    return <Navigate to="/login" replace state={signedOut ? undefined : { from: location }} />;
  }
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace state={{ denied: true }} />;
  }
  return children;
}
