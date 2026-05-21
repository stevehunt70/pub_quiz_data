// src/lib/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  // -----------------------------
  // Fetch current user (/auth/me)
  // -----------------------------
  const fetchMe = async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);

      const me = await api.get('/auth/me');
      setUser(me);
    } catch (err) {
      // No valid token → user is not authenticated
      setUser(null);
      setAuthError({ type: 'auth_required', message: 'Authentication required' });
    } finally {
      setIsLoadingAuth(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  // -----------------------------
  // Redirect to login (public)
  // -----------------------------
  const navigateToLogin = () => {
    window.location.href = '/welcome'; // PUBLIC route
  };

  // -----------------------------
  // Login
  // -----------------------------
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });

    // Save token
    localStorage.setItem('auth_token', res.token);

    // Refresh user
    await fetchMe();
  };

  // -----------------------------
  // Logout
  // -----------------------------
  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    window.location.href = '/welcome';
  };

  const value = {
    user,
    isLoadingAuth,
    authError,
    navigateToLogin,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);