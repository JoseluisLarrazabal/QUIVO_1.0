const { logger, authLogger, transactionLogger, rateLimitLogger, requestLogger, cleanupOldLogs } = require('../../config/logger');
const fs = require('fs');
const path = require('path');

describe('Sistema de Logs Estructurados', () => {
  const logDir = path.join(__dirname, '../../logs');
  
  beforeAll(() => {
    // Crear directorio de logs si no existe
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Limpiar logs de test
    if (fs.existsSync(logDir)) {
      const files = fs.readdirSync(logDir);
      files.forEach(file => {
        if (file.includes('test')) {
          fs.unlinkSync(path.join(logDir, file));
        }
      });
    }
  });

  describe('Logger Principal', () => {
    test('debería crear logs con formato estructurado', () => {
      const testMessage = 'Test log message';
      const testMeta = { userId: '123', action: 'test' };
      
      // No debería lanzar error
      expect(() => {
        logger.info(testMessage, testMeta);
      }).not.toThrow();
    });

    test('debería manejar errores correctamente', () => {
      const testError = new Error('Test error');
      
      expect(() => {
        logger.error('Error de test', { error: testError.message, stack: testError.stack });
      }).not.toThrow();
    });

    test('debería manejar diferentes niveles de log', () => {
      expect(() => {
        logger.debug('Debug message');
        logger.info('Info message');
        logger.warn('Warning message');
        logger.error('Error message');
      }).not.toThrow();
    });
  });

  describe('Logger de Autenticación', () => {
    test('debería registrar eventos de autenticación', () => {
      const authEvent = {
        username: 'test.user',
        ip: '192.168.1.1',
        userAgent: 'Test Browser',
        success: true
      };
      
      expect(() => {
        authLogger.info('Login exitoso', authEvent);
      }).not.toThrow();
    });

    test('debería registrar intentos fallidos', () => {
      const failedAuth = {
        username: 'test.user',
        ip: '192.168.1.1',
        userAgent: 'Test Browser',
        error: 'Invalid password'
      };
      
      expect(() => {
        authLogger.warn('Login fallido', failedAuth);
      }).not.toThrow();
    });
  });

  describe('Logger de Transacciones', () => {
    test('debería registrar transacciones exitosas', () => {
      const transaction = {
        type: 'validation',
        cardUid: 'A1B2C3D4',
        amount: 2.50,
        status: 'success'
      };
      
      expect(() => {
        transactionLogger.info('Transacción procesada', transaction);
      }).not.toThrow();
    });

    test('debería registrar transacciones fallidas', () => {
      const failedTransaction = {
        type: 'recharge',
        cardUid: 'A1B2C3D4',
        amount: 10.00,
        status: 'failed',
        error: 'Insufficient funds'
      };
      
      expect(() => {
        transactionLogger.error('Transacción fallida', failedTransaction);
      }).not.toThrow();
    });
  });

  describe('Logger de Rate Limiting', () => {
    test('debería registrar eventos de rate limiting', () => {
      const rateLimitEvent = {
        ip: '192.168.1.1',
        route: '/api/auth/login',
        limit: 100,
        remaining: 0
      };
      
      expect(() => {
        rateLimitLogger.warn('Rate limit excedido', rateLimitEvent);
      }).not.toThrow();
    });
  });

  describe('Middleware de Request Logger', () => {
    test('debería ser una función middleware válida', () => {
      expect(typeof requestLogger).toBe('function');
      expect(requestLogger.length).toBe(3); // req, res, next
    });

    test('debería manejar requests sin errores', () => {
      const req = {
        method: 'GET',
        url: '/test',
        ip: '192.168.1.1',
        get: jest.fn().mockReturnValue('Test Browser'),
        user: { id: '123' }
      };
      
      const res = {
        on: jest.fn(),
        statusCode: 200
      };
      
      const next = jest.fn();
      
      expect(() => {
        requestLogger(req, res, next);
      }).not.toThrow();
      
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Limpieza de Logs Antiguos', () => {
    test('debería ser una función válida', () => {
      expect(typeof cleanupOldLogs).toBe('function');
    });

    test('debería manejar directorio inexistente', () => {
      expect(() => {
        cleanupOldLogs();
      }).not.toThrow();
    });
  });

  describe('Configuración de Entorno', () => {
    test('debería configurar niveles correctos por entorno', () => {
      const originalEnv = process.env.NODE_ENV;
      
      // Test para desarrollo
      process.env.NODE_ENV = 'development';
      expect(() => {
        logger.debug('Debug message in development');
      }).not.toThrow();
      
      // Test para producción
      process.env.NODE_ENV = 'production';
      expect(() => {
        logger.info('Info message in production');
      }).not.toThrow();
      
      // Restaurar entorno original
      process.env.NODE_ENV = originalEnv;
    });
  });
}); 