import { useCallback, useEffect, useState } from 'react';
import { getPayments, markPaymentAsPaid } from '../services/paymentService';
import { getCurrentMonthYear } from '../utils/formatters';
import { filterPayments, summarizePayments } from '../utils/paymentUtils';
import { subscribe } from '../data/mockStore';
import { USE_MOCK } from '../services/api';

export function usePayments(initialMonthYear = getCurrentMonthYear()) {
  const [month, setMonth] = useState(initialMonthYear.month);
  const [year, setYear] = useState(initialMonthYear.year);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPayments({ month, year });
      setPayments(data);
    } catch (err) {
      setError(err.message || 'Unable to load payments.');
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!USE_MOCK) return undefined;
    return subscribe(() => load());
  }, [load]);

  const filtered = filterPayments(payments, { status, query });
  const summary = summarizePayments(payments);

  const markPaid = async (id, payload) => {
    const updated = await markPaymentAsPaid(id, payload);
    await load();
    return updated;
  };

  return {
    payments: filtered,
    allPayments: payments,
    summary,
    month,
    year,
    setMonth,
    setYear,
    query,
    setQuery,
    status,
    setStatus,
    loading,
    error,
    reload: load,
    markPaid,
  };
}
