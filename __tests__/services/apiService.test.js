import { 
  login, 
  register, 
  getCardBalance, 
  getTransactionHistory, 
  rechargeCard 
} from '../../src/services/apiService';

// Mock fetch global
global.fetch = jest.fn();

describe('API Service', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('login', () => {
    test('debería hacer login exitosamente', async () => {
      const mockResponse = {
        success: true,
        data: {
          user: {
            id: '123',
            username: 'testuser',
            nombre: 'Test User',
            tipo_tarjeta: 'adulto'
          },
          cards: [
            { uid: 'A1B2C3D4', saldo_actual: 25.00 }
          ]
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await login('testuser', '123456');

      expect(fetch).toHaveBeenCalledWith('http://192.168.0.5:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testuser',
          password: '123456'
        })
      });

      expect(result).toEqual(mockResponse);
    });

    test('debería manejar error de red', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(login('testuser', '123456')).rejects.toThrow('Network error');
    });

    test('debería manejar respuesta de error del servidor', async () => {
      const mockErrorResponse = {
        success: false,
        error: 'Usuario o contraseña incorrectos'
      };

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => mockErrorResponse
      });

      const result = await login('testuser', 'wrongpassword');

      expect(result).toEqual(mockErrorResponse);
    });
  });

  describe('register', () => {
    test('debería registrar usuario exitosamente', async () => {
      const userData = {
        username: 'newuser',
        password: '123456',
        nombre: 'New User',
        tipo_tarjeta: 'adulto',
        email: 'newuser@example.com',
        telefono: '59171234567'
      };

      const mockResponse = {
        success: true,
        data: {
          user: {
            id: '456',
            username: 'newuser',
            nombre: 'New User',
            tipo_tarjeta: 'adulto'
          }
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await register(userData);

      expect(fetch).toHaveBeenCalledWith('http://192.168.0.5:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      expect(result).toEqual(mockResponse);
    });

    test('debería manejar error de registro', async () => {
      const userData = {
        username: 'existinguser',
        password: '123456',
        nombre: 'Existing User',
        tipo_tarjeta: 'adulto'
      };

      const mockErrorResponse = {
        success: false,
        error: 'El nombre de usuario ya está en uso'
      };

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockErrorResponse
      });

      const result = await register(userData);

      expect(result).toEqual(mockErrorResponse);
    });
  });

  describe('getCardBalance', () => {
    test('debería obtener saldo de tarjeta exitosamente', async () => {
      const mockResponse = {
        success: true,
        data: {
          uid: 'A1B2C3D4',
          nombre: 'Test User',
          tipo_tarjeta: 'adulto',
          saldo_actual: 25.00,
          fecha_creacion: '2024-01-15T10:30:00Z'
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await getCardBalance('A1B2C3D4');

      expect(fetch).toHaveBeenCalledWith('http://192.168.0.5:3000/api/saldo/A1B2C3D4', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      expect(result).toEqual(mockResponse);
    });

    test('debería manejar tarjeta no encontrada', async () => {
      const mockErrorResponse = {
        success: false,
        error: 'Tarjeta no encontrada'
      };

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => mockErrorResponse
      });

      const result = await getCardBalance('NONEXISTENT');

      expect(result).toEqual(mockErrorResponse);
    });
  });

  describe('getTransactionHistory', () => {
    test('debería obtener historial de transacciones', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: 1,
            tarjeta_uid: 'A1B2C3D4',
            monto: -2.50,
            tipo: 'viaje',
            ubicacion: 'Línea A - El Alto',
            fecha_hora: '2024-01-15T08:30:00Z',
            resultado: 'exitoso'
          },
          {
            id: 2,
            tarjeta_uid: 'A1B2C3D4',
            monto: 20.00,
            tipo: 'recarga',
            ubicacion: 'Recarga efectivo',
            fecha_hora: '2024-01-15T07:00:00Z',
            resultado: 'exitoso'
          }
        ]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await getTransactionHistory('A1B2C3D4');

      expect(fetch).toHaveBeenCalledWith('http://192.168.0.5:3000/api/historial/A1B2C3D4', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      expect(result).toEqual(mockResponse);
    });

    test('debería obtener historial con parámetros de paginación', async () => {
      const mockResponse = {
        success: true,
        data: []
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await getTransactionHistory('A1B2C3D4', 10, 5);

      expect(fetch).toHaveBeenCalledWith('http://192.168.0.5:3000/api/historial/A1B2C3D4?limit=10&offset=5', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
    });
  });

  describe('rechargeCard', () => {
    test('debería recargar tarjeta exitosamente', async () => {
      const rechargeData = {
        uid: 'A1B2C3D4',
        monto: 20.00,
        metodo_pago: 'efectivo'
      };

      const mockResponse = {
        success: true,
        message: 'Recarga exitosa',
        data: {
          nuevo_saldo: 45.00,
          transaccion: {
            id: 1,
            tarjeta_uid: 'A1B2C3D4',
            monto: 20.00,
            tipo: 'recarga',
            resultado: 'exitoso'
          }
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await rechargeCard(rechargeData.uid, rechargeData.monto, rechargeData.metodo_pago);

      expect(fetch).toHaveBeenCalledWith('http://192.168.0.5:3000/api/recargar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rechargeData)
      });

      expect(result).toEqual(mockResponse);
    });

    test('debería usar método de pago por defecto', async () => {
      const mockResponse = {
        success: true,
        message: 'Recarga exitosa',
        data: { nuevo_saldo: 45.00 }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await rechargeCard('A1B2C3D4', 20.00);

      expect(fetch).toHaveBeenCalledWith('http://192.168.0.5:3000/api/recargar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: 'A1B2C3D4',
          monto: 20.00,
          metodo_pago: 'efectivo'
        })
      });
    });

    test('debería manejar error de recarga', async () => {
      const mockErrorResponse = {
        success: false,
        error: 'Tarjeta no encontrada'
      };

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => mockErrorResponse
      });

      const result = await rechargeCard('NONEXISTENT', 20.00);

      expect(result).toEqual(mockErrorResponse);
    });
  });

  describe('Manejo de errores generales', () => {
    test('debería manejar errores de red', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(login('testuser', '123456')).rejects.toThrow('Network error');
      await expect(register({})).rejects.toThrow('Network error');
      await expect(getCardBalance('A1B2C3D4')).rejects.toThrow('Network error');
      await expect(getTransactionHistory('A1B2C3D4')).rejects.toThrow('Network error');
      await expect(rechargeCard('A1B2C3D4', 20.00)).rejects.toThrow('Network error');
    });

    test('debería manejar respuestas no JSON', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error'
      });

      const result = await login('testuser', '123456');

      expect(result).toEqual({
        success: false,
        error: 'Error en la respuesta del servidor'
      });
    });
  });
}); 