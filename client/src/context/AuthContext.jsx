import { createContext, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import api, {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  clearAuthTokens,
} from '../api/axios.js';

// ── Context ────────────────────────────────────────────────────────────────
export const AuthContext = createContext(null);

// ── Role-based redirect helper ─────────────────────────────────────────────
const getRoleHome = (role) =>
  role === 'ADMIN' ? '/admin/dashboard' : '/dashboard';

// ── Provider ───────────────────────────────────────────────────────────────
// IMPORTANT: AuthProvider must be rendered *inside* a Router (BrowserRouter or
// RouterProvider) because it calls useNavigate(). See App.jsx — we achieve
// this by putting AuthProvider inside the router's element tree, not wrapping
// RouterProvider from the outside.
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  // Start true so protected routes show a loading spinner, not a flash of /login
  const [isLoading, setIsLoading] = useState(true);

  // ── Hydrate session on mount ─────────────────────────────────────────────
  // On every app load, if we have a stored access token, hit /me to restore
  // the user object. The axios interceptor will silently refresh the token if
  // it's expired (as long as the refresh token is still valid).
  useEffect(() => {
    const hydrateSession = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);

      if (!token) {
        // No token at all — user is a guest, no need to hit the server
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get('/api/v1/auth/me');
        setUser(response.data.data.user);
      } catch {
        // /me failed (and the interceptor's refresh attempt also failed).
        // Clear tokens silently — do NOT hard-redirect here because the user
        // might be on a public page (/login, /register) where a redirect would
        // cause an infinite loop or a confusing experience.
        clearAuthTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    hydrateSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (email, password) => {
      const response = await api.post('/api/v1/auth/login', { email, password });
      const { user: loggedInUser, accessToken, refreshToken } = response.data.data;

      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      setUser(loggedInUser);

      navigate(getRoleHome(loggedInUser.role), { replace: true });
      return loggedInUser;
    },
    [navigate]
  );

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(
    async (data) => {
      const response = await api.post('/api/v1/auth/register', data);
      const { user: newUser, accessToken, refreshToken } = response.data.data;

      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      setUser(newUser);

      navigate(getRoleHome(newUser.role), { replace: true });
      return newUser;
    },
    [navigate]
  );

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      // Tell the server to revoke the refresh token
      await api.post('/api/v1/auth/logout', { refreshToken: storedRefreshToken });
    } catch {
      // Server-side revocation failure is non-fatal — still clear local state
    } finally {
      // 1. Clear React state first
      setUser(null);
      // 2. Clear stored tokens (no hard redirect — we use navigate below)
      clearAuthTokens();
      // 3. Navigate to login using React Router (keeps the SPA alive, toast works)
      navigate('/login', { replace: true });
      // 4. Show toast after navigation is queued
      toast.success('You have been signed out.');
    }
  }, [navigate]);

  // ── Context value ──────────────────────────────────────────────────────────
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    setUser, // Exposed so profile-update pages can sync the context
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
