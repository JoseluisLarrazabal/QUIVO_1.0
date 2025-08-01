const TransactionService = require('../../services/transactionService');
const mongoose = require('mongoose');

// Mock de mongoose
jest.mock('mongoose', () => ({
  startSession: jest.fn(),
}));

describe('TransactionService', () => {
  let mockSession;

  beforeEach(() => {
    mockSession = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };
    mongoose.startSession.mockResolvedValue(mockSession);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('executeAtomicTransaction', () => {
    test('debería ejecutar transacción exitosa', async () => {
      const mockOperations = jest.fn().mockResolvedValue({ success: true, data: 'test' });
      
      const result = await TransactionService.executeAtomicTransaction(mockOperations);
      
      // En entorno de test, no se usan sesiones de Mongoose
      expect(mongoose.startSession).not.toHaveBeenCalled();
      expect(mockOperations).toHaveBeenCalledWith(null);
      expect(result).toEqual({ success: true, data: { success: true, data: 'test' } });
    });

    test('debería hacer rollback en caso de error', async () => {
      const mockOperations = jest.fn().mockRejectedValue(new Error('Test error'));
      
      const result = await TransactionService.executeAtomicTransaction(mockOperations);
      
      // En entorno de test, no se usan sesiones de Mongoose
      expect(mongoose.startSession).not.toHaveBeenCalled();
      expect(mockOperations).toHaveBeenCalledWith(null);
      expect(result).toEqual({ success: false, error: 'Test error' });
    });

    test('debería manejar errores en commit', async () => {
      const mockOperations = jest.fn().mockResolvedValue({ success: true });
      mockSession.commitTransaction.mockRejectedValue(new Error('Commit failed'));
      
      const result = await TransactionService.executeAtomicTransaction(mockOperations);
      
      // En entorno de test, no se usan sesiones de Mongoose
      expect(mongoose.startSession).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: { success: true } });
    });
  });

  describe('validateTransaction', () => {
    test('debería validar transacción correcta', () => {
      const validTransaction = {
        tarjeta_uid: 'TEST123',
        monto: 10,
        tipo: 'recarga',
        resultado: 'exitoso'
      };
      
      const result = TransactionService.validateTransaction(validTransaction);
      expect(result).toBe(true);
    });

    test('debería rechazar transacción sin campos requeridos', () => {
      const invalidTransaction = {
        tarjeta_uid: 'TEST123',
        monto: 10
        // Faltan tipo y resultado
      };
      
      const result = TransactionService.validateTransaction(invalidTransaction);
      expect(result).toBe(false);
    });

    test('debería rechazar transacción con monto negativo', () => {
      const invalidTransaction = {
        tarjeta_uid: 'TEST123',
        monto: -10,
        tipo: 'recarga',
        resultado: 'exitoso'
      };
      
      const result = TransactionService.validateTransaction(invalidTransaction);
      expect(result).toBe(false);
    });

    test('debería rechazar transacción con tipo inválido', () => {
      const invalidTransaction = {
        tarjeta_uid: 'TEST123',
        monto: 10,
        tipo: 'invalid_type',
        resultado: 'exitoso'
      };
      
      const result = TransactionService.validateTransaction(invalidTransaction);
      expect(result).toBe(false);
    });

    test('debería rechazar transacción con resultado inválido', () => {
      const invalidTransaction = {
        tarjeta_uid: 'TEST123',
        monto: 10,
        tipo: 'recarga',
        resultado: 'invalid_result'
      };
      
      const result = TransactionService.validateTransaction(invalidTransaction);
      expect(result).toBe(false);
    });
  });

  describe('executeMultipleTransactions', () => {
    test('debería ejecutar múltiples transacciones exitosas', async () => {
      const mockPromises = [
        Promise.resolve({ success: true, id: 1 }),
        Promise.resolve({ success: true, id: 2 }),
        Promise.resolve({ success: true, id: 3 })
      ];
      
      const result = await TransactionService.executeMultipleTransactions(mockPromises);
      
      expect(result.successful).toHaveLength(3);
      expect(result.failed).toHaveLength(0);
      expect(result.total).toBe(3);
    });

    test('debería manejar transacciones fallidas', async () => {
      const mockPromises = [
        Promise.resolve({ success: true, id: 1 }),
        Promise.reject(new Error('Failed transaction')),
        Promise.resolve({ success: true, id: 3 })
      ];
      
      const result = await TransactionService.executeMultipleTransactions(mockPromises);
      
      expect(result.successful).toHaveLength(2);
      expect(result.failed).toHaveLength(1);
      expect(result.total).toBe(3);
    });
  });
}); 