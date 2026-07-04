import { useCallback, useEffect, useState } from 'react';
import { fetchVendorMetrics } from '../services/api';

export function useMetrics() {
  const [summary, setSummary] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchVendorMetrics();
      setSummary(data.summary);
      setVendors(data.vendors);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { summary, vendors, loading, error, refresh };
}
