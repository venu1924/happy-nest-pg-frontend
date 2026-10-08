import api, { USE_MOCK, mockDelay } from './api';
import { mockGetDashboard, mockGetAdmin } from '../data/mockStore';

/**
 * Dashboard / admin API.
 * Expected Spring Boot endpoints:
 *   GET /api/dashboard
 *   GET /api/admin/me   (Phase 2 auth will replace mock admin)
 */

export async function getDashboardStats() {
  if (USE_MOCK) {
    await mockDelay();
    return mockGetDashboard();
  }
  const { data } = await api.get('/dashboard');
  return data;
}

export async function getCurrentAdmin() {
  if (USE_MOCK) {
    await mockDelay(80);
    return mockGetAdmin();
  }
  const { data } = await api.get('/admin/me');
  return data;
}
