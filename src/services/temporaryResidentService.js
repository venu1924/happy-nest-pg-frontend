import api, { USE_MOCK, mockDelay } from './api';

export async function getTemporaryResidents() {
  if (USE_MOCK) {
    await mockDelay();
    return [];
  }
  const { data } = await api.get('/temporary-residents');
  return data;
}

export async function getTemporaryResident(id) {
  if (USE_MOCK) {
    await mockDelay();
    return null;
  }
  const { data } = await api.get(`/temporary-residents/${id}`);
  return data;
}

export async function createTemporaryResident(payload) {
  if (USE_MOCK) {
    await mockDelay();
    throw new Error('Temporary stays need the live API.');
  }
  const { data } = await api.post('/temporary-residents', payload);
  return data;
}

export async function extendTemporaryStay(id, extraDays) {
  const { data } = await api.put(`/temporary-residents/${id}/extend`, { extraDays });
  return data;
}

export async function markTemporaryPaid(id, payload) {
  const { data } = await api.put(`/temporary-residents/${id}/mark-paid`, payload);
  return data;
}

export async function deleteTemporaryResident(id) {
  const { data } = await api.delete(`/temporary-residents/${id}`);
  return data;
}
