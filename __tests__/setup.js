const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Limpia todas las colecciones después de cada test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Funciones helper globales para las pruebas
global.generateUniqueId = (prefix = '') => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}${timestamp}_${random}`;
};

// Función mejorada para crear usuario de prueba
global.createTestUser = async (overrides = {}) => {
  const User = require("../models/User");
  const defaultUser = {
    username: generateUniqueId('user_'),
    password: '123456',
    nombre: 'Test User',
    tipo_tarjeta: 'adulto',
    email: `${generateUniqueId('email_')}@example.com`,
    ...overrides
  };

  try {
    return await User.create(defaultUser);
  } catch (error) {
    console.error('Error al crear usuario de prueba:', error);
    throw error;
  }
};

// Función mejorada para crear tarjeta de prueba
global.createTestCard = async (userId, overrides = {}) => {
  const Card = require("../models/Card");
  const defaultCard = {
    uid: generateUniqueId('card_'),
    usuario_id: userId,
    saldo_actual: 25.00,
    activa: true,
    ...overrides
  };

  try {
    return await Card.create(defaultCard);
  } catch (error) {
    console.error('Error al crear tarjeta de prueba:', error);
    throw error;
  }
};

// Función mejorada para crear validador de prueba
global.createTestValidator = async (overrides = {}) => {
  const Validator = require("../models/Validator");
  const defaultValidator = {
    id_validador: generateUniqueId('val_'),
    bus_id: generateUniqueId('bus_'),
    ubicacion: 'Test Location',
    estado: 'activo',
    ...overrides
  };

  try {
    return await Validator.create(defaultValidator);
  } catch (error) {
    console.error('Error al crear validador de prueba:', error);
    throw error;
  }
};