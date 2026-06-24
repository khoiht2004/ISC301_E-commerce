import { useCallback, useEffect, useState } from 'react';
import api from '../services/axios';

export const useStaffDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await api.get('/STAFF/dashboard');
      setStats(res.data.data);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loadingStats,
    refreshStats: fetchStats,
  };
};
