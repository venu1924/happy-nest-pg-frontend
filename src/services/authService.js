import api, { USE_MOCK, mockDelay } from './api';
import { clearSession, persistSession } from './authStorage';

export {
  getStoredToken,
  getStoredAdmin,
  isLoggedIn,
  persistSession,
  clearSession,
} from './authStorage';

/** Fixed credentials (same defaults as Spring Boot app.auth.*) */
const MOCK_USERNAME = import.meta.env.VITE_AUTH_USERNAME || 'admin';
const MOCK_PASSWORD = import.meta.env.VITE_AUTH_PASSWORD || 'happynest@602';
const MOCK_ADMIN_NAME = import.meta.env.VITE_AUTH_ADMIN_NAME || 'Admin';

/**
 * POST /api/auth/login
 * Mock mode validates the same fixed username/password locally.
 */
export async function login(username, password) {
  if (USE_MOCK) {
    await mockDelay(200);
    if (username?.trim() !== MOCK_USERNAME || password !== MOCK_PASSWORD) {
      throw new Error('Invalid username or password.');
    }
    const admin = {
      id: 'admin-1',
      name: MOCK_ADMIN_NAME,
      role: 'Administrator',
    };
    const token = `mock.${btoa(`${MOCK_USERNAME}:${Date.now()}`)}`;
    persistSession(token, admin);
    return { token, admin };
  }

  const { data } = await api.post('/auth/login', { username, password });
  persistSession(data.token, data.admin);
  return data;
}

export async function logout() {
  clearSession();
}
