// src/lib/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);

  const fetchMe = async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);
      const me = await api.get('/auth/me');
      setUser(me);
    } catch (err) {
      setUser(null);
      // if 401, treat as auth_required
      setAuthError({ type: 'auth_required', message: 'Authentication required' });
    } finally {
      setIsLoadingAuth(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const navigateToLogin = () => {
    // For now, just send to /welcome (Landing) where login UI lives
    window.location.href = '/welcome';
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('auth_token', res.token);
    await fetchMe();
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    window.location.href = '/welcome';
  };

  const value = {
    user,
    isLoadingAuth,
    isLoadingPublicSettings,
    authError,
    navigateToLogin,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);