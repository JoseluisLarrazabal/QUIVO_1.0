const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Card = require('../models/Card');
const emailService = require('./emailService');

/**
 * Servicio de Autenticación
 * Patrón: Service Layer
 * Responsabilidades: Generación de tokens, validación, refresh tokens, registro, recuperación de contraseña
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
          apellido: user.apellido,
          tipo_tarjeta: user.tipo_tarjeta,
          email: user.email,
          telefono: user.telefono,
          emailVerified: user.emailVerified
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
            apellido: user.apellido,
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
      const { username, password, nombre, apellido, email, telefono } = userData;

      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ 
        $or: [{ username }, { email: email.toLowerCase() }] 
      });
      
      if (existingUser) {
        if (existingUser.username === username) {
          throw new Error('El nombre de usuario ya está en uso');
        }
        if (existingUser.email === email.toLowerCase()) {
          throw new Error('El email ya está registrado');
        }
      }

      // Crear nuevo usuario
      const user = new User({
        username,
        password,
        nombre,
        apellido,
        email,
        telefono,
        tipo_tarjeta: 'adulto' // Valor por defecto
      });

      await user.save();

      // Generar token de verificación de email
      const verificationToken = user.generateEmailVerificationToken();
      await user.save();

      // Enviar email de verificación
      try {
        await emailService.sendVerificationEmail(
          user.email, 
          verificationToken, 
          user.nombre
        );
      } catch (emailError) {
        console.warn('⚠️ No se pudo enviar email de verificación:', emailError.message);
        // No fallar el registro si el email no se puede enviar
      }

      // Enviar email de bienvenida
      try {
        await emailService.sendWelcomeEmail(user.email, user.nombre);
      } catch (emailError) {
        console.warn('⚠️ No se pudo enviar email de bienvenida:', emailError.message);
      }

      // Generar tokens (sin verificación de email requerida para login)
      const tokens = this.generateTokenPair(user);

      return {
        user: {
          id: user._id,
          username: user.username,
          nombre: user.nombre,
          apellido: user.apellido,
          tipo_tarjeta: user.tipo_tarjeta,
          email: user.email,
          telefono: user.telefono,
          emailVerified: user.emailVerified
        },
        tokens,
        message: 'Usuario registrado exitosamente. Revisa tu email para verificar tu cuenta.'
      };
    } catch (error) {
      throw new Error(`Error en registro: ${error.message}`);
    }
  }

  /**
   * Solicitar recuperación de contraseña
   * @param {String} email - Email del usuario
   * @returns {Object} Resultado de la solicitud
   */
  async requestPasswordReset(email) {
    try {
      const user = await User.findByEmail(email);
      if (!user) {
        // Por seguridad, no revelar si el email existe o no
        return { 
          success: true, 
          message: 'Si el email está registrado, recibirás un enlace de recuperación.' 
        };
      }

      // Generar token de reset
      const resetToken = user.generatePasswordResetToken();
      await user.save();

      // Enviar email de recuperación
      await emailService.sendPasswordResetEmail(
        user.email, 
        resetToken, 
        user.nombre
      );

      return { 
        success: true, 
        message: 'Se ha enviado un enlace de recuperación a tu email.' 
      };
    } catch (error) {
      throw new Error(`Error en solicitud de recuperación: ${error.message}`);
    }
  }

  /**
   * Resetear contraseña con token
   * @param {String} token - Token de reset
   * @param {String} newPassword - Nueva contraseña
   * @returns {Object} Resultado del reset
   */
  async resetPassword(token, newPassword) {
    try {
      const user = await User.findByResetToken(token);
      if (!user) {
        throw new Error('Token de recuperación inválido o expirado');
      }

      // Validar nueva contraseña
      if (!newPassword || newPassword.length < 6) {
        throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
      }

      // Actualizar contraseña
      user.password = newPassword;
      user.clearPasswordResetToken();
      await user.save();

      return { 
        success: true, 
        message: 'Contraseña actualizada exitosamente.' 
      };
    } catch (error) {
      throw new Error(`Error en reset de contraseña: ${error.message}`);
    }
  }

  /**
   * Verificar email con token
   * @param {String} token - Token de verificación
   * @returns {Object} Resultado de la verificación
   */
  async verifyEmail(token) {
    try {
      const user = await User.findByVerificationToken(token);
      if (!user) {
        throw new Error('Token de verificación inválido o expirado');
      }

      // Marcar email como verificado
      user.emailVerified = true;
      user.clearEmailVerificationToken();
      await user.save();

      return { 
        success: true, 
        message: 'Email verificado exitosamente.' 
      };
    } catch (error) {
      throw new Error(`Error en verificación de email: ${error.message}`);
    }
  }

  /**
   * Reenviar email de verificación
   * @param {String} email - Email del usuario
   * @returns {Object} Resultado del reenvío
   */
  async resendVerificationEmail(email) {
    try {
      const user = await User.findByEmail(email);
      if (!user) {
        return { 
          success: true, 
          message: 'Si el email está registrado, recibirás un enlace de verificación.' 
        };
      }

      if (user.emailVerified) {
        return { 
          success: true, 
          message: 'Tu email ya está verificado.' 
        };
      }

      // Generar nuevo token de verificación
      const verificationToken = user.generateEmailVerificationToken();
      await user.save();

      // Enviar email de verificación
      await emailService.sendVerificationEmail(
        user.email, 
        verificationToken, 
        user.nombre
      );

      return { 
        success: true, 
        message: 'Se ha enviado un nuevo enlace de verificación a tu email.' 
      };
    } catch (error) {
      throw new Error(`Error en reenvío de verificación: ${error.message}`);
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
        apellido: user.apellido,
        tipo_tarjeta: user.tipo_tarjeta,
        email: user.email,
        telefono: user.telefono,
        emailVerified: user.emailVerified
      };
    } catch (error) {
      throw new Error(`Error al validar token: ${error.message}`);
    }
  }
}

module.exports = new AuthService(); 