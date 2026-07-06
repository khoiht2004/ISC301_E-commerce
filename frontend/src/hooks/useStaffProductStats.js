import { useCallback, useEffect, useState } from 'react';
import api from '../services/axios';

export const useStaffProductStats = () => {
  const [stats, setStats] = useState(null);
  const [soldProducts, setSoldProducts] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStaffProductStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const [statsRes, soldRes] = await Promise.all([
        api.get('/staff/product-stats'),
        api.get('/staff/sold-products'),
      ]);

      setStats(statsRes.data.data);
      setSoldProducts(soldRes.data.data || []);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffProductStats();
  }, [fetchStaffProductStats]);

  return {
    stats,
    soldProducts,
    loadingStats,
    refreshStaffProductStats: fetchStaffProductStats,
  };
};
