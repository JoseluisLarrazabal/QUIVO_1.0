const request = require('supertest');
const app = require('../../server');
const Card = require('../../models/Card');
const User = require('../../models/User');

let testUser;

function uniqueUid(base = 'CARD') {
  return base + Math.random().toString(36).substring(2, 10);
}

function uniqueUsername(base = 'testuser') {
  return `${base}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

describe('Endpoints de gestión de tarjetas', () => {
  beforeAll(async () => {
    const username = uniqueUsername();
    testUser = await User.create({
      username,
      password: '123456',
      nombre: 'Test User',
      tipo_tarjeta: 'adulto',
      telefono: '123456',
      email: 'test@example.com',
    });
  });

  afterAll(async () => {
    await Card.deleteMany({ usuario_id: testUser._id });
    await User.findByIdAndDelete(testUser._id);
  });

  it('debe agregar una tarjeta a un usuario existente', async () => {
    const uid = uniqueUid();
    const res = await request(app)
      .post(`/api/usuario/${testUser._id}/tarjetas`)
      .send({ uid, alias: 'Tarjeta Nueva', tipo_tarjeta: 'adulto', saldo_inicial: 15 });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.uid).toBe(uid);
    expect(res.body.data.alias).toBe('Tarjeta Nueva');
  });

  it('no debe permitir agregar una tarjeta con UID duplicado', async () => {
    const uid = uniqueUid();
    await Card.create({ uid, usuario_id: testUser._id, alias: 'Primera', saldo_actual: 5 });
    const res = await request(app)
      .post(`/api/usuario/${testUser._id}/tarjetas`)
      .send({ uid, alias: 'Duplicada', tipo_tarjeta: 'adulto' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('debe eliminar (desactivar) una tarjeta', async () => {
    const uid = uniqueUid();
    await Card.create({ uid, usuario_id: testUser._id, alias: 'Para Eliminar', saldo_actual: 5 });
    const res = await request(app)
      .delete(`/api/tarjetas/${uid}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.activa).toBe(false);
  });

  it('debe actualizar el alias de una tarjeta', async () => {
    const uid = uniqueUid();
    await Card.create({ uid, usuario_id: testUser._id, alias: 'Alias Viejo', saldo_actual: 5 });
    const res = await request(app)
      .patch(`/api/tarjetas/${uid}`)
      .send({ alias: 'Alias Nuevo' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.alias).toBe('Alias Nuevo');
  });
}); 