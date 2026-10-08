import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { subscribe } from '../data/mockStore';
import { USE_MOCK } from '../services/api';
import { useAuth } from './AuthContext';
import * as residentService from '../services/residentService';
import * as roomService from '../services/roomService';
import * as paymentService from '../services/paymentService';
import * as transferService from '../services/transferService';
import * as dashboardService from '../services/dashboardService';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { admin: authAdmin } = useAuth();
  const [floors, setFloors] = useState([]);
  const [residents, setResidents] = useState([]);
  const [admin, setAdmin] = useState(
    authAdmin || { name: 'Admin', role: 'Administrator' }
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revision, setRevision] = useState(0);

  const refresh = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const [floorsData, residentsData, adminData] = await Promise.all([
        roomService.getFloors(),
        residentService.getResidents(),
        dashboardService.getCurrentAdmin(),
      ]);
      setFloors(floorsData);
      setResidents(residentsData);
      setAdmin(adminData || authAdmin);
    } catch (err) {
      setError(err.message || 'Unable to load application data.');
      if (authAdmin) setAdmin(authAdmin);
    } finally {
      setLoading(false);
    }
  }, [authAdmin]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!USE_MOCK) return undefined;
    return subscribe(() => {
      setRevision((n) => n + 1);
    });
  }, []);

  useEffect(() => {
    if (revision === 0) return;
    refresh({ silent: true });
  }, [revision, refresh]);

  const value = useMemo(
    () => ({
      floors,
      residents,
      admin: admin || authAdmin,
      loading,
      error,
      refresh,
      services: {
        residents: residentService,
        rooms: roomService,
        payments: paymentService,
        transfers: transferService,
        dashboard: dashboardService,
      },
    }),
    [floors, residents, admin, authAdmin, loading, error, refresh]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
