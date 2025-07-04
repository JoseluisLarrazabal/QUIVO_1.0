const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.test' });

// Configurar MongoDB de prueba
const TEST_MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/nfc_transport_test';

beforeAll(async () => {
  // Conectar a la base de datos de prueba
  await mongoose.connect(TEST_MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
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
});

// Configurar variables de entorno de prueba
process.env.NODE_ENV = 'test';
process.env.PORT = '3001'; 