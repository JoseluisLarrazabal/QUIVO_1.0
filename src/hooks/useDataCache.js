import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook para implementar cache de datos con TTL (Time To Live)
 */
export const useDataCache = (ttl = 5 * 60 * 1000) => { // 5 minutos por defecto
  const [cache, setCache] = useState(new Map());
  const cacheTimestamps = useRef(new Map());

  const isExpired = useCallback((key) => {
    const timestamp = cacheTimestamps.current.get(key);
    if (!timestamp) return true;
    return Date.now() - timestamp > ttl;
  }, [ttl]);

  const get = useCallback((key) => {
    if (isExpired(key)) {
      // Limpiar entrada expirada
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(key);
        return newCache;
      });
      cacheTimestamps.current.delete(key);
      return null;
    }
    return cache.get(key);
  }, [cache, isExpired]);

  const set = useCallback((key, value) => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.set(key, value);
      return newCache;
    });
    cacheTimestamps.current.set(key, Date.now());
  }, []);

  const remove = useCallback((key) => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(key);
      return newCache;
    });
    cacheTimestamps.current.delete(key);
  }, []);

  const clear = useCallback(() => {
    setCache(new Map());
    cacheTimestamps.current.clear();
  }, []);

  const has = useCallback((key) => {
    return cache.has(key) && !isExpired(key);
  }, [cache, isExpired]);

  // Limpiar entradas expiradas periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setCache(prev => {
        const newCache = new Map();
        for (const [key, value] of prev) {
          if (!isExpired(key)) {
            newCache.set(key, value);
          } else {
            cacheTimestamps.current.delete(key);
          }
        }
        return newCache;
      });
    }, ttl / 2); // Limpiar cada medio TTL

    return () => clearInterval(interval);
  }, [ttl, isExpired]);

  return {
    get,
    set,
    remove,
    clear,
    has,
    size: cache.size,
  };
}; 