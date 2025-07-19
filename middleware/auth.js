const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware de autenticación JWT
 * Verifica el token JWT en el header Authorization
 * Patrón: Middleware de Autenticación
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token de acceso requerido',
        code: 'TOKEN_MISSING'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el usuario existe y está activo
    const user = await User.findById(decoded.userId);
    if (!user || !user.activo) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no encontrado o inactivo',
        code: 'USER_INVALID'
      });
    }

    // Agregar información del usuario al request
    req.user = {
      id: user._id,
      username: user.username,
      nombre: user.nombre,
      tipo_tarjeta: user.tipo_tarjeta,
      email: user.email
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token inválido',
        code: 'TOKEN_INVALID'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }

    console.error('Error en autenticación:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno de autenticación',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Middleware de autorización por roles
 * Verifica que el usuario tenga los permisos necesarios
 * Patrón: Middleware de Autorización
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Autenticación requerida',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!roles.includes(req.user.tipo_tarjeta)) {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado. Permisos insuficientes',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

/**
 * Middleware de verificación de propiedad de tarjeta
 * Verifica que la tarjeta pertenezca al usuario autenticado
 * Patrón: Middleware de Verificación de Propiedad
 */
const verifyCardOwnership = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const userId = req.user.id;

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

    if (card.usuario_id.toString() !== userId) {
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

/**
 * Middleware de verificación opcional de token
 * Permite acceso con o sin token (para endpoints públicos)
 * Patrón: Middleware de Autenticación Opcional
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user && user.activo) {
        req.user = {
          id: user._id,
          username: user.username,
          nombre: user.nombre,
          tipo_tarjeta: user.tipo_tarjeta,
          email: user.email
        };
      }
    }

    next();
  } catch (error) {
    // En autenticación opcional, ignoramos errores de token
    next();
  }
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  verifyCardOwnership,
  optionalAuth
}; 