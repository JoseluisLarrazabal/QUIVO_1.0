const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Card = require('../../models/Card');
const Transaction = require('../../models/Transaction');
const transactionRoutes = require('../../routes/transactions');

const app = express();
app.use(express.json());
app.use('/', transactionRoutes);

describe('Transaction Routes', () => {
  let testUser, testCard, testUid, testUsername;

  beforeEach(async () => {
    // Generar datos únicos para cada test
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    testUsername = `testuser_${timestamp}_${random}`;
    testUid = `TEST_${timestamp}_${random}`;

    testUser = new User({
      username: testUsername,
      password: '123456',
      nombre: 'Test User',
      tipo_tarjeta: 'adulto',
      email: 'test@example.com'
    });
    await testUser.save();

    testCard = new Card({
      uid: testUid,
      usuario_id: testUser._id,
      saldo_actual: 25.00
    });
    await testCard.save();
  });

  describe('GET /historial/:uid', () => {
    beforeEach(async () => {
      // Crear transacciones de prueba con delays para asegurar ordenamiento
      const transaction1 = new Transaction({
        tarjeta_uid: testUid,
        monto: -2.50,
        tipo: 'viaje',
        ubicacion: 'Línea A - El Alto',
        validador_id: 'VAL001',
        resultado: 'exitoso'
      });
      await transaction1.save();
      
      // Pequeño delay para asegurar ordenamiento
      await new Promise(resolve => setTimeout(resolve, 10));

      const transaction2 = new Transaction({
        tarjeta_uid: testUid,
        monto: 20.00,
        tipo: 'recarga',
        ubicacion: 'Recarga efectivo',
        resultado: 'exitoso'
      });
      await transaction2.save();
      
      // Pequeño delay para asegurar ordenamiento
      await new Promise(resolve => setTimeout(resolve, 10));

      const transaction3 = new Transaction({
        tarjeta_uid: testUid,
        monto: -2.50,
        tipo: 'viaje',
        ubicacion: 'Línea B - Zona Sur',
        validador_id: 'VAL002',
        resultado: 'exitoso'
      });
      await transaction3.save();
    });

    test('debería obtener historial de transacciones', async () => {
      const response = await request(app)
        .get(`/historial/${testUid}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].tarjeta_uid).toBe(testUid);
      expect(response.body.data[0].tipo).toBe('viaje');
    });

    test('debería fallar con tarjeta inexistente', async () => {
      const response = await request(app)
        .get('/historial/NONEXISTENT');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Tarjeta no encontrada');
    });

    test('debería respetar límite de transacciones', async () => {
      const response = await request(app)
        .get(`/historial/${testUid}?limit=2`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });

    test('debería respetar offset', async () => {
      const response = await request(app)
        .get(`/historial/${testUid}?limit=1&offset=1`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].tipo).toBe('recarga'); // Segunda transacción
    });

    test('debería ordenar por fecha descendente', async () => {
      const response = await request(app)
        .get(`/historial/${testUid}`);

      expect(response.status).toBe(200);
      const transactions = response.body.data;
      expect(new Date(transactions[0].fecha_hora).getTime())
        .toBeGreaterThan(new Date(transactions[1].fecha_hora).getTime());
    });
  });

  describe('POST /recargar', () => {
    test('debería recargar tarjeta correctamente', async () => {
      const recargaData = {
        uid: testUid,
        monto: 20.00,
        metodo_pago: 'efectivo'
      };

      const response = await request(app)
        .post('/recargar')
        .send(recargaData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Recarga exitosa');
      expect(response.body.data.card).toBeDefined();
      expect(response.body.data.transaction).toBeDefined();
      expect(response.body.data.transaction.tipo).toBe('recarga');
      expect(response.body.data.transaction.monto).toBe(20.00);
    });

    test('debería fallar con tarjeta inexistente', async () => {
      const recargaData = {
        uid: 'NONEXISTENT',
        monto: 20.00
      };

      const response = await request(app)
        .post('/recargar')
        .send(recargaData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Tarjeta no encontrada');
    });

    test('debería fallar sin UID', async () => {
      const recargaData = {
        monto: 20.00
      };

      const response = await request(app)
        .post('/recargar')
        .send(recargaData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('UID y monto son requeridos, monto debe ser mayor a 0');
    });

    test('debería fallar sin monto', async () => {
      const recargaData = {
        uid: testUid
      };

      const response = await request(app)
        .post('/recargar')
        .send(recargaData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('UID y monto son requeridos, monto debe ser mayor a 0');
    });

    test('debería fallar con monto cero', async () => {
      const recargaData = {
        uid: testUid,
        monto: 0
      };

      const response = await request(app)
        .post('/recargar')
        .send(recargaData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('UID y monto son requeridos, monto debe ser mayor a 0');
    });

    test('debería fallar con monto negativo', async () => {
      const recargaData = {
        uid: testUid,
        monto: -10.00
      };

      const response = await request(app)
        .post('/recargar')
        .send(recargaData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('UID y monto son requeridos, monto debe ser mayor a 0');
    });

    test('debería fallar con monto menor al mínimo', async () => {
      const recargaData = {
        uid: testUid,
        monto: 3.00
      };

      const response = await request(app)
        .post('/recargar')
        .send(recargaData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('El monto mínimo de recarga es 5 Bs');
    });

    test('debería usar método de pago por defecto', async () => {
      const recargaData = {
        uid: testUid,
        monto: 20.00
      };

      const response = await request(app)
        .post('/recargar')
        .send(recargaData);

      expect(response.status).toBe(200);
      expect(response.body.data.transaction.ubicacion).toBe('Recarga efectivo');
    });

    test('debería actualizar saldo en la base de datos', async () => {
      const recargaData = {
        uid: testUid,
        monto: 20.00
      };

      await request(app)
        .post('/recargar')
        .send(recargaData);

      const updatedCard = await Card.findByUid(testUid);
      expect(updatedCard.saldo_actual).toBe(45.00);
    });

    test('debería crear transacción de recarga', async () => {
      const recargaData = {
        uid: testUid,
        monto: 20.00
      };

      await request(app)
        .post('/recargar')
        .send(recargaData);

      const transactions = await Transaction.find({ tarjeta_uid: testUid });
      const recargaTransaction = transactions.find(t => t.tipo === 'recarga');
      
      expect(recargaTransaction).toBeDefined();
      expect(recargaTransaction.monto).toBe(20.00);
      expect(recargaTransaction.resultado).toBe('exitoso');
    });
  });
}); 