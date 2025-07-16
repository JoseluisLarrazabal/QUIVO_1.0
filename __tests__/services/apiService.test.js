import { apiService } from '../../src/services/apiService';

// Mockear expo-constants para fijar la URL base en los tests
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      API_BASE_URL: 'http://localhost:3000/api'
    }
  }
}));

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

      const result = await apiService.login('testuser', '123456');

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/auth/login', {
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

      await expect(apiService.login('testuser', '123456')).rejects.toThrow('Network error');
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

      const result = await apiService.register(userData);

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      expect(result).toEqual(mockResponse);
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

      const result = await apiService.getCardInfo('A1B2C3D4');

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/saldo/A1B2C3D4', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      expect(result).toEqual(mockResponse);
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
            ubicacion: 'Línea A - Centro',
            resultado: 'exitoso',
            fecha_hora: '2024-01-15T10:30:00Z'
          }
        ]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiService.getTransactionHistory('A1B2C3D4');

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/historial/A1B2C3D4', { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe('rechargeCard', () => {
    test('debería recargar tarjeta exitosamente', async () => {
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

      const result = await apiService.rechargeCard('A1B2C3D4', 20.00, 'efectivo');

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/recargar', {
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

      expect(result).toEqual(mockResponse);
    });
  });

  describe('addCardToUser', () => {
    test('debería agregar tarjeta a usuario exitosamente', async () => {
      const cardData = {
        uid: 'A1B2C3D4',
        alias: 'Mi Tarjeta Principal',
        tipo_tarjeta: 'adulto',
        saldo_inicial: 10.00
      };

      const mockResponse = {
        success: true,
        data: {
          uid: 'A1B2C3D4',
          alias: 'Mi Tarjeta Principal',
          saldo_actual: 10.00
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiService.addCardToUser('123', cardData);

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/usuario/123/tarjetas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cardData)
      });

      expect(result).toEqual(mockResponse);
    });

    test('debería validar userId requerido', async () => {
      await expect(apiService.addCardToUser(null, { uid: 'A1B2C3D4' }))
        .rejects.toThrow('ID de usuario es requerido');
    });

    test('debería validar cardData requerido', async () => {
      await expect(apiService.addCardToUser('123', null))
        .rejects.toThrow('UID de tarjeta es requerido');
    });
  });

  describe('updateCardAlias', () => {
    test('debería actualizar alias exitosamente', async () => {
      const mockResponse = {
        success: true,
        data: {
          uid: 'A1B2C3D4',
          alias: 'Nuevo Alias'
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiService.updateCardAlias('A1B2C3D4', 'Nuevo Alias');

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/tarjetas/A1B2C3D4', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alias: 'Nuevo Alias' })
      });

      expect(result).toEqual(mockResponse);
    });

    test('debería validar UID requerido', async () => {
      await expect(apiService.updateCardAlias('', 'alias'))
        .rejects.toThrow('UID de tarjeta es requerido');
    });

    test('debería validar alias requerido', async () => {
      await expect(apiService.updateCardAlias('A1B2C3D4', ''))
        .rejects.toThrow('Alias es requerido');
    });

    test('debería validar longitud máxima de alias', async () => {
      const longAlias = 'a'.repeat(51);
      await expect(apiService.updateCardAlias('A1B2C3D4', longAlias))
        .rejects.toThrow('Alias no puede tener más de 50 caracteres');
    });
  });

  describe('deleteCard', () => {
    test('debería eliminar tarjeta exitosamente', async () => {
      const mockResponse = {
        success: true,
        data: {
          uid: 'A1B2C3D4',
          activa: false
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiService.deleteCard('A1B2C3D4');

      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/tarjetas/A1B2C3D4', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      expect(result).toEqual(mockResponse);
    });

    test('debería validar UID requerido', async () => {
      await expect(apiService.deleteCard(''))
        .rejects.toThrow('UID de tarjeta es requerido');
    });
  });
}); 