// Para configurar la IP del backend, crea un archivo .env en la raíz de frontend con:
// API_BASE_URL=http://TU_IP_LOCAL:3000/api

import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Detectar si estamos en modo standalone (APK sin Expo Go)
const isStandalone = () => {
  return Constants.appOwnership === 'standalone' || 
         Constants.appOwnership === 'expo' && !Constants.manifest?.debuggerHost;
};

const host = getExpoHost();
const API_BASE_URL = isStandalone() 
  ? (Constants.expoConfig?.extra?.API_BASE_URL_PRODUCTION || 
     process.env.EXPO_PUBLIC_API_BASE_URL ||
     'https://quivo-backend-3vhv.onrender.com/api')
  : (host ? `http://${host}:3000/api` : null) ||
    Constants.expoConfig?.extra?.API_BASE_URL ||
    process.env.API_BASE_URL ||
    'http://localhost:3000/api';

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
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log('Making API request to:', url);

      // Incluir token si está presente
      const token = await this.getAccessToken();
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'GET', // Método por defecto
        headers,
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
}

export const apiService = new ApiService();