const mongoose = require('mongoose');
const User = require('../../models/User');
const Card = require('../../models/Card');
const Transaction = require('../../models/Transaction');

describe('Transaction Model', () => {
  let testUser, testCard;

  beforeEach(async () => {
    testUser = await User.create({
      username: 'testuser',
      password: '123456',
      nombre: 'Test User',
      tipo_tarjeta: 'adulto',
      email: 'test@example.com'
    });

    testCard = await Card.create({
      uid: 'A1B2C3D4',
      usuario_id: testUser._id,
      saldo_actual: 25.00
    });
  });

  describe('Validaciones', () => {
    test('debería crear una transacción válida de viaje', async () => {
      const transactionData = {
        tarjeta_uid: 'A1B2C3D4',
        monto: -2.50,
        tipo: 'viaje',
        ubicacion: 'Línea A - El Alto',
        validador_id: 'VAL001',
        resultado: 'exitoso'
      };

      const transaction = new Transaction(transactionData);
      const savedTransaction = await transaction.save();

      expect(savedTransaction.tarjeta_uid).toBe(transactionData.tarjeta_uid);
      expect(savedTransaction.monto).toBe(transactionData.monto);
      expect(savedTransaction.tipo).toBe(transactionData.tipo);
      expect(savedTransaction.ubicacion).toBe(transactionData.ubicacion);
      expect(savedTransaction.validador_id).toBe(transactionData.validador_id);
      expect(savedTransaction.resultado).toBe(transactionData.resultado);
    });

    test('debería crear una transacción válida de recarga', async () => {
      const transactionData = {
        tarjeta_uid: 'A1B2C3D4',
        monto: 20.00,
        tipo: 'recarga',
        ubicacion: 'Recarga efectivo',
        resultado: 'exitoso'
      };

      const transaction = new Transaction(transactionData);
      const savedTransaction = await transaction.save();

      expect(savedTransaction.tipo).toBe('recarga');
      expect(savedTransaction.monto).toBe(20.00);
    });

    test('debería requerir tarjeta_uid', async () => {
      const transactionData = {
        monto: -2.50,
        tipo: 'viaje',
        ubicacion: 'Línea A - El Alto'
      };

      const transaction = new Transaction(transactionData);
      await expect(transaction.save()).rejects.toThrow();
    });

    test('debería requerir monto', async () => {
      const transactionData = {
        tarjeta_uid: 'A1B2C3D4',
        tipo: 'viaje',
        ubicacion: 'Línea A - El Alto'
      };

      const transaction = new Transaction(transactionData);
      await expect(transaction.save()).rejects.toThrow();
    });

    test('debería requerir tipo', async () => {
      const transactionData = {
        tarjeta_uid: 'A1B2C3D4',
        monto: -2.50,
        ubicacion: 'Línea A - El Alto'
      };

      const transaction = new Transaction(transactionData);
      await expect(transaction.save()).rejects.toThrow();
    });

    test('debería validar tipo válido', async () => {
      const transactionData = {
        tarjeta_uid: 'A1B2C3D4',
        monto: -2.50,
        tipo: 'invalido',
        ubicacion: 'Línea A - El Alto'
      };

      const transaction = new Transaction(transactionData);
      await expect(transaction.save()).rejects.toThrow();
    });

    test('debería validar resultado válido', async () => {
      const transactionData = {
        tarjeta_uid: 'A1B2C3D4',
        monto: -2.50,
        tipo: 'viaje',
        ubicacion: 'Línea A - El Alto',
        resultado: 'invalido'
      };

      const transaction = new Transaction(transactionData);
      await expect(transaction.save()).rejects.toThrow();
    });

    test('debería establecer resultado por defecto en exitoso', async () => {
      const transactionData = {
        tarjeta_uid: 'A1B2C3D4',
        monto: -2.50,
        tipo: 'viaje',
        ubicacion: 'Línea A - El Alto'
      };

      const transaction = new Transaction(transactionData);
      const savedTransaction = await transaction.save();

      expect(savedTransaction.resultado).toBe('exitoso');
    });
  });

  describe('Métodos estáticos', () => {
    let testTransaction;

    beforeEach(async () => {
      testTransaction = await Transaction.create({
        tarjeta_uid: 'A1B2C3D4',
        monto: -2.50,
        tipo: 'viaje',
        ubicacion: 'Línea A - El Alto',
        validador_id: 'VAL001',
        resultado: 'exitoso'
      });
    });

    test('create debería crear transacción correctamente', async () => {
      const transactionData = {
        tarjeta_uid: 'A1B2C3D4',
        monto: 20.00,
        tipo: 'recarga',
        ubicacion: 'Recarga efectivo'
      };

      const transaction = await Transaction.create(transactionData);
      expect(transaction.tarjeta_uid).toBe(transactionData.tarjeta_uid);
      expect(transaction.monto).toBe(transactionData.monto);
      expect(transaction.tipo).toBe(transactionData.tipo);
    });

    test('getByCardUid debería retornar transacciones de una tarjeta', async () => {
      // Crear otra transacción
      await Transaction.create({
        tarjeta_uid: 'A1B2C3D4',
        monto: 20.00,
        tipo: 'recarga',
        ubicacion: 'Recarga efectivo'
      });

      const transactions = await Transaction.getByCardUid('A1B2C3D4');
      expect(transactions).toHaveLength(2);
      expect(transactions[0].tarjeta_uid).toBe('A1B2C3D4');
    });

    test('getByCardUid debería respetar límite y offset', async () => {
      // Crear otra transacción
      await Transaction.create({
        tarjeta_uid: 'A1B2C3D4',
        monto: 20.00,
        tipo: 'recarga',
        ubicacion: 'Recarga efectivo'
      });

      const transactions = await Transaction.getByCardUid('A1B2C3D4', 1, 1);
      expect(transactions).toHaveLength(1);
      expect(transactions[0].tipo).toBe('viaje'); // La primera transacción
    });

    test('getById debería encontrar transacción por ID', async () => {
      const transaction = await Transaction.getById(testTransaction._id);
      expect(transaction).toBeTruthy();
      expect(transaction.tarjeta_uid).toBe('A1B2C3D4');
    });

    test('getById debería retornar null para ID inexistente', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const transaction = await Transaction.getById(fakeId);
      expect(transaction).toBeNull();
    });
  });

  describe('Agregaciones', () => {
    beforeEach(async () => {
      // Crear múltiples transacciones para testing
      await Transaction.create([
        {
          tarjeta_uid: 'A1B2C3D4',
          monto: -2.50,
          tipo: 'viaje',
          ubicacion: 'Línea A - El Alto',
          validador_id: 'VAL001',
          resultado: 'exitoso'
        },
        {
          tarjeta_uid: 'A1B2C3D4',
          monto: 20.00,
          tipo: 'recarga',
          ubicacion: 'Recarga efectivo',
          resultado: 'exitoso'
        },
        {
          tarjeta_uid: 'A1B2C3D4',
          monto: -2.50,
          tipo: 'viaje',
          ubicacion: 'Línea B - Zona Sur',
          validador_id: 'VAL002',
          resultado: 'exitoso'
        }
      ]);
    });

    test('getRecentTransactions debería retornar transacciones recientes', async () => {
      const transactions = await Transaction.getRecentTransactions(24);
      expect(transactions).toHaveLength(3);
      expect(transactions[0]).toHaveProperty('usuario');
      expect(transactions[0]).toHaveProperty('tarjeta');
    });

    test('getDailyStats debería calcular estadísticas diarias', async () => {
      const stats = await Transaction.getDailyStats(new Date());
      
      expect(stats.total_transacciones).toBe(3);
      expect(stats.total_viajes).toBe(2);
      expect(stats.total_recargas).toBe(1);
      expect(stats.ingresos_viajes).toBe(5.00); // 2.50 + 2.50
      expect(stats.total_recargas_monto).toBe(20.00);
    });

    test('getDailyStats debería retornar ceros para fecha sin transacciones', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const stats = await Transaction.getDailyStats(yesterday);
      
      expect(stats.total_transacciones).toBe(0);
      expect(stats.total_viajes).toBe(0);
      expect(stats.total_recargas).toBe(0);
      expect(stats.ingresos_viajes).toBe(0);
      expect(stats.total_recargas_monto).toBe(0);
    });
  });

  describe('Índices', () => {
    test('debería tener índices configurados', async () => {
      const indexes = await Transaction.collection.getIndexes();
      
      expect(indexes).toHaveProperty('tarjeta_uid_1');
      expect(indexes).toHaveProperty('createdAt_-1');
      expect(indexes).toHaveProperty('validador_id_1');
      expect(indexes).toHaveProperty('tipo_1');
    });
  });
}); 