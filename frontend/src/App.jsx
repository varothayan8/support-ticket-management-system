import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CreateTicketPage from './pages/CreateTicketPage';
import MyTicketsPage from './pages/MyTicketsPage';
import TicketDetailsPage from './pages/TicketDetailsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      {/* Page 1: Login and Registration (public) */}
      <Route path="/login" element={<LoginPage mode="login" />} />
      <Route path="/register" element={<LoginPage mode="register" />} />

      {/* Everything below requires a valid JWT */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />            {/* Page 2 */}
        <Route path="/tickets/new" element={<CreateTicketPage />} />       {/* Page 3 */}
        <Route path="/tickets" element={<MyTicketsPage />} />              {/* Page 4 */}
        <Route path="/tickets/:id" element={<TicketDetailsPage />} />      {/* Page 5 */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboardPage />                                         {/* Page 6 */}
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
