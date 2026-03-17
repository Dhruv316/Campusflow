import axios from 'axios';

// ── Token storage keys ─────────────────────────────────────────────────────
export const ACCESS_TOKEN_KEY = 'cf_access_token';
export const REFRESH_TOKEN_KEY = 'cf_refresh_token';

// ── Axios instance ─────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ── Request interceptor: attach access token ───────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: silent token refresh on 401 ─────────────────────
// Uses a queue to batch requests that arrive while a refresh is in-flight,
// so we only make one /refresh call even if multiple requests expire at once.

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

// Routes that should NEVER trigger a silent refresh attempt
const REFRESH_EXCLUDED_URLS = [
  '/auth/refresh',
  '/auth/login',
  '/auth/register',
];

const isExcluded = (url = '') =>
  REFRESH_EXCLUDED_URLS.some((path) => url.includes(path));

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401, once per request, and not on excluded routes
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isExcluded(originalRequest.url)
    ) {
      // If a refresh is already in-flight, queue this request to retry after
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!storedRefreshToken) {
        // No refresh token available — clear auth state without hard redirect
        // (let the AuthContext/router handle the redirect gracefully)
        clearAuthTokens();
        isRefreshing = false;
        processQueue(error, null);
        return Promise.reject(error);
      }

      try {
        // Use a raw axios call (not the intercepted instance) to avoid loops
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/auth/refresh`,
          { refreshToken: storedRefreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const { accessToken: newAccessToken } = response.data.data;

        // Persist the new access token
        localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

        // Flush the queue with the new token
        processQueue(null, newAccessToken);

        // Retry the original failed request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — session is truly expired
        processQueue(refreshError, null);
        clearAuthAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ── Auth helpers ───────────────────────────────────────────────────────────

/**
 * Clears stored tokens without redirecting.
 * Used when there's no valid refresh token but we don't want a hard redirect
 * (e.g. during initial app hydration on a public page).
 */
export const clearAuthTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  delete api.defaults.headers.common.Authorization;
};

/**
 * Clears stored tokens AND does a hard redirect to /login.
 * Only used by the interceptor when a refresh attempt fails mid-session,
 * meaning the user's session is truly expired and they must re-authenticate.
 */
export const clearAuthAndRedirect = () => {
  clearAuthTokens();
  // Hard redirect is intentional here — we're outside React's render tree
  // so we can't use navigate(). The page reload also clears any stale state.
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

export default api;
