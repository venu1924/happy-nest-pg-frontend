import axios from 'axios';
import { clearSession, getStoredToken } from './authStorage';

/**
 * Central Axios instance for Spring Boot integration.
 *
 * Phase 1: VITE_USE_MOCK=true → services use mockStore (no HTTP).
 * Later: set VITE_USE_MOCK=false and VITE_API_BASE_URL=http://localhost:8080/api
 */

export const USE_MOCK = String(import.meta.env.VITE_USE_MOCK ?? 'true') === 'true';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Render free tier can take 30–60s to wake from sleep
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      if (!url.includes('/auth/login')) {
        clearSession();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.assign('/login');
        }
      }
    }
    let message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';
    if (error.code === 'ECONNABORTED' || /timeout/i.test(String(message))) {
      message =
        'Server is waking up (free hosting). Wait about a minute and try Sign in again.';
    }
    return Promise.reject(new Error(message));
  }
);

export default api;

/** Small delay so loading states are visible in mock mode */
export function mockDelay(ms = 180) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
