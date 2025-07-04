const mongoose = require('mongoose');
const User = require('../../models/User');
const Card = require('../../models/Card');

describe('Card Model', () => {
  let testUser;

  beforeEach(async () => {
    testUser = await User.create({
      username: 'testuser',
      password: '123456',
      nombre: 'Test User',
      tipo_tarjeta: 'adulto',
      email: 'test@example.com'
    });
  });

  describe('Validaciones', () => {
    test('debería crear una tarjeta válida', async () => {
      const cardData = {
        uid: 'A1B2C3D4',
        usuario_id: testUser._id,
        saldo_actual: 25.00
      };

      const card = new Card(cardData);
      const savedCard = await card.save();

      expect(savedCard.uid).toBe(cardData.uid);
      expect(savedCard.usuario_id.toString()).toBe(testUser._id.toString());
      expect(savedCard.saldo_actual).toBe(cardData.saldo_actual);
      expect(savedCard.activa).toBe(true);
    });

    test('debería requerir uid', async () => {
      const cardData = {
        usuario_id: testUser._id,
        saldo_actual: 25.00
      };

      const card = new Card(cardData);
      await expect(card.save()).rejects.toThrow();
    });

    test('debería requerir usuario_id', async () => {
      const cardData = {
        uid: 'A1B2C3D4',
        saldo_actual: 25.00
      };

      const card = new Card(cardData);
      await expect(card.save()).rejects.toThrow();
    });

    test('debería validar uid único', async () => {
      const cardData = {
        uid: 'A1B2C3D4',
        usuario_id: testUser._id,
        saldo_actual: 25.00
      };

      await Card.create(cardData);
      const duplicateCard = new Card(cardData);
      await expect(duplicateCard.save()).rejects.toThrow();
    });

    test('debería validar saldo no negativo', async () => {
      const cardData = {
        uid: 'A1B2C3D4',
        usuario_id: testUser._id,
        saldo_actual: -10.00
      };

      const card = new Card(cardData);
      await expect(card.save()).rejects.toThrow();
    });

    test('debería establecer saldo por defecto en 0', async () => {
      const cardData = {
        uid: 'A1B2C3D4',
        usuario_id: testUser._id
      };

      const card = new Card(cardData);
      const savedCard = await card.save();

      expect(savedCard.saldo_actual).toBe(0);
    });

    test('debería establecer activa por defecto en true', async () => {
      const cardData = {
        uid: 'A1B2C3D4',
        usuario_id: testUser._id
      };

      const card = new Card(cardData);
      const savedCard = await card.save();

      expect(savedCard.activa).toBe(true);
    });
  });

  describe('Métodos estáticos', () => {
    let testCard;

    beforeEach(async () => {
      testCard = await Card.create({
        uid: 'A1B2C3D4',
        usuario_id: testUser._id,
        saldo_actual: 25.00
      });
    });

    test('findByUid debería encontrar tarjeta por UID', async () => {
      const card = await Card.findByUid('A1B2C3D4');
      expect(card).toBeTruthy();
      expect(card.uid).toBe('A1B2C3D4');
      expect(card.usuario_id.nombre).toBe('Test User');
      expect(card.usuario_id.tipo_tarjeta).toBe('adulto');
    });

    test('findByUid debería retornar null para tarjeta inexistente', async () => {
      const card = await Card.findByUid('NONEXISTENT');
      expect(card).toBeNull();
    });

    test('findByUid debería retornar null para tarjeta inactiva', async () => {
      await Card.findByIdAndUpdate(testCard._id, { activa: false });
      const card = await Card.findByUid('A1B2C3D4');
      expect(card).toBeNull();
    });

    test('updateBalance debería actualizar saldo correctamente', async () => {
      const newBalance = 50.00;
      const updatedCard = await Card.updateBalance('A1B2C3D4', newBalance);
      
      expect(updatedCard.saldo_actual).toBe(newBalance);
    });

    test('getBalance debería retornar saldo correcto', async () => {
      const balance = await Card.getBalance('A1B2C3D4');
      expect(balance).toBe(25.00);
    });

    test('getBalance debería retornar 0 para tarjeta inexistente', async () => {
      const balance = await Card.getBalance('NONEXISTENT');
      expect(balance).toBe(0);
    });

    test('deactivate debería desactivar tarjeta', async () => {
      const deactivatedCard = await Card.deactivate('A1B2C3D4');
      expect(deactivatedCard.activa).toBe(false);
    });

    test('getAllCards debería retornar todas las tarjetas activas', async () => {
      // Crear otra tarjeta
      await Card.create({
        uid: 'E5F6G7H8',
        usuario_id: testUser._id,
        saldo_actual: 15.50
      });

      const cards = await Card.getAllCards();
      expect(cards).toHaveLength(2);
      expect(cards[0].uid).toBe('E5F6G7H8'); // Ordenado por createdAt desc
      expect(cards[1].uid).toBe('A1B2C3D4');
    });

    test('getAllCards debería respetar límite y offset', async () => {
      // Crear otra tarjeta
      await Card.create({
        uid: 'E5F6G7H8',
        usuario_id: testUser._id,
        saldo_actual: 15.50
      });

      const cards = await Card.getAllCards(1, 1);
      expect(cards).toHaveLength(1);
      expect(cards[0].uid).toBe('A1B2C3D4');
    });
  });

  describe('Relaciones', () => {
    test('debería poder hacer populate de usuario_id', async () => {
      const card = await Card.create({
        uid: 'A1B2C3D4',
        usuario_id: testUser._id,
        saldo_actual: 25.00
      });

      const populatedCard = await Card.findById(card._id).populate('usuario_id');
      expect(populatedCard.usuario_id.nombre).toBe('Test User');
      expect(populatedCard.usuario_id.tipo_tarjeta).toBe('adulto');
    });
  });
}); 