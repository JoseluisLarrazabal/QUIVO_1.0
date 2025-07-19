const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Card = require('../models/Card');

/**
 * Servicio de Autenticación
 * Patrón: Service Layer
 * Responsabilidades: Generación de tokens, validación, refresh tokens
 */
class AuthService {
  /**
   * Generar token de acceso JWT
   * @param {Object} user - Objeto usuario
   * @returns {String} Token JWT
   */
  generateAccessToken(user) {
    const payload = {
      userId: user._id,
      username: user.username,
      tipo_tarjeta: user.tipo_tarjeta,
      type: 'access'
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
  }

  /**
   * Generar refresh token
   * @param {Object} user - Objeto usuario
   * @returns {String} Refresh token
   */
  generateRefreshToken(user) {
    const payload = {
      userId: user._id,
      type: 'refresh'
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
    });
  }

  /**
   * Generar par de tokens (access + refresh)
   * @param {Object} user - Objeto usuario
   * @returns {Object} Objeto con accessToken y refreshToken
   */
  generateTokenPair(user) {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user)
    };
  }

  /**
   * Verificar token JWT
   * @param {String} token - Token a verificar
   * @returns {Object} Payload decodificado
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error(`Token inválido: ${error.message}`);
    }
  }

  /**
   * Autenticar usuario con credenciales
   * @param {String} username - Nombre de usuario
   * @param {String} password - Contraseña
   * @returns {Object} Usuario autenticado con tokens
   */
  async authenticateUser(username, password) {
    try {
      // Buscar usuario
      const user = await User.findOne({ username, activo: true });
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar contraseña
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        throw new Error('Contraseña incorrecta');
      }

      // Generar tokens
      const tokens = this.generateTokenPair(user);

      // Obtener tarjetas del usuario
      const cards = await Card.find({ usuario_id: user._id, activa: true });

      return {
        user: {
          id: user._id,
          username: user.username,
          nombre: user.nombre,
          tipo_tarjeta: user.tipo_tarjeta,
          email: user.email,
          telefono: user.telefono
        },
        cards: cards.map(card => ({
          uid: card.uid,
          saldo_actual: Number.parseFloat(card.saldo_actual),
          alias: card.alias,
          fecha_creacion: card.createdAt
        })),
        tokens
      };
    } catch (error) {
      throw new Error(`Error de autenticación: ${error.message}`);
    }
  }

  /**
   * Autenticar usuario con UID de tarjeta
   * @param {String} uid - UID de la tarjeta
   * @returns {Object} Información de la tarjeta con tokens
   */
  async authenticateWithCard(uid) {
    try {
      // Buscar tarjeta con usuario
      const card = await Card.findOne({ uid, activa: true }).populate('usuario_id');
      if (!card) {
        throw new Error('Tarjeta no encontrada o inactiva');
      }

      const user = card.usuario_id;
      if (!user || !user.activo) {
        throw new Error('Usuario asociado a la tarjeta no está activo');
      }

      // Generar tokens
      const tokens = this.generateTokenPair(user);

      return {
        card: {
          uid: card.uid,
          saldo_actual: Number.parseFloat(card.saldo_actual),
          alias: card.alias,
          fecha_creacion: card.createdAt,
          usuario: {
            nombre: user.nombre,
            tipo_tarjeta: user.tipo_tarjeta
          }
        },
        tokens,
        authMode: 'card'
      };
    } catch (error) {
      throw new Error(`Error de autenticación por tarjeta: ${error.message}`);
    }
  }

  /**
   * Registrar nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Object} Usuario creado con tokens
   */
  async registerUser(userData) {
    try {
      const { username, password, nombre, tipo_tarjeta, telefono, email } = userData;

      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        throw new Error('El nombre de usuario ya está en uso');
      }

      // Crear nuevo usuario
      const user = new User({
        username,
        password,
        nombre,
        tipo_tarjeta,
        telefono,
        email
      });

      await user.save();

      // Generar tokens
      const tokens = this.generateTokenPair(user);

      return {
        user: {
          id: user._id,
          username: user.username,
          nombre: user.nombre,
          tipo_tarjeta: user.tipo_tarjeta,
          email: user.email,
          telefono: user.telefono
        },
        tokens
      };
    } catch (error) {
      throw new Error(`Error en registro: ${error.message}`);
    }
  }

  /**
   * Refrescar token de acceso
   * @param {String} refreshToken - Refresh token
   * @returns {Object} Nuevo par de tokens
   */
  async refreshAccessToken(refreshToken) {
    try {
      // Verificar refresh token
      const decoded = this.verifyToken(refreshToken);
      
      if (decoded.type !== 'refresh') {
        throw new Error('Token de tipo incorrecto');
      }

      // Buscar usuario
      const user = await User.findById(decoded.userId);
      if (!user || !user.activo) {
        throw new Error('Usuario no encontrado o inactivo');
      }

      // Generar nuevos tokens
      return this.generateTokenPair(user);
    } catch (error) {
      throw new Error(`Error al refrescar token: ${error.message}`);
    }
  }

  /**
   * Revocar tokens (logout)
   * @param {String} userId - ID del usuario
   * @returns {Boolean} True si se revocó exitosamente
   */
  async revokeTokens(userId) {
    try {
      // En una implementación más avanzada, aquí se invalidarían los tokens
      // Por ahora, simplemente verificamos que el usuario existe
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return true;
    } catch (error) {
      throw new Error(`Error al revocar tokens: ${error.message}`);
    }
  }

  /**
   * Validar token y obtener información del usuario
   * @param {String} token - Token de acceso
   * @returns {Object} Información del usuario
   */
  async validateTokenAndGetUser(token) {
    try {
      const decoded = this.verifyToken(token);
      
      if (decoded.type !== 'access') {
        throw new Error('Token de tipo incorrecto');
      }

      const user = await User.findById(decoded.userId);
      if (!user || !user.activo) {
        throw new Error('Usuario no encontrado o inactivo');
      }

      return {
        id: user._id,
        username: user.username,
        nombre: user.nombre,
        tipo_tarjeta: user.tipo_tarjeta,
        email: user.email,
        telefono: user.telefono
      };
    } catch (error) {
      throw new Error(`Error al validar token: ${error.message}`);
    }
  }
}

module.exports = new AuthService(); 