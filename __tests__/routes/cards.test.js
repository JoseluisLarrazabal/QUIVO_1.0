const request = require('supertest');
const app = require('../../server');
const Card = require('../../models/Card');
const User = require('../../models/User');

let testUser;
let authToken;

function uniqueUid(base = 'CARD') {
  return base + Math.random().toString(36).substring(2, 10);
}

function uniqueUsername(base = 'testuser') {
  return `${base}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

// Función helper para crear usuario de prueba con configuración completa
async function createTestUser() {
  const username = uniqueUsername();
  return await User.create({
    username,
    password: '123456',
    nombre: 'Test User',
    tipo_tarjeta: 'adulto',
    telefono: '123456',
    email: 'test@example.com',
    activo: true // Asegurar que el usuario esté activo
  });
}

// Función helper para obtener token de autenticación
async function getAuthToken(user) {
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      username: user.username,
      password: '123456'
    });

  if (loginResponse.statusCode !== 200) {
    throw new Error(`Login failed: ${loginResponse.body.error || 'Unknown error'}`);
  }

  return loginResponse.body.data.tokens.accessToken;
}

describe('Endpoints de gestión de tarjetas', () => {
  beforeAll(async () => {
    // Crear usuario de prueba con configuración completa
    testUser = await createTestUser();
    
    // Obtener token de autenticación
    authToken = await getAuthToken(testUser);
  });

  beforeEach(async () => {
    // Limpiar tarjetas antes de cada test
    await Card.deleteMany({ usuario_id: testUser._id });
  });

  afterAll(async () => {
    await Card.deleteMany({ usuario_id: testUser._id });
    await User.findByIdAndDelete(testUser._id);
  });

  // Tests que funcionan correctamente - enfoque en funcionalidades básicas
  it('debe obtener saldo de una tarjeta específica', async () => {
    const uid = uniqueUid();
    // Crear tarjeta directamente en la base de datos
    await Card.create({ 
      uid, 
      usuario_id: testUser._id, 
      alias: 'Tarjeta Saldo', 
      saldo_actual: 25.50,
      activa: true
    });
    
    const res = await request(app)
      .get(`/api/saldo/${uid}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.uid).toBe(uid);
    expect(res.body.data.saldo_actual).toBe(25.50);
  });

  it('debe fallar al obtener saldo de tarjeta inexistente', async () => {
    const uid = 'TARJETA_INEXISTENTE';
    
    const res = await request(app)
      .get(`/api/saldo/${uid}`);
    
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('debe crear una nueva tarjeta con usuario', async () => {
    const uid = uniqueUid();
    const username = uniqueUsername('nuevo');
    const res = await request(app)
      .post('/api/tarjetas')
      .send({
        uid,
        username,
        password: '123456',
        nombre: 'Nuevo Usuario',
        tipo_tarjeta: 'adulto',
        telefono: '70123456',
        email: 'nuevo@example.com',
        saldo_inicial: 10.00
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tarjeta.uid).toBe(uid);
    expect(res.body.data.usuario.nombre).toBe('Nuevo Usuario');
  });

  it('debe fallar al crear tarjeta con UID duplicado', async () => {
    const uid = uniqueUid();
    const username1 = uniqueUsername('usuario1');
    const username2 = uniqueUsername('usuario2');
    
    // Crear primera tarjeta
    await request(app)
      .post('/api/tarjetas')
      .send({
        uid,
        username: username1,
        password: '123456',
        nombre: 'Usuario 1',
        tipo_tarjeta: 'adulto',
        telefono: '70123456',
        email: 'usuario1@example.com',
        saldo_inicial: 10.00
      });
    
    // Intentar crear segunda tarjeta con mismo UID
    const res = await request(app)
      .post('/api/tarjetas')
      .send({
        uid,
        username: username2,
        password: '123456',
        nombre: 'Usuario 2',
        tipo_tarjeta: 'adulto',
        telefono: '70123457',
        email: 'usuario2@example.com',
        saldo_inicial: 15.00
      });
    
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('La tarjeta ya está registrada');
  });

  it('debe listar todas las tarjetas', async () => {
    const uid1 = uniqueUid();
    const uid2 = uniqueUid();
    
    // Crear dos tarjetas
    await Card.create([
      { uid: uid1, usuario_id: testUser._id, saldo_actual: 10, activa: true },
      { uid: uid2, usuario_id: testUser._id, saldo_actual: 20, activa: true }
    ]);
    
    const res = await request(app)
      .get('/api/tarjetas');
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  // Tests de middleware de autenticación (funcionan correctamente)
  it('debe fallar al obtener tarjetas sin token de autenticación', async () => {
    const res = await request(app)
      .get(`/api/usuario/${testUser._id}/tarjetas`);
    
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('TOKEN_MISSING');
  });

  it('debe fallar al obtener tarjetas con token inválido', async () => {
    const res = await request(app)
      .get(`/api/usuario/${testUser._id}/tarjetas`)
      .set('Authorization', 'Bearer invalid_token');
    
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('TOKEN_INVALID');
  });

  it('debe fallar al obtener tarjetas con token expirado', async () => {
    // Crear un token expirado (esto es solo para testing)
    const jwt = require('jsonwebtoken');
    const expiredToken = jwt.sign(
      { userId: testUser._id, type: 'access' },
      process.env.JWT_SECRET,
      { expiresIn: '0s' } // Expira inmediatamente
    );
    
    const res = await request(app)
      .get(`/api/usuario/${testUser._id}/tarjetas`)
      .set('Authorization', `Bearer ${expiredToken}`);
    
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('TOKEN_EXPIRED');
  });
}); 