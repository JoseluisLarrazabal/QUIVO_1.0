const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../../models/User');
const Card = require('../../models/Card');
const authRoutes = require('../../routes/auth');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes', () => {
  let testUser;

  beforeEach(async () => {
    testUser = new User({
      username: 'testuser',
      password: '123456',
      nombre: 'Test User',
      tipo_tarjeta: 'adulto',
      email: 'test@example.com',
      telefono: '59171234567'
    });
    await testUser.save();

    // Crear tarjeta para el usuario
    const testCard = new Card({
      uid: 'A1B2C3D4',
      usuario_id: testUser._id,
      saldo_actual: 25.00
    });
    await testCard.save();
  });

  describe('POST /auth/login', () => {
    test('debería autenticar usuario válido', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: '123456'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.username).toBe('testuser');
      expect(response.body.data.user.nombre).toBe('Test User');
      expect(response.body.data.user.tipo_tarjeta).toBe('adulto');
      expect(response.body.data.cards).toBeDefined();
      expect(response.body.data.cards).toHaveLength(1);
      expect(response.body.data.cards[0].uid).toBe('A1B2C3D4');
    });

    test('debería fallar con contraseña incorrecta', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Usuario o contraseña incorrectos');
    });

    test('debería fallar con usuario inexistente', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'nonexistent',
          password: '123456'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Usuario o contraseña incorrectos');
    });

    test('debería fallar sin username', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          password: '123456'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Usuario y contraseña son requeridos');
    });

    test('debería fallar sin password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Usuario y contraseña son requeridos');
    });

    test('debería fallar con datos vacíos', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Usuario y contraseña son requeridos');
    });

    test('debería incluir todas las tarjetas del usuario', async () => {
      // Crear otra tarjeta para el mismo usuario
      const secondCard = new Card({
        uid: 'E5F6G7H8',
        usuario_id: testUser._id,
        saldo_actual: 15.50
      });
      await secondCard.save();

      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: '123456'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.cards).toHaveLength(2);
      expect(response.body.data.cards.map(c => c.uid)).toContain('A1B2C3D4');
      expect(response.body.data.cards.map(c => c.uid)).toContain('E5F6G7H8');
    });

    test('debería excluir tarjetas inactivas', async () => {
      // Crear tarjeta inactiva
      const inactiveCard = new Card({
        uid: 'INACTIVE',
        usuario_id: testUser._id,
        saldo_actual: 10.00,
        activa: false
      });
      await inactiveCard.save();

      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testuser',
          password: '123456'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.cards).toHaveLength(1);
      expect(response.body.data.cards[0].uid).toBe('A1B2C3D4');
    });
  });

  describe('POST /auth/register', () => {
    test('debería registrar nuevo usuario correctamente', async () => {
      const userData = {
        username: 'newuser',
        password: '123456',
        nombre: 'New User',
        tipo_tarjeta: 'estudiante',
        email: 'newuser@example.com',
        telefono: '59172345678'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.username).toBe('newuser');
      expect(response.body.data.user.nombre).toBe('New User');
      expect(response.body.data.user.tipo_tarjeta).toBe('estudiante');
      expect(response.body.data.user.email).toBe('newuser@example.com');
      expect(response.body.data.user.telefono).toBe('59172345678');
      expect(response.body.data.user.password).toBeUndefined(); // No debe incluir password
    });

    test('debería fallar con username duplicado', async () => {
      const userData = {
        username: 'testuser', // Ya existe
        password: '123456',
        nombre: 'Duplicate User',
        tipo_tarjeta: 'adulto'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('El nombre de usuario ya está en uso');
    });

    test('debería fallar sin campos obligatorios', async () => {
      const userData = {
        username: 'newuser',
        password: '123456'
        // Falta nombre y tipo_tarjeta
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Todos los campos obligatorios son requeridos');
    });

    test('debería fallar sin username', async () => {
      const userData = {
        password: '123456',
        nombre: 'New User',
        tipo_tarjeta: 'adulto'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Todos los campos obligatorios son requeridos');
    });

    test('debería fallar sin password', async () => {
      const userData = {
        username: 'newuser',
        nombre: 'New User',
        tipo_tarjeta: 'adulto'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Todos los campos obligatorios son requeridos');
    });

    test('debería fallar sin nombre', async () => {
      const userData = {
        username: 'newuser',
        password: '123456',
        tipo_tarjeta: 'adulto'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Todos los campos obligatorios son requeridos');
    });

    test('debería fallar sin tipo_tarjeta', async () => {
      const userData = {
        username: 'newuser',
        password: '123456',
        nombre: 'New User'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Todos los campos obligatorios son requeridos');
    });

    test('debería validar tipo_tarjeta válido', async () => {
      const userData = {
        username: 'newuser',
        password: '123456',
        nombre: 'New User',
        tipo_tarjeta: 'invalido'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(500); // Error de validación de Mongoose
    });

    test('debería encriptar la contraseña', async () => {
      const userData = {
        username: 'newuser',
        password: '123456',
        nombre: 'New User',
        tipo_tarjeta: 'adulto'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(201);

      // Verificar que la contraseña está encriptada en la base de datos
      const savedUser = await User.findOne({ username: 'newuser' });
      expect(savedUser.password).not.toBe('123456');
      expect(savedUser.password).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/);
    });
  });
}); 