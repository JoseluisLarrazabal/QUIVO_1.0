import { useCallback, useMemo } from 'react';

/**
 * Hook para optimizar operaciones comunes de performance
 */
export const usePerformance = () => {
  /**
   * Memoiza una función con dependencias específicas
   */
  const memoizedCallback = useCallback((callback, dependencies) => {
    return useCallback(callback, dependencies);
  }, []);

  /**
   * Memoiza un valor calculado
   */
  const memoizedValue = useMemo((factory, dependencies) => {
    return useMemo(factory, dependencies);
  }, []);

  /**
   * Debounce function para evitar llamadas excesivas
   */
  const debounce = useCallback((func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }, []);

  /**
   * Throttle function para limitar la frecuencia de llamadas
   */
  const throttle = useCallback((func, limit) => {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }, []);

  return {
    memoizedCallback,
    memoizedValue,
    debounce,
    throttle,
  };
}; 