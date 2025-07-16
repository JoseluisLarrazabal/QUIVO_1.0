const mongoose = require('mongoose');
const User = require('../../models/User');
const Card = require('../../models/Card');
const Transaction = require('../../models/Transaction');

// Función para generar username y UID únicos
function uniqueUsername(base = 'testuser') {
  return `${base}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}
function uniqueUid(base = 'CARD') {
  return `${base}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

describe('Transaction Model', () => {
  let testUser, testCard, testUid;

  beforeEach(async () => {
    const username = uniqueUsername();
    testUser = new User({
      username,
      password: '123456',
      nombre: 'Test User',
      tipo_tarjeta: 'adulto',
      email: `${username}@example.com`
    });
    await testUser.save();
    testUid = uniqueUid();
    testCard = new Card({
      uid: testUid,
      usuario_id: testUser._id,
      saldo_actual: 25.00
    });
    await testCard.save();
  });

  describe('Validaciones', () => {
    test('debería crear una transacción válida de viaje', async () => {
      const transactionData = {
        tarjeta_uid: testUid,
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
        tarjeta_uid: testUid,
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
        tarjeta_uid: testUid,
        tipo: 'viaje',
        ubicacion: 'Línea A - El Alto'
      };

      const transaction = new Transaction(transactionData);
      await expect(transaction.save()).rejects.toThrow();
    });

    test('debería requerir tipo', async () => {
      const transactionData = {
        tarjeta_uid: testUid,
        monto: -2.50,
        ubicacion: 'Línea A - El Alto'
      };

      const transaction = new Transaction(transactionData);
      await expect(transaction.save()).rejects.toThrow();
    });

    test('debería validar tipo válido', async () => {
      const transactionData = {
        tarjeta_uid: testUid,
        monto: -2.50,
        tipo: 'invalido',
        ubicacion: 'Línea A - El Alto'
      };

      const transaction = new Transaction(transactionData);
      await expect(transaction.save()).rejects.toThrow();
    });

    test('debería validar resultado válido', async () => {
      const transactionData = {
        tarjeta_uid: testUid,
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
        tarjeta_uid: testUid,
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
      testTransaction = new Transaction({
        tarjeta_uid: testUid,
        monto: -2.50,
        tipo: 'viaje',
        ubicacion: 'Línea A - El Alto',
        validador_id: 'VAL001',
        resultado: 'exitoso'
      });
      await testTransaction.save();
    });

    test('create debería crear transacción correctamente', async () => {
      const transactionData = {
        tarjeta_uid: testUid,
        monto: 20.00,
        tipo: 'recarga',
        ubicacion: 'Recarga efectivo'
      };

      const transaction = new Transaction(transactionData);
      const savedTransaction = await transaction.save();
      expect(savedTransaction.tarjeta_uid).toBe(transactionData.tarjeta_uid);
      expect(savedTransaction.monto).toBe(transactionData.monto);
      expect(savedTransaction.tipo).toBe(transactionData.tipo);
    });

    test('getByCardUid debería retornar transacciones de una tarjeta', async () => {
      // Crear otra transacción
      const secondTransaction = new Transaction({
        tarjeta_uid: testUid,
        monto: 20.00,
        tipo: 'recarga',
        ubicacion: 'Recarga efectivo'
      });
      await secondTransaction.save();

      const transactions = await Transaction.getByCardUid(testUid);
      expect(transactions).toHaveLength(2);
      expect(transactions[0].tarjeta_uid).toBe(testUid);
    });

    test('getByCardUid debería respetar límite y offset', async () => {
      // Crear otra transacción
      const secondTransaction = new Transaction({
        tarjeta_uid: testUid,
        monto: 20.00,
        tipo: 'recarga',
        ubicacion: 'Recarga efectivo'
      });
      await secondTransaction.save();

      const transactions = await Transaction.getByCardUid(testUid, 1, 1);
      expect(transactions).toHaveLength(1);
      expect(transactions[0].tipo).toBe('viaje'); // La primera transacción
    });

    test('getById debería encontrar transacción por ID', async () => {
      const transaction = await Transaction.getById(testTransaction._id);
      expect(transaction).toBeTruthy();
      expect(transaction.tarjeta_uid).toBe(testUid);
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
          tarjeta_uid: testUid,
          monto: -2.50,
          tipo: 'viaje',
          ubicacion: 'Línea A - El Alto',
          validador_id: 'VAL001',
          resultado: 'exitoso'
        },
        {
          tarjeta_uid: testUid,
          monto: 20.00,
          tipo: 'recarga',
          ubicacion: 'Recarga efectivo',
          resultado: 'exitoso'
        },
        {
          tarjeta_uid: testUid,
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
      // Verificar que las transacciones tienen los campos esperados
      expect(transactions[0]).toHaveProperty('tarjeta_uid');
      expect(transactions[0]).toHaveProperty('monto');
      expect(transactions[0]).toHaveProperty('tipo');
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

  describe('Métodos adicionales', () => {
    let card;
    beforeEach(async () => {
      card = new Card({
        uid: uniqueUid(),
        usuario_id: testUser._id,
        saldo_actual: 100
      });
      await card.save();
    });

    test('createTransaction debe crear una transacción de viaje negativa', async () => {
      const [tx] = await Transaction.createTransaction({
        tarjeta_uid: card.uid,
        monto: 2.5,
        tipo: 'viaje',
        ubicacion: 'Bus',
        resultado: 'exitoso'
      });
      expect(tx).toBeTruthy();
      expect(tx.monto).toBe(-2.5);
      expect(tx.tipo).toBe('viaje');
    });

    test('createTransaction debe crear una transacción de recarga positiva', async () => {
      const [tx] = await Transaction.createTransaction({
        tarjeta_uid: card.uid,
        monto: 10,
        tipo: 'recarga',
        ubicacion: 'Recarga',
        resultado: 'exitoso'
      });
      expect(tx).toBeTruthy();
      expect(tx.monto).toBe(10);
      expect(tx.tipo).toBe('recarga');
    });

    test('wasSuccessful debe indicar si la transacción fue exitosa', async () => {
      const tx = new Transaction({
        tarjeta_uid: card.uid,
        monto: 5,
        tipo: 'recarga',
        resultado: 'exitoso'
      });
      expect(tx.wasSuccessful()).toBe(true);
      tx.resultado = 'fallido';
      expect(tx.wasSuccessful()).toBe(false);
    });

    test('isRefund debe indicar si la transacción es recarga positiva', async () => {
      const tx = new Transaction({
        tarjeta_uid: card.uid,
        monto: 10,
        tipo: 'recarga',
        resultado: 'exitoso'
      });
      expect(tx.isRefund()).toBe(true);
      tx.tipo = 'viaje';
      expect(tx.isRefund()).toBe(false);
      tx.tipo = 'recarga';
      tx.monto = -5;
      expect(tx.isRefund()).toBe(false);
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