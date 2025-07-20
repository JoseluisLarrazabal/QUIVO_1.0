const { 
  register,
  metricsMiddleware,
  recordAuthMetric,
  recordJwtMetric,
  recordTransactionMetric,
  recordRateLimitMetric,
  recordErrorMetric,
  updateActiveUsers,
  updateActiveCards,
  recordCardBalance,
  recordDbQuery,
  metricsEndpoint,
  getMetricsAsJson,
  clearMetrics
} = require('../../config/metrics');

describe('Sistema de Métricas', () => {
  beforeEach(() => {
    // Limpiar métricas antes de cada test
    clearMetrics();
  });

  describe('Métricas de Autenticación', () => {
    test('debería registrar autenticación exitosa', () => {
      expect(() => {
        recordAuthMetric('credentials', true);
      }).not.toThrow();
    });

    test('debería registrar autenticación fallida', () => {
      expect(() => {
        recordAuthMetric('credentials', false, 'invalid_password');
      }).not.toThrow();
    });

    test('debería registrar autenticación por tarjeta', () => {
      expect(() => {
        recordAuthMetric('card', true);
      }).not.toThrow();
    });
  });

  describe('Métricas de JWT', () => {
    test('debería registrar tokens generados', () => {
      expect(() => {
        recordJwtMetric('access', 'generated');
        recordJwtMetric('refresh', 'generated');
      }).not.toThrow();
    });

    test('debería registrar tokens expirados', () => {
      expect(() => {
        recordJwtMetric('access', 'expired');
        recordJwtMetric('refresh', 'expired');
      }).not.toThrow();
    });

    test('debería registrar refresh exitoso', () => {
      expect(() => {
        recordJwtMetric('refresh', 'refresh_success');
      }).not.toThrow();
    });

    test('debería registrar refresh fallido', () => {
      expect(() => {
        recordJwtMetric('refresh', 'refresh_failed');
      }).not.toThrow();
    });
  });

  describe('Métricas de Transacciones', () => {
    test('debería registrar transacciones exitosas', () => {
      expect(() => {
        recordTransactionMetric('validation', 'success');
        recordTransactionMetric('recharge', 'success');
      }).not.toThrow();
    });

    test('debería registrar transacciones fallidas', () => {
      expect(() => {
        recordTransactionMetric('validation', 'failed');
        recordTransactionMetric('recharge', 'failed');
      }).not.toThrow();
    });
  });

  describe('Métricas de Rate Limiting', () => {
    test('debería registrar hits de rate limiting', () => {
      expect(() => {
        recordRateLimitMetric('192.168.1.1', '/api/auth/login');
      }).not.toThrow();
    });
  });

  describe('Métricas de Errores', () => {
    test('debería registrar errores por tipo', () => {
      expect(() => {
        recordErrorMetric('auth', 'TOKEN_EXPIRED');
        recordErrorMetric('validation', 'MISSING_FIELDS');
        recordErrorMetric('database', 'CONNECTION_ERROR');
      }).not.toThrow();
    });
  });

  describe('Métricas de Usuarios y Tarjetas', () => {
    test('debería actualizar métricas de usuarios activos', () => {
      expect(() => {
        updateActiveUsers(100);
        updateActiveUsers(150);
      }).not.toThrow();
    });

    test('debería actualizar métricas de tarjetas activas', () => {
      expect(() => {
        updateActiveCards(50);
        updateActiveCards(75);
      }).not.toThrow();
    });

    test('debería registrar saldos de tarjetas', () => {
      expect(() => {
        recordCardBalance(25.50);
        recordCardBalance(100.00);
        recordCardBalance(5.25);
      }).not.toThrow();
    });
  });

  describe('Métricas de Base de Datos', () => {
    test('debería registrar duración de queries', () => {
      expect(() => {
        recordDbQuery('find', 'users', 0.05);
        recordDbQuery('insert', 'cards', 0.1);
        recordDbQuery('update', 'transactions', 0.02);
      }).not.toThrow();
    });
  });

  describe('Middleware de Métricas', () => {
    test('debería ser una función middleware válida', () => {
      expect(typeof metricsMiddleware).toBe('function');
      expect(metricsMiddleware.length).toBe(3); // req, res, next
    });

    test('debería manejar requests sin errores', () => {
      const req = {
        method: 'GET',
        url: '/test',
        route: { path: '/test' },
        ip: '192.168.1.1'
      };
      
      const res = {
        on: jest.fn(),
        statusCode: 200
      };
      
      const next = jest.fn();
      
      expect(() => {
        metricsMiddleware(req, res, next);
      }).not.toThrow();
      
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Endpoint de Métricas', () => {
    test('debería ser una función válida', () => {
      expect(typeof metricsEndpoint).toBe('function');
    });

    test('debería manejar requests sin errores', async () => {
      const req = {};
      const res = {
        set: jest.fn(),
        end: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      await metricsEndpoint(req, res);
      
      expect(res.set).toHaveBeenCalledWith('Content-Type', expect.any(String));
      expect(res.end).toHaveBeenCalled();
    });
  });

  describe('Obtener Métricas como JSON', () => {
    test('debería devolver métricas en formato JSON', async () => {
      // Registrar algunas métricas
      recordAuthMetric('credentials', true);
      recordTransactionMetric('validation', 'success');
      
      const metrics = await getMetricsAsJson();
      
      expect(metrics).toBeDefined();
      if (metrics !== null) {
        expect(Array.isArray(metrics)).toBe(true);
      }
    });
  });

  describe('Limpieza de Métricas', () => {
    test('debería limpiar todas las métricas', () => {
      // Registrar algunas métricas
      recordAuthMetric('credentials', true);
      recordTransactionMetric('validation', 'success');
      
      expect(() => {
        clearMetrics();
      }).not.toThrow();
    });
  });

  describe('Registro de Métricas', () => {
    test('debería tener un registro de métricas válido', () => {
      // Verificar que el registro existe y tiene métodos básicos
      expect(register).toBeDefined();
      expect(typeof register.getMetricsAsJSON).toBe('function');
      expect(typeof register.metrics).toBe('function');
      expect(typeof register.clear).toBe('function');
    });
  });
}); 