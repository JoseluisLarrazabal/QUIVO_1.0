const API_BASE_URL = 'http://192.168.0.5:3000/api'; // IP de la máquina para acceso móvil

class ApiService {
  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log('Making API request to:', url);

      const response = await fetch(url, {
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