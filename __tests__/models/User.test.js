const mongoose = require('mongoose');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const Card = require('../../models/Card');

// Función para generar username único
function uniqueUsername(base = 'testuser') {
  return `${base}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

// Función para generar UID único
function uniqueUid(base = 'CARD') {
  return `${base}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

describe('User Model', () => {
  describe('Validaciones', () => {
    test('debería crear un usuario válido', async () => {
      const username = uniqueUsername();
      const userData = {
        username,
        password: '123456',
        nombre: 'Test User',
        tipo_tarjeta: 'adulto',
        email: `${username}@example.com`,
        telefono: '59171234567'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.username).toBe(userData.username);
      expect(savedUser.nombre).toBe(userData.nombre);
      expect(savedUser.tipo_tarjeta).toBe(userData.tipo_tarjeta);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.telefono).toBe(userData.telefono);
      expect(savedUser.activo).toBe(true);
      expect(savedUser.password).not.toBe(userData.password); // Debe estar encriptada
    });

    test('debería requerir username', async () => {
      const userData = {
        password: '123456',
        nombre: 'Test User',
        tipo_tarjeta: 'adulto'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    test('debería requerir password', async () => {
      const userData = {
        username: uniqueUsername(),
        nombre: 'Test User',
        tipo_tarjeta: 'adulto'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    test('debería requerir nombre', async () => {
      const userData = {
        username: uniqueUsername(),
        password: '123456',
        tipo_tarjeta: 'adulto'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    test('debería requerir tipo_tarjeta', async () => {
      const userData = {
        username: uniqueUsername(),
        password: '123456',
        nombre: 'Test User'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    test('debería validar tipo_tarjeta válido', async () => {
      const userData = {
        username: uniqueUsername(),
        password: '123456',
        nombre: 'Test User',
        tipo_tarjeta: 'invalido'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    test('debería validar username único', async () => {
      const username = uniqueUsername();
      const userData = {
        username,
        password: '123456',
        nombre: 'Test User',
        tipo_tarjeta: 'adulto'
      };

      await User.create(userData);
      const duplicateUser = new User(userData);
      
      // Esperar que falle con error de duplicado
      await expect(duplicateUser.save()).rejects.toThrow();
    });
  });

  describe('Encriptación de contraseña', () => {
    test('debería encriptar la contraseña antes de guardar', async () => {
      const username = uniqueUsername();
      const userData = {
        username,
        password: '123456',
        nombre: 'Test User',
        tipo_tarjeta: 'adulto'
      };

      const user = new User(userData);
      await user.save();

      expect(user.password).not.toBe(userData.password);
      expect(user.password).toMatch(/^[\$]2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/); // Formato bcrypt
    });

    test('debería comparar contraseñas correctamente', async () => {
      const username = uniqueUsername();
      const userData = {
        username,
        password: '123456',
        nombre: 'Test User',
        tipo_tarjeta: 'adulto'
      };

      const user = new User(userData);
      await user.save();

      const isMatch = await user.comparePassword('123456');
      expect(isMatch).toBe(true);

      const isNotMatch = await user.comparePassword('wrongpassword');
      expect(isNotMatch).toBe(false);
    });
  });

  describe('Métodos estáticos', () => {
    let username;
    beforeEach(async () => {
      username = uniqueUsername();
      await User.create({
        username,
        password: '123456',
        nombre: 'Test User',
        tipo_tarjeta: 'adulto',
        email: `${username}@example.com`
      });
    });

    test('findByUsername debería encontrar usuario por username', async () => {
      const user = await User.findByUsername(username);
      expect(user).toBeTruthy();
      expect(user.username).toBe(username);
      expect(user.nombre).toBe('Test User');
    });

    test('findByUsername debería retornar null para usuario inexistente', async () => {
      const user = await User.findByUsername('nonexistent');
      expect(user).toBeNull();
    });

    test('authenticate debería autenticar usuario válido', async () => {
      const user = await User.authenticate(username, '123456');
      expect(user).toBeTruthy();
      expect(user.username).toBe(username);
    });

    test('authenticate debería fallar con contraseña incorrecta', async () => {
      const user = await User.authenticate(username, 'wrongpassword');
      expect(user).toBeNull();
    });

    test('authenticate debería fallar con usuario inexistente', async () => {
      const user = await User.authenticate('nonexistent', '123456');
      expect(user).toBeNull();
    });
  });

  describe('Virtuals', () => {
    test('debería tener virtual tarjetas', async () => {
      const user = new User({
        username: uniqueUsername(),
        password: '123456',
        nombre: 'Test User',
        tipo_tarjeta: 'adulto',
        email: 'test@example.com'
      });
      await user.save();
      const card = new Card({
        uid: uniqueUid(),
        usuario_id: user._id,
        saldo_actual: 25.00
      });
      await card.save();
      const populatedUser = await User.findById(user._id).populate('tarjetas');
      expect(populatedUser.tarjetas).toBeDefined();
      expect(Array.isArray(populatedUser.tarjetas)).toBe(true);
      expect(populatedUser.tarjetas.length).toBeGreaterThan(0);
      expect(populatedUser.tarjetas[0].uid).toBe(card.uid);
    });
  });
}); 