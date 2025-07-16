// Para configurar la IP del backend, crea un archivo .env en la raíz de frontend con:
// API_BASE_URL=http://TU_IP_LOCAL:3000/api

import Constants from 'expo-constants';

// Opción automática: obtiene la IP del host de Metro Bundler
const getExpoHost = () => {
  // Para proyectos managed (Expo Go)
  if (Constants.manifest?.debuggerHost) {
    return Constants.manifest.debuggerHost.split(':').shift();
  }
  // Para EAS Build y nuevas versiones de Expo
  if (Constants.expoConfig?.hostUri) {
    return Constants.expoConfig.hostUri.split(':').shift();
  }
  return null;
};

const host = getExpoHost();
const API_BASE_URL =
  (host ? `http://${host}:3000/api` : null) ||
  Constants.expoConfig?.extra?.API_BASE_URL ||
  process.env.API_BASE_URL ||
  'http://localhost:3000/api';

class ApiService {
  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log('Making API request to:', url);

      const response = await fetch(url, {
        method: 'GET', // Método por defecto
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', response.status, errorText);
        throw new Error(`Error del servidor: ${response.status} - ${errorText || 'Sin detalles'}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      
      // Manejar errores de red específicamente
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      }
      
      throw error;
    }
  }

  // Autenticación
  async login(username, password) {
    if (!username || !password) {
      throw new Error('Usuario y contraseña son requeridos');
    }
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
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

  // Tarjetas
  async getUserCards(userId) {
    if (!userId) {
      throw new Error('ID de usuario es requerido');
    }
    return this.makeRequest(`/usuario/${userId}/tarjetas`);
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
}

export const apiService = new ApiService();