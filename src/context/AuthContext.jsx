import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  clearSession,
  getStoredAdmin,
  getStoredToken,
  isLoggedIn,
  login as loginRequest,
  logout as logoutRequest,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [admin, setAdmin] = useState(() => getStoredAdmin());

  const login = useCallback(async (username, password) => {
    const data = await loginRequest(username, password);
    setToken(data.token);
    setAdmin(data.admin);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setToken(null);
    setAdmin(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      admin,
      isAuthenticated: Boolean(token) || isLoggedIn(),
      login,
      logout,
      clearSession,
    }),
    [token, admin, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
