import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: read user from localStorage (if exists) and validate session with /api/auth/me
  useEffect(() => {
    const storedUser = localStorage.getItem('ttm_user');
    if (!storedUser) {
      setLoading(false);
      return;
    }

    api
      .get('/api/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => {
        // Session is invalid or expired — clear storage
        localStorage.removeItem('ttm_user');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((userData) => {
    localStorage.setItem('ttm_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      localStorage.removeItem('ttm_user');
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
