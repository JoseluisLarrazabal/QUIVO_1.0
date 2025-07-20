require('dotenv').config();
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Configurar variables de entorno para tests
process.env.NODE_ENV = 'test';
process.env.TEST_RATE_LIMIT_MAX = '100'; // Aumentar límite para tests
process.env.RATE_LIMIT_MAX = '100';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';

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

// Configuración específica para tests de tarjetas
// Mock temporal del middleware de verificación de propiedad para tests
const originalVerifyCardOwnership = require('../middleware/auth').verifyCardOwnership;

// Función para habilitar/deshabilitar el mock del middleware
global.setupCardTests = (user) => {
  const authMiddleware = require('../middleware/auth');
  
  // Mock temporal del middleware de verificación de propiedad
  authMiddleware.verifyCardOwnership = async (req, res, next) => {
    try {
      const { uid } = req.params;
      const userId = user._id;

      // Buscar tarjeta y verificar propiedad
      const Card = require('../models/Card');
      const card = await Card.findOne({ uid, activa: true });

      if (!card) {
        return res.status(404).json({
          success: false,
          error: 'Tarjeta no encontrada',
          code: 'CARD_NOT_FOUND'
        });
      }

      if (card.usuario_id.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Acceso denegado. La tarjeta no pertenece al usuario',
          code: 'CARD_OWNERSHIP_DENIED'
        });
      }

      req.card = card;
      next();
    } catch (error) {
      console.error('Error en verificación de propiedad:', error);
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

// Función para restaurar el middleware original
global.restoreCardTests = () => {
  const authMiddleware = require('../middleware/auth');
  authMiddleware.verifyCardOwnership = originalVerifyCardOwnership;
};

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