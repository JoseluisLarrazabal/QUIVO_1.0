// Configuración de variables de entorno
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache simple para respuestas GET
const responseCache = new Map();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutos

// Métricas de rendimiento
const performanceMetrics = {
  requests: 0,
  cacheHits: 0,
  errors: 0,
  avgResponseTime: 0,
  lastRequestTime: 0
};

// Función para actualizar métricas
const updateMetrics = (type, responseTime = 0) => {
  performanceMetrics.requests++;
  performanceMetrics.lastRequestTime = Date.now();
  
  if (type === 'cache') {
    performanceMetrics.cacheHits++;
  } else if (type === 'error') {
    performanceMetrics.errors++;
  }
  
  // Calcular tiempo promedio de respuesta
  if (responseTime > 0) {
    const total = performanceMetrics.avgResponseTime * (performanceMetrics.requests - 1) + responseTime;
    performanceMetrics.avgResponseTime = total / performanceMetrics.requests;
  }
};

// Función para obtener métricas
const getMetrics = () => {
  const successRate = performanceMetrics.requests > 0 
    ? ((performanceMetrics.requests - performanceMetrics.errors) / performanceMetrics.requests * 100).toFixed(2)
    : 0;
    
  return {
    ...performanceMetrics,
    successRate: `${successRate}%`,
    cacheHitRate: performanceMetrics.requests > 0 
      ? `${((performanceMetrics.cacheHits / performanceMetrics.requests) * 100).toFixed(2)}%`
      : '0%'
  };
};

// Función para detectar IP del host automáticamente
const detectHostIP = async () => {
  try {
    // Método 1: Intentar obtener la IP desde Expo Dev Server
    try {
      const response = await fetch('http://localhost:8081/status');
      const data = await response.json();
      if (data && data.host) {
        return data.host.split(':')[0];
      }
    } catch (error) {
      console.log('Expo Dev Server no disponible:', error.message);
    }

    // Método 2: Intentar obtener desde Metro Bundler
    try {
      const response = await fetch('http://localhost:8081/');
      if (response.ok) {
        // Si Metro está corriendo, intentar detectar IP desde network interfaces
        return await detectLocalIP();
      }
    } catch (error) {
      console.log('Metro Bundler no disponible:', error.message);
    }

    // Método 3: Detección de red local
    return await detectLocalIP();
  } catch (error) {
    console.log('No se pudo detectar IP automáticamente:', error.message);
  }
  return null;
};

// Función para detectar IP local usando network interfaces
const detectLocalIP = async () => {
  try {
    // Método 1: Intentar obtener IP desde el sistema (solo funciona en desarrollo)
    let systemIP = null;
    try {
      // En React Native, podemos intentar obtener la IP del dispositivo
      const { Platform } = require('react-native');
      if (Platform.OS === 'web') {
        // En web, intentar obtener IP local
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        systemIP = data.ip;
      }
    } catch (error) {
      console.log('No se pudo obtener IP del sistema:', error.message);
    }

    // Método 2: Intentar diferentes IPs comunes en redes locales
    const commonIPs = [
      systemIP, // IP del sistema si se pudo obtener
      '192.168.0.146', // Tu IP específica
      '192.168.1.1',
      '192.168.0.1', 
      '192.168.1.100',
      '192.168.0.100',
      '10.0.0.1',
      '172.16.0.1'
    ].filter(Boolean); // Filtrar IPs undefined

    for (const ip of commonIPs) {
      try {
        const response = await fetch(`http://${ip}:8081/`, { 
          method: 'HEAD',
          timeout: 1000 
        });
        if (response.ok) {
          console.log('🔍 IP detectada desde Metro:', ip);
          return ip;
        }
      } catch (error) {
        // Continuar con la siguiente IP
      }
    }
  } catch (error) {
    console.log('Error en detección de IP local:', error.message);
  }
  return null;
};

// Función para detectar automáticamente la IP del backend
const detectBackendIP = async () => {
  try {
    // Lista de IPs comunes para probar
    const testIPs = [
      '192.168.0.146', // Tu IP específica
      '192.168.1.1',
      '192.168.0.1', 
      '192.168.1.100',
      '192.168.0.100',
      '10.0.0.1',
      '172.16.0.1'
    ];

    console.log('🔍 Detectando IP del backend...');

    for (const ip of testIPs) {
      try {
        console.log(`🔍 Probando IP: ${ip}`);
        
        // Probar endpoint de health si existe
        try {
          const healthResponse = await fetch(`http://${ip}:3000/api/health`, { 
            method: 'GET',
            timeout: 2000 
          });
          
          if (healthResponse.ok) {
            console.log(`✅ Backend encontrado en: ${ip} (health endpoint)`);
            return ip;
          }
        } catch (error) {
          // Si no hay health endpoint, probar con cualquier endpoint
          console.log(`🔍 Probando endpoint genérico en: ${ip}`);
          const response = await fetch(`http://${ip}:3000/api/auth/login`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'test', password: 'test' }),
            timeout: 2000 
          });
          
          // Si responde (aunque sea con error), significa que el backend está ahí
          if (response.status === 400 || response.status === 401) {
            console.log(`✅ Backend encontrado en: ${ip} (auth endpoint)`);
            return ip;
          }
        }
      } catch (error) {
        console.log(`❌ IP ${ip} no responde:`, error.message);
      }
    }

    console.log('❌ No se pudo detectar IP del backend');
    return null;
  } catch (error) {
    console.log('Error en detección de backend:', error.message);
    return null;
  }
};

// Configuración de entorno dinámica
let API_BASE_URL = null;
let isConfiguring = false;

// Claves para persistencia
const CONFIG_STORAGE_KEY = 'api_base_url_config';
const CONFIG_TIMESTAMP_KEY = 'api_base_url_timestamp';
const CONFIG_TTL = 24 * 60 * 60 * 1000; // 24 horas

// Función para cargar configuración persistida
const loadPersistedConfig = async () => {
  try {
    const [url, timestamp] = await Promise.all([
      AsyncStorage.getItem(CONFIG_STORAGE_KEY),
      AsyncStorage.getItem(CONFIG_TIMESTAMP_KEY)
    ]);
    
    if (url && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      if (age < CONFIG_TTL) {
        console.log('📦 Cargando configuración persistida:', url);
        return url;
      }
    }
  } catch (error) {
    console.log('❌ Error cargando configuración persistida:', error.message);
  }
  return null;
};

// Función para persistir configuración
const persistConfig = async (url) => {
  try {
    await Promise.all([
      AsyncStorage.setItem(CONFIG_STORAGE_KEY, url),
      AsyncStorage.setItem(CONFIG_TIMESTAMP_KEY, Date.now().toString())
    ]);
    console.log('💾 Configuración persistida:', url);
  } catch (error) {
    console.log('❌ Error persistiendo configuración:', error.message);
  }
};

const getEnvironmentConfig = async () => {
  // Primero, intentar cargar configuración persistida
  const persistedUrl = await loadPersistedConfig();
  if (persistedUrl) {
    return persistedUrl;
  }

  // En tests, siempre usar la configuración mockeada
  if (process.env.NODE_ENV === 'test') {
    return Constants.expoConfig?.extra?.API_BASE_URL || 'http://localhost:3000/api';
  }
  
  const isDevelopment = process.env.EXPO_PUBLIC_APP_ENV === 'development' || 
                       process.env.NODE_ENV === 'development';
  
  const isStandalone = Constants.appOwnership === 'standalone' || 
                       (Constants.appOwnership === 'expo' && !Constants.manifest?.debuggerHost);
  
  // Prioridad: Variables de entorno > Configuración de Expo > Fallbacks
  if (isStandalone || !isDevelopment) {
    return process.env.EXPO_PUBLIC_API_BASE_URL_PROD ||
           Constants.expoConfig?.extra?.API_BASE_URL_PRODUCTION ||
           'https://quivo-backend-3vhv.onrender.com/api';
  }
  
  // Desarrollo: Detección automática inteligente
  const getExpoHost = () => {
    if (Constants.manifest?.debuggerHost) {
      return Constants.manifest.debuggerHost.split(':').shift();
    }
    if (Constants.expoConfig?.hostUri) {
      return Constants.expoConfig.hostUri.split(':').shift();
    }
    return null;
  };
  
  const host = getExpoHost();
  let devUrl = process.env.EXPO_PUBLIC_API_BASE_URL_DEV ||
               (host ? `http://${host}:3000/api` : null) ||
               Constants.expoConfig?.extra?.API_BASE_URL;
  
  // Si no hay configuración o usa localhost, detectar automáticamente
  if (!devUrl || devUrl.includes('localhost')) {
    console.log('🔍 Configuración no encontrada, detectando backend automáticamente...');
    const detectedIP = await detectBackendIP();
    
    if (detectedIP) {
      devUrl = `http://${detectedIP}:3000/api`;
      console.log(`✅ Backend detectado automáticamente: ${detectedIP}`);
    } else {
      // Fallback a producción si no se puede detectar
      devUrl = 'https://quivo-backend-3vhv.onrender.com/api';
      console.log('⚠️ No se pudo detectar backend local, usando producción');
    }
  }
  
  return devUrl;
};

// Inicializar configuración
const initializeConfig = async () => {
  if (isConfiguring) return;
  
  isConfiguring = true;
  try {
    API_BASE_URL = await getEnvironmentConfig();
    console.log('🌐 API_BASE_URL configurado:', API_BASE_URL);
    
    // Persistir la configuración exitosa
    await persistConfig(API_BASE_URL);
  } catch (error) {
    console.error('❌ Error configurando API_BASE_URL:', error);
    // Fallback a producción
    API_BASE_URL = 'https://quivo-backend-3vhv.onrender.com/api';
    await persistConfig(API_BASE_URL);
  } finally {
    isConfiguring = false;
  }
};

// Inicializar inmediatamente
initializeConfig();

class ApiService {
  constructor() {
    this.accessToken = null;
  }

  async setAccessToken(token) {
    this.accessToken = token;
    if (token) {
      await AsyncStorage.setItem('accessToken', token);
    } else {
      await AsyncStorage.removeItem('accessToken');
    }
  }

  async getAccessToken() {
    if (this.accessToken) return this.accessToken;
    const token = await AsyncStorage.getItem('accessToken');
    this.accessToken = token;
    return token;
  }

  async makeRequest(endpoint, options = {}) {
    const maxRetries = parseInt(process.env.EXPO_PUBLIC_MAX_RETRY_ATTEMPTS) || 3;
    const isDebugMode = process.env.EXPO_PUBLIC_DEBUG_MODE === 'true';
    const method = options.method || 'GET';
    
    // Esperar a que la configuración esté lista
    if (!API_BASE_URL) {
      console.log('⏳ Esperando configuración de API...');
      await initializeConfig();
    }
    
    // Verificar cache para requests GET
    if (method === 'GET') {
      const cacheKey = `${method}:${endpoint}`;
      const cachedResponse = responseCache.get(cacheKey);
      if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_TTL) {
        if (isDebugMode) {
          console.log('📦 Serving from cache:', endpoint);
        }
        updateMetrics('cache');
        return cachedResponse.data;
      }
    }
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const url = `${API_BASE_URL}${endpoint}`;
        
        if (isDebugMode) {
          console.log('🔍 API Debug Info:');
          console.log('  - URL:', url);
          console.log('  - Attempt:', attempt, '/', maxRetries);
          console.log('  - API_BASE_URL:', API_BASE_URL);
        }

        // Incluir token si está presente
        const token = await this.getAccessToken();
        const headers = {
          'Content-Type': 'application/json',
          ...options.headers,
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        if (isDebugMode) {
          console.log('  - Headers:', headers);
          console.log('  - Method:', method);
        }

        const startTime = Date.now(); // Iniciar medición de tiempo
        const response = await fetch(url, {
          method,
          headers,
          ...options,
        });
        const responseTime = Date.now() - startTime; // Calcular tiempo de respuesta

        if (isDebugMode) {
          console.log('  - Response status:', response.status);
          console.log('  - Response ok:', response.ok);
          console.log('  - Response time:', `${responseTime}ms`);
        }
        
        // Actualizar métricas
        updateMetrics('success', responseTime);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', response.status, errorText);
          
          // No reintentar en errores 4xx (excepto 429)
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            throw new Error(`Error del servidor: ${response.status} - ${errorText || 'Sin detalles'}`);
          }
          
          // Para errores 5xx o 429, continuar con retry
          if (attempt === maxRetries) {
            throw new Error(`Error del servidor después de ${maxRetries} intentos: ${response.status} - ${errorText || 'Sin detalles'}`);
          }
          
          // Esperar antes del siguiente intento (backoff exponencial)
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        const data = await response.json();
        
        // Guardar en cache para requests GET exitosos
        if (method === 'GET') {
          const cacheKey = `${method}:${endpoint}`;
          responseCache.set(cacheKey, {
            data,
            timestamp: Date.now(),
          });
        }
        
        if (isDebugMode) {
          console.log('✅ API Response:', data);
        }
        return data;
      } catch (error) {
        console.error(`❌ API request failed (attempt ${attempt}/${maxRetries}):`, error);
        
        // Actualizar métricas de error
        updateMetrics('error');
        
        // No reintentar errores de red en el último intento
        if (attempt === maxRetries) {
          if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
          }
          throw error;
        }
        
        // Solo reintentar en errores de red, no en otros tipos de errores
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          // Esperar antes del siguiente intento
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // Para otros errores, no reintentar
          throw error;
        }
      }
    }
  }

  // Autenticación
  async login(username, password) {
    if (!username || !password) {
      throw new Error('Usuario y contraseña son requeridos');
    }
    const result = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    // Guardar token tras login exitoso
    if (result?.data?.tokens?.accessToken) {
      await this.setAccessToken(result.data.tokens.accessToken);
    }
    return result;
  }

  async loginWithCard(uid) {
    if (!uid || uid.trim().length === 0) {
      throw new Error('UID de tarjeta es requerido');
    }
    return this.makeRequest('/auth/login-card', {
      method: 'POST',
      body: JSON.stringify({ uid: uid.trim() }),
    });
  }

  async register(userData) {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async forgotPassword(email) {
    if (!email || !email.trim()) {
      throw new Error('Email es requerido');
    }
    return this.makeRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim() }),
    });
  }

  async resetPassword(token, newPassword) {
    if (!token || !newPassword) {
      throw new Error('Token y nueva contraseña son requeridos');
    }
    if (newPassword.length < 6) {
      throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
    }
    return this.makeRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async verifyEmail(token) {
    if (!token) {
      throw new Error('Token de verificación es requerido');
    }
    return this.makeRequest('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async resendVerificationEmail(email) {
    if (!email || !email.trim()) {
      throw new Error('Email es requerido');
    }
    return this.makeRequest('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim() }),
    });
  }

  async logout() {
    this.accessToken = null;
    await AsyncStorage.removeItem('accessToken');
  }

  // Tarjetas
  async getUserCards(userId) {
    if (!userId) {
      throw new Error('ID de usuario es requerido');
    }
    return this.makeRequest(`/usuario/${userId}/tarjetas`);
  }

  async addCardToUser(userId, cardData) {
    if (!userId) {
      throw new Error('ID de usuario es requerido');
    }
    
    if (!cardData || !cardData.uid) {
      throw new Error('UID de tarjeta es requerido');
    }

    return this.makeRequest(`/usuario/${userId}/tarjetas`, {
      method: 'POST',
      body: JSON.stringify(cardData),
    });
  }

  async updateCardAlias(uid, alias) {
    if (!uid || uid.trim().length === 0) {
      throw new Error('UID de tarjeta es requerido');
    }
    
    if (!alias || alias.trim().length === 0) {
      throw new Error('Alias es requerido');
    }

    if (alias.trim().length > 50) {
      throw new Error('Alias no puede tener más de 50 caracteres');
    }

    return this.makeRequest(`/tarjetas/${uid.trim()}`, {
      method: 'PATCH',
      body: JSON.stringify({ alias: alias.trim() }),
    });
  }

  async deleteCard(uid) {
    if (!uid || uid.trim().length === 0) {
      throw new Error('UID de tarjeta es requerido');
    }

    return this.makeRequest(`/tarjetas/${uid.trim()}`, {
      method: 'DELETE',
    });
  }

  async getCardInfo(uid) {
    if (!uid || uid.trim().length === 0) {
      throw new Error('UID de tarjeta es requerido');
    }
    return this.makeRequest(`/saldo/${uid.trim()}`);
  }

  async getTransactionHistory(uid) {
    if (!uid || uid.trim().length === 0) {
      throw new Error('UID de tarjeta es requerido');
    }
    return this.makeRequest(`/historial/${uid.trim()}`);
  }

  async rechargeCard(uid, amount, paymentMethod) {
    if (!uid || uid.trim().length === 0) {
      throw new Error('UID de tarjeta es requerido');
    }
    
    if (!amount || amount <= 0) {
      throw new Error('Monto debe ser mayor a 0');
    }
    
    if (!paymentMethod) {
      throw new Error('Método de pago es requerido');
    }

    return this.makeRequest('/recargar', {
      method: 'POST',
      body: JSON.stringify({
        uid: uid.trim(),
        monto: parseFloat(amount),
        metodo_pago: paymentMethod
      }),
    });
  }

  async validateCard(uid, validatorId) {
    if (!uid || uid.trim().length === 0) {
      throw new Error('UID de tarjeta es requerido');
    }
    
    if (!validatorId) {
      throw new Error('ID del validador es requerido');
    }

    return this.makeRequest('/validar', {
      method: 'POST',
      body: JSON.stringify({
        uid: uid.trim(),
        validador_id: validatorId
      }),
    });
  }

  // Método de prueba de conectividad
  async testConnection() {
    try {
      console.log('🧪 Testing API connection...');
      console.log('🔍 Current API_BASE_URL:', API_BASE_URL);
      console.log('🔍 isStandalone():', isStandalone());
      
      const testUrl = `${API_BASE_URL}/health`;
      console.log('🔍 Testing URL:', testUrl);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('✅ Test response status:', response.status);
      console.log('✅ Test response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.text();
        console.log('✅ Test response data:', data);
        return { success: true, data };
      } else {
        console.log('❌ Test failed with status:', response.status);
        return { success: false, status: response.status };
      }
    } catch (error) {
      console.error('❌ Test connection failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Método para limpiar cache
  clearCache() {
    responseCache.clear();
    console.log('🗑️ Cache cleared');
  }

  // Método para obtener estadísticas del cache
  getCacheStats() {
    return {
      size: responseCache.size,
      entries: Array.from(responseCache.entries()).map(([key, value]) => ({
        key,
        age: Date.now() - value.timestamp,
        ttl: CACHE_TTL
      }))
    };
  }

  // Método para obtener métricas de rendimiento
  getPerformanceMetrics() {
    return getMetrics();
  }

  // Método para obtener información de configuración
  getConfigInfo() {
    return {
      apiBaseUrl: API_BASE_URL,
      isConfigured: !!API_BASE_URL,
      isConfiguring,
      environment: process.env.EXPO_PUBLIC_APP_ENV || process.env.NODE_ENV,
      isStandalone: Constants.appOwnership === 'standalone'
    };
  }

  // Método para forzar reconfiguración
  async forceReconfigure() {
    console.log('🔄 Forzando reconfiguración de API...');
    API_BASE_URL = null;
    isConfiguring = false;
    await AsyncStorage.multiRemove([CONFIG_STORAGE_KEY, CONFIG_TIMESTAMP_KEY]);
    await initializeConfig();
  }

  // Método para probar múltiples URLs
  async testMultipleUrls() {
    const testUrls = [
      'https://quivo-backend-3vhv.onrender.com/api',
      Constants.expoConfig?.extra?.API_BASE_URL_PRODUCTION,
      Constants.expoConfig?.extra?.API_BASE_URL
    ].filter(Boolean); // Filtrar URLs undefined
    
    console.log('🧪 Testing multiple URLs...');
    
    for (const url of testUrls) {
      try {
        console.log(`🔍 Testing: ${url}`);
        const response = await fetch(`${url}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          console.log(`✅ SUCCESS: ${url}`);
          return { success: true, workingUrl: url };
        } else {
          console.log(`❌ FAILED: ${url} - Status: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ERROR: ${url} - ${error.message}`);
      }
    }
    
    return { success: false, error: 'No URLs working' };
  }
}

export const apiService = new ApiService();