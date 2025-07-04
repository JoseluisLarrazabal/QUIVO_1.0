const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Card = require('../../models/Card');
const Validator = require('../../models/Validator');
const Transaction = require('../../models/Transaction');
const validatorRoutes = require('../../routes/validators');

const app = express();
app.use(express.json());
app.use('/', validatorRoutes);

describe('Validator Routes', () => {
  let testUser, testCard, testValidator;

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

    testValidator = await Validator.create({
      id_validador: 'VAL001',
      bus_id: 'BUS001',
      ubicacion: 'Línea A - El Alto',
      operador: 'Transporte El Alto S.A.',
      estado: 'activo'
    });
  });

  describe('POST /validar', () => {
    test('debería validar tarjeta exitosamente', async () => {
      const validacionData = {
        uid: 'A1B2C3D4',
        validador_id: 'VAL001'
      };

      const response = await request(app)
        .post('/validar')
        .send(validacionData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.saldo_anterior).toBe(25.00);
      expect(response.body.saldo_actual).toBe(22.50); // 25.00 - 2.50
      expect(response.body.tarifa).toBe(2.50);
      expect(response.body.usuario.nombre).toBe('Test User');
      expect(response.body.usuario.tipo).toBe('adulto');
      expect(response.body.transaccion).toBeDefined();
    });

    test('debería fallar con validador inexistente', async () => {
      const validacionData = {
        uid: 'A1B2C3D4',
        validador_id: 'NONEXISTENT'
      };

      const response = await request(app)
        .post('/validar')
        .send(validacionData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validador no disponible');
    });

    test('debería fallar con validador inactivo', async () => {
      await Validator.findByIdAndUpdate(testValidator._id, { estado: 'inactivo' });

      const validacionData = {
        uid: 'A1B2C3D4',
        validador_id: 'VAL001'
      };

      const response = await request(app)
        .post('/validar')
        .send(validacionData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validador no disponible');
    });

    test('debería fallar con tarjeta inexistente', async () => {
      const validacionData = {
        uid: 'NONEXISTENT',
        validador_id: 'VAL001'
      };

      const response = await request(app)
        .post('/validar')
        .send(validacionData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Tarjeta no encontrada o inactiva');
    });

    test('debería fallar con saldo insuficiente', async () => {
      // Actualizar saldo a menos de la tarifa
      await Card.updateBalance('A1B2C3D4', 1.00);

      const validacionData = {
        uid: 'A1B2C3D4',
        validador_id: 'VAL001'
      };

      const response = await request(app)
        .post('/validar')
        .send(validacionData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Saldo insuficiente');
      expect(response.body.saldo_actual).toBe(1.00);
      expect(response.body.tarifa_requerida).toBe(2.50);
    });

    test('debería fallar sin UID', async () => {
      const validacionData = {
        validador_id: 'VAL001'
      };

      const response = await request(app)
        .post('/validar')
        .send(validacionData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('UID y validador_id son requeridos');
    });

    test('debería fallar sin validador_id', async () => {
      const validacionData = {
        uid: 'A1B2C3D4'
      };

      const response = await request(app)
        .post('/validar')
        .send(validacionData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('UID y validador_id son requeridos');
    });

    test('debería aplicar tarifa correcta según tipo de usuario', async () => {
      // Crear usuario estudiante
      const estudianteUser = await User.create({
        username: 'estudiante',
        password: '123456',
        nombre: 'Estudiante Test',
        tipo_tarjeta: 'estudiante',
        email: 'estudiante@test.com'
      });

      const estudianteCard = await Card.create({
        uid: 'STUDENT123',
        usuario_id: estudianteUser._id,
        saldo_actual: 10.00
      });

      const validacionData = {
        uid: 'STUDENT123',
        validador_id: 'VAL001'
      };

      const response = await request(app)
        .post('/validar')
        .send(validacionData);

      expect(response.status).toBe(200);
      expect(response.body.tarifa).toBe(1.00); // Tarifa de estudiante
      expect(response.body.saldo_actual).toBe(9.00); // 10.00 - 1.00
    });

    test('debería actualizar saldo en la base de datos', async () => {
      const validacionData = {
        uid: 'A1B2C3D4',
        validador_id: 'VAL001'
      };

      await request(app)
        .post('/validar')
        .send(validacionData);

      const updatedCard = await Card.findByUid('A1B2C3D4');
      expect(updatedCard.saldo_actual).toBe(22.50);
    });

    test('debería crear transacción de viaje', async () => {
      const validacionData = {
        uid: 'A1B2C3D4',
        validador_id: 'VAL001'
      };

      await request(app)
        .post('/validar')
        .send(validacionData);

      const transactions = await Transaction.find({ tarjeta_uid: 'A1B2C3D4' });
      const viajeTransaction = transactions.find(t => t.tipo === 'viaje');
      
      expect(viajeTransaction).toBeDefined();
      expect(viajeTransaction.monto).toBe(-2.50);
      expect(viajeTransaction.resultado).toBe('exitoso');
      expect(viajeTransaction.validador_id).toBe('VAL001');
    });

    test('debería registrar transacción fallida con saldo insuficiente', async () => {
      await Card.updateBalance('A1B2C3D4', 1.00);

      const validacionData = {
        uid: 'A1B2C3D4',
        validador_id: 'VAL001'
      };

      await request(app)
        .post('/validar')
        .send(validacionData);

      const transactions = await Transaction.find({ tarjeta_uid: 'A1B2C3D4' });
      const failedTransaction = transactions.find(t => t.resultado === 'saldo_insuficiente');
      
      expect(failedTransaction).toBeDefined();
      expect(failedTransaction.monto).toBe(-2.50);
      expect(failedTransaction.tipo).toBe('viaje');
    });
  });

  describe('POST /validadores', () => {
    test('debería crear validador correctamente', async () => {
      const validadorData = {
        id_validador: 'VAL002',
        bus_id: 'BUS002',
        ubicacion: 'Línea B - Zona Sur',
        operador: 'Micro Sur Ltda.'
      };

      const response = await request(app)
        .post('/validadores')
        .send(validadorData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id_validador).toBe('VAL002');
      expect(response.body.data.bus_id).toBe('BUS002');
      expect(response.body.data.ubicacion).toBe('Línea B - Zona Sur');
      expect(response.body.data.operador).toBe('Micro Sur Ltda.');
      expect(response.body.data.estado).toBe('activo');
    });

    test('debería fallar con id_validador duplicado', async () => {
      const validadorData = {
        id_validador: 'VAL001', // Ya existe
        bus_id: 'BUS002',
        ubicacion: 'Línea B - Zona Sur',
        operador: 'Micro Sur Ltda.'
      };

      const response = await request(app)
        .post('/validadores')
        .send(validadorData);

      expect(response.status).toBe(500);
    });
  });

  describe('PUT /validadores/:id/estado', () => {
    test('debería actualizar estado del validador', async () => {
      const response = await request(app)
        .put('/validadores/VAL001/estado')
        .send({ estado: 'mantenimiento' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.estado).toBe('mantenimiento');
    });

    test('debería fallar con estado inválido', async () => {
      const response = await request(app)
        .put('/validadores/VAL001/estado')
        .send({ estado: 'invalido' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Estado inválido');
    });

    test('debería fallar con validador inexistente', async () => {
      const response = await request(app)
        .put('/validadores/NONEXISTENT/estado')
        .send({ estado: 'inactivo' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validador no encontrado');
    });
  });

  describe('GET /validadores', () => {
    beforeEach(async () => {
      // Crear validadores adicionales
      await Validator.create([
        {
          id_validador: 'VAL002',
          bus_id: 'BUS002',
          ubicacion: 'Línea B - Zona Sur',
          operador: 'Micro Sur Ltda.',
          estado: 'activo'
        },
        {
          id_validador: 'VAL003',
          bus_id: 'BUS003',
          ubicacion: 'Línea C - Centro',
          operador: 'Transporte Centro',
          estado: 'inactivo'
        }
      ]);
    });

    test('debería listar todos los validadores', async () => {
      const response = await request(app)
        .get('/validadores');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0].id_validador).toBe('VAL003'); // Ordenado por createdAt desc
      expect(response.body.data[1].id_validador).toBe('VAL002');
      expect(response.body.data[2].id_validador).toBe('VAL001');
    });
  });
}); 