import { useMemo } from 'react';
import Constants from 'expo-constants';

export const useConfig = () => {
  const config = useMemo(() => {
    const isDevelopment = process.env.EXPO_PUBLIC_APP_ENV === 'development' || 
                         process.env.NODE_ENV === 'development';
    
    const isStandalone = Constants.appOwnership === 'standalone' || 
                         (Constants.appOwnership === 'expo' && !Constants.manifest?.debuggerHost);
    
    return {
      // Configuración de entorno
      isDevelopment,
      isStandalone,
      isProduction: !isDevelopment,
      
      // Configuración de API
      apiBaseUrl: isStandalone || !isDevelopment
        ? process.env.EXPO_PUBLIC_API_BASE_URL_PROD ||
          Constants.expoConfig?.extra?.API_BASE_URL_PRODUCTION ||
          'https://quivo-backend-3vhv.onrender.com/api'
        : process.env.EXPO_PUBLIC_API_BASE_URL_DEV ||
          'http://localhost:3000/api',
      
      // Configuración de debug
      debugMode: process.env.EXPO_PUBLIC_DEBUG_MODE === 'true',
      logLevel: process.env.EXPO_PUBLIC_LOG_LEVEL || 'info',
      
      // Configuración de seguridad
      sessionTimeout: parseInt(process.env.EXPO_PUBLIC_SESSION_TIMEOUT) || 3600000, // 1 hora
      maxRetryAttempts: parseInt(process.env.EXPO_PUBLIC_MAX_RETRY_ATTEMPTS) || 3,
      
      // Información de la app
      appVersion: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
      appName: Constants.expoConfig?.name || 'QUIVO',
    };
  }, []);

  return config;
}; 