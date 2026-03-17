import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

/**
 * AdminRoutes — Protected wrapper for all /admin/* routes.
 *
 * Rules:
 *  - If still loading session → show loading skeleton (prevents flash)
 *  - If not authenticated → redirect to /login
 *  - If authenticated but role is STUDENT → redirect to /dashboard
 *  - If ADMIN → render children via <Outlet />
 */
const AdminRoutes = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // ── Wait for session hydration ──────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-secondary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading CampusFlow…</p>
        </div>
      </div>
    );
  }

  // ── Not authenticated ───────────────────────────────────────────────────
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ── Wrong role ──────────────────────────────────────────────────────────
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  // ── Authorized admin ────────────────────────────────────────────────────
  return <Outlet />;
};

export default AdminRoutes;
