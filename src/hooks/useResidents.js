import { useMemo } from 'react';
import { useApp } from '../context/AppContext';

export function useResidents({ query = '', paymentStatus = 'ALL', payments = [] } = {}) {
  const { residents, loading, error } = useApp();

  const paymentMap = useMemo(() => {
    const map = new Map();
    payments.forEach((p) => map.set(p.residentId, p));
    return map;
  }, [payments]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return residents.filter((r) => {
      const payment = paymentMap.get(r.id);
      if (paymentStatus === 'PAID' && payment?.status !== 'PAID') return false;
      if (paymentStatus === 'PENDING' && payment?.status !== 'PENDING') return false;

      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        String(r.phone).includes(q) ||
        String(r.roomNumber).includes(q)
      );
    });
  }, [residents, query, paymentStatus, paymentMap]);

  return { residents: filtered, allResidents: residents, loading, error, paymentMap };
}
