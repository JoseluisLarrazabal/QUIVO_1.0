const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Card = require('../models/Card');
const authService = require('../services/authService');

describe('Sistema de Autenticación JWT', () => {
  let testUser;
  let testCard;
  let accessToken;
  let refreshToken;

  beforeAll(async () => {
    // Limpiar base de datos de test
    await User.deleteMany({});
    await Card.deleteMany({});
  });

  beforeEach(async () => {
    // Crear usuario de prueba
    testUser = new User({
      username: 'testuser',
      password: 'password123',
      nombre: 'Usuario Test',
      tipo_tarjeta: 'adulto',
      email: 'test@example.com',
      telefono: '70123456'
    });
    await testUser.save();

    // Crear tarjeta de prueba
    testCard = new Card({
      uid: 'TEST123456',
      usuario_id: testUser._id,
      saldo_actual: 25.00,
      alias: 'Tarjeta Test'
    });
    await testCard.save();
  });

  afterEach(async () => {
    // Limpiar después de cada test
    await User.deleteMany({});
    await Card.deleteMany({});
  });

  describe('POST /api/auth/login', () => {
    test('debería autenticar usuario con credenciales válidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.tokens).toBeDefined();
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
      expect(response.body.data.cards).toBeDefined();
    });

    test('debería fallar con credenciales inválidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.code).toBe('AUTHENTICATION_FAILED');
    });

    test('debería fallar con campos faltantes', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser'
          // password faltante
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('MISSING_CREDENTIALS');
    });
  });

  describe('POST /api/auth/login-card', () => {
    test('debería autenticar con UID de tarjeta válido', async () => {
      const response = await request(app)
        .post('/api/auth/login-card')
        .send({
          uid: 'TEST123456'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.card).toBeDefined();
      expect(response.body.data.tokens).toBeDefined();
      expect(response.body.data.authMode).toBe('card');
    });

    test('debería fallar con UID de tarjeta inválido', async () => {
      const response = await request(app)
        .post('/api/auth/login-card')
        .send({
          uid: 'INVALID123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('CARD_AUTHENTICATION_FAILED');
    });
  });

  describe('POST /api/auth/register', () => {
    test('debería registrar nuevo usuario exitosamente', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          password: 'password123',
          nombre: 'Nuevo Usuario',
          tipo_tarjeta: 'estudiante',
          email: 'new@example.com',
          telefono: '70123457'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.tokens).toBeDefined();
    });

    test('debería fallar con usuario duplicado', async () => {
      // Primero crear usuario
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'duplicateuser',
          password: 'password123',
          nombre: 'Usuario Duplicado',
          tipo_tarjeta: 'adulto'
        });

      // Intentar crear el mismo usuario
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'duplicateuser',
          password: 'password123',
          nombre: 'Usuario Duplicado',
          tipo_tarjeta: 'adulto'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('REGISTRATION_FAILED');
    });
  });

  describe('POST /api/auth/refresh', () => {
    beforeEach(async () => {
      // Obtener tokens iniciales
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });
      
      accessToken = loginResponse.body.data.tokens.accessToken;
      refreshToken = loginResponse.body.data.tokens.refreshToken;
    });

    test('debería refrescar token exitosamente', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: refreshToken
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    test('debería fallar con refresh token inválido', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'invalid.refresh.token'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('REFRESH_TOKEN_FAILED');
    });
  });

  describe('POST /api/auth/logout', () => {
    beforeEach(async () => {
      // Obtener token de acceso
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });
      
      accessToken = loginResponse.body.data.tokens.accessToken;
    });

    test('debería cerrar sesión exitosamente', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Sesión cerrada exitosamente');
    });

    test('debería fallar sin token de autenticación', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('TOKEN_MISSING');
    });
  });

  describe('GET /api/auth/verify', () => {
    beforeEach(async () => {
      // Obtener token de acceso
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });
      
      accessToken = loginResponse.body.data.tokens.accessToken;
    });

    test('debería verificar token válido', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.message).toBe('Token válido');
    });

    test('debería fallar con token inválido', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('TOKEN_INVALID');
    });
  });

  describe('Middleware de Autenticación', () => {
    beforeEach(async () => {
      // Obtener token de acceso
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });
      
      accessToken = loginResponse.body.data.tokens.accessToken;
    });

    test('debería permitir acceso a rutas protegidas con token válido', async () => {
      const response = await request(app)
        .get(`/api/usuario/${testUser._id}/tarjetas`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('debería denegar acceso a rutas protegidas sin token', async () => {
      const response = await request(app)
        .get(`/api/usuario/${testUser._id}/tarjetas`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('TOKEN_MISSING');
    });
  });
}); 