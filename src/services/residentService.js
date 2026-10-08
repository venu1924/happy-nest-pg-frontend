import api, { USE_MOCK, mockDelay } from './api';
import {
  mockGetResidents,
  mockGetResident,
  mockAddResident,
  mockUpdateResident,
  mockDeleteResident,
  mockGetPastResidents,
} from '../data/mockStore';

/**
 * Resident API surface.
 * Expected Spring Boot endpoints (adjust as needed):
 *   GET    /api/residents
 *   GET    /api/residents/past
 *   GET    /api/residents/{id}
 *   POST   /api/residents
 *   PUT    /api/residents/{id}
 *   DELETE /api/residents/{id}
 */

export async function getResidents() {
  if (USE_MOCK) {
    await mockDelay();
    return mockGetResidents();
  }
  const { data } = await api.get('/residents');
  return data;
}

export async function getResidentById(id) {
  if (USE_MOCK) {
    await mockDelay();
    return mockGetResident(id);
  }
  const { data } = await api.get(`/residents/${id}`);
  return data;
}

export async function createResident(payload) {
  // payload includes sharingType ('SINGLE' | 'DOUBLE') and deposit (number)
  if (USE_MOCK) {
    await mockDelay(250);
    return mockAddResident(payload);
  }
  const { data } = await api.post('/residents', payload);
  return data;
}

export async function updateResident(id, payload) {
  if (USE_MOCK) {
    await mockDelay(250);
    return mockUpdateResident(id, payload);
  }
  const { data } = await api.put(`/residents/${id}`, payload);
  return data;
}

export async function deleteResident(id, payload = {}) {
  if (USE_MOCK) {
    await mockDelay(250);
    return mockDeleteResident(id, payload);
  }
  const { data } = await api.delete(`/residents/${id}`, { data: payload });
  return data;
}

export async function getPastResidents() {
  if (USE_MOCK) {
    await mockDelay();
    return mockGetPastResidents();
  }
  const { data } = await api.get('/residents/past');
  return data;
}
