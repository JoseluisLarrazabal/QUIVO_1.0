const mongoose = require('mongoose');
const User = require('../../models/User');
const Card = require('../../models/Card');

// Función para generar username y UID únicos
function uniqueUsername(base = 'testuser') {
  return `${base}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}
function uniqueUid(base = 'CARD') {
  return `${base}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

describe('Card Model', () => {
  let testUser;
  let testUid;

  beforeEach(async () => {
    const username = uniqueUsername();
    testUser = new User({
      username,
      password: '123456',
      nombre: 'Test User',
      tipo_tarjeta: 'adulto',
      email: `${username}@example.com`
    });
    await testUser.save();
    testUid = uniqueUid();
  });

  describe('Validaciones', () => {
    test('debería crear una tarjeta válida', async () => {
      const cardData = {
        uid: testUid,
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
        uid: uniqueUid(),
        saldo_actual: 25.00
      };

      const card = new Card(cardData);
      await expect(card.save()).rejects.toThrow();
    });

    test('debería validar uid único', async () => {
      const cardData = {
        uid: testUid,
        usuario_id: testUser._id,
        saldo_actual: 25.00
      };

      const card = new Card(cardData);
      await card.save();
      const duplicateCard = new Card(cardData);
      await expect(duplicateCard.save()).rejects.toThrow();
    });

    test('debería validar saldo no negativo', async () => {
      const cardData = {
        uid: uniqueUid(),
        usuario_id: testUser._id,
        saldo_actual: -10.00
      };

      const card = new Card(cardData);
      await expect(card.save()).rejects.toThrow();
    });

    test('debería establecer saldo por defecto en 0', async () => {
      const cardData = {
        uid: uniqueUid(),
        usuario_id: testUser._id
      };

      const card = new Card(cardData);
      const savedCard = await card.save();

      expect(savedCard.saldo_actual).toBe(0);
    });

    test('debería establecer activa por defecto en true', async () => {
      const cardData = {
        uid: uniqueUid(),
        usuario_id: testUser._id
      };

      const card = new Card(cardData);
      const savedCard = await card.save();

      expect(savedCard.activa).toBe(true);
    });
  });

  describe('Métodos estáticos', () => {
    let testCard;
    let testUid2;

    beforeEach(async () => {
      testCard = new Card({
        uid: testUid,
        usuario_id: testUser._id,
        saldo_actual: 25.00
      });
      await testCard.save();
      testUid2 = uniqueUid();
    });

    test('findByUid debería encontrar tarjeta por UID', async () => {
      const card = await Card.findByUid(testUid);
      expect(card).toBeTruthy();
      expect(card.uid).toBe(testUid);
      expect(card.usuario_id.nombre).toBe('Test User');
      expect(card.usuario_id.tipo_tarjeta).toBe('adulto');
    });

    test('findByUid debería retornar null para tarjeta inexistente', async () => {
      const card = await Card.findByUid('NONEXISTENT');
      expect(card).toBeNull();
    });

    test('findByUid debería retornar null para tarjeta inactiva', async () => {
      await Card.findByIdAndUpdate(testCard._id, { activa: false });
      const card = await Card.findByUid(testUid);
      expect(card).toBeNull();
    });

    test('updateBalance debería actualizar saldo correctamente', async () => {
      const newBalance = 50.00;
      const updatedCard = await Card.updateBalance(testUid, newBalance);
      expect(updatedCard.saldo_actual).toBe(newBalance);
    });

    test('getBalance debería retornar saldo correcto', async () => {
      const balance = await Card.getBalance(testUid);
      expect(balance).toBe(25.00);
    });

    test('getBalance debería retornar 0 para tarjeta inexistente', async () => {
      const balance = await Card.getBalance('NONEXISTENT');
      expect(balance).toBe(0);
    });

    test('deactivate debería desactivar tarjeta', async () => {
      const deactivatedCard = await Card.deactivate(testUid);
      expect(deactivatedCard.activa).toBe(false);
    });

    test('getAllCards debería retornar todas las tarjetas activas', async () => {
      // Crear otra tarjeta
      const secondCard = new Card({
        uid: testUid2,
        usuario_id: testUser._id,
        saldo_actual: 15.50
      });
      await secondCard.save();

      const cards = await Card.getAllCards();
      expect(cards).toHaveLength(2);
      expect([testUid, testUid2]).toContain(cards[0].uid);
      expect([testUid, testUid2]).toContain(cards[1].uid);
    });

    test('getAllCards debería respetar límite y offset', async () => {
      // Crear otra tarjeta
      const secondCard = new Card({
        uid: testUid2,
        usuario_id: testUser._id,
        saldo_actual: 15.50
      });
      await secondCard.save();

      const cards = await Card.getAllCards(1, 1);
      expect(cards).toHaveLength(1);
      expect([testUid, testUid2]).toContain(cards[0].uid);
    });
  });

  describe('Métodos de instancia', () => {
    let card;
    beforeEach(async () => {
      card = new Card({
        uid: uniqueUid(),
        usuario_id: testUser._id,
        saldo_actual: 20
      });
      await card.save();
    });

    test('hasEnoughBalance debe detectar saldo suficiente', () => {
      expect(card.hasEnoughBalance(10)).toBe(true);
      expect(card.hasEnoughBalance(25)).toBe(false);
    });

    test('addBalance debe sumar saldo correctamente', async () => {
      await card.addBalance(15);
      const updated = await Card.findById(card._id);
      expect(updated.saldo_actual).toBe(35);
    });

    test('deductBalance debe restar saldo correctamente', async () => {
      await card.deductBalance(5);
      const updated = await Card.findById(card._id);
      expect(updated.saldo_actual).toBe(15);
    });

    test('deductBalance debe lanzar error si saldo insuficiente', async () => {
      await expect(card.deductBalance(50)).rejects.toThrow('Saldo insuficiente');
    });
  });

  describe('Relaciones', () => {
    test('debería poder hacer populate de usuario_id', async () => {
      const card = new Card({
        uid: uniqueUid(),
        usuario_id: testUser._id,
        saldo_actual: 25.00
      });
      await card.save();
      const populatedCard = await Card.findById(card._id).populate('usuario_id');
      expect(populatedCard.usuario_id).toBeDefined();
      expect(populatedCard.usuario_id.nombre).toBe('Test User');
      expect(populatedCard.usuario_id.tipo_tarjeta).toBe('adulto');
    });
  });
}); 