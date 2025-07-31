import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para implementar lazy loading de datos
 */
export const useLazyLoading = (fetchFunction, dependencies = [], pageSize = 10) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadData = useCallback(async (isRefresh = false) => {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      const currentPage = isRefresh ? 1 : page;
      const result = await fetchFunction(currentPage, pageSize);

      if (isRefresh) {
        setData(result.data || []);
        setPage(1);
      } else {
        setData(prev => [...prev, ...(result.data || [])]);
        setPage(prev => prev + 1);
      }

      setHasMore((result.data || []).length === pageSize);
    } catch (err) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, page, pageSize, loading]);

  const refresh = useCallback(() => {
    loadData(true);
  }, [loadData]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadData(false);
    }
  }, [loading, hasMore, loadData]);

  // Cargar datos iniciales
  useEffect(() => {
    refresh();
  }, dependencies);

  return {
    data,
    loading,
    error,
    hasMore,
    refresh,
    loadMore,
  };
}; 