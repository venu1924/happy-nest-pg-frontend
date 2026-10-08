import api, { USE_MOCK, mockDelay } from './api';
import { mockTransferResident, mockGetTransfers } from '../data/mockStore';

/**
 * Room transfer API.
 * Expected Spring Boot endpoint:
 *   POST /api/residents/{id}/transfer
 *   GET  /api/transfers
 */

export async function transferResident(residentId, payload) {
  if (USE_MOCK) {
    await mockDelay(280);
    return mockTransferResident(residentId, payload);
  }
  const { data } = await api.post(`/residents/${residentId}/transfer`, payload);
  return data;
}

export async function getTransfers() {
  if (USE_MOCK) {
    await mockDelay();
    return mockGetTransfers();
  }
  const { data } = await api.get('/transfers');
  return data;
}
