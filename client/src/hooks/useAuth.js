import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

/**
 * useAuth — Access the global auth context.
 *
 * Returns: { user, isAuthenticated, isLoading, login, register, logout, setUser }
 *
 * Must be used inside <AuthProvider>.
 */
const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an <AuthProvider>. ' +
      'Ensure your component tree is wrapped with <AuthProvider> in App.jsx.'
    );
  }

  return context;
};

export default useAuth;
