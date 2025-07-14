const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.test' });

// Configurar MongoDB de prueba
const TEST_MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/nfc_transport_test';

beforeAll(async () => {
  // Conectar a la base de datos de prueba solo si no está conectado
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
  
  // Asegurar índices únicos en los modelos
  const User = require("../models/User")
  const Card = require("../models/Card")
  const Validator = require("../models/Validator")
  const Transaction = require("../models/Transaction")
  
  // Sincronizar índices
  await Promise.all([
    User.syncIndexes(),
    Card.syncIndexes(),
    Validator.syncIndexes(),
    Transaction.syncIndexes()
  ]);
  
  // Esperar 1500ms para que los índices estén listos y la base de datos esté estable
  await new Promise(r => setTimeout(r, 1500));
});

afterAll(async () => {
  // Limpiar y desconectar
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  // Limpiar todas las colecciones antes de cada test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
  // Esperar 500ms para que MongoDB procese la limpieza antes de crear nuevos documentos
  await new Promise(r => setTimeout(r, 500));
});

// Configurar variables de entorno de prueba
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';