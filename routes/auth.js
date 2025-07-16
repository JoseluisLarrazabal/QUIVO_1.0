const express = require("express")
const router = express.Router()
const User = require("../models/User")
const Card = require("../models/Card")

// Login con usuario y contraseña
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: "Usuario y contraseña son requeridos" });
    }
    const user = await User.authenticate(username, password);
    if (!user) {
      return res.status(401).json({ success: false, error: "Usuario o contraseña incorrectos" });
    }
    // Obtener todas las tarjetas activas del usuario
    const cards = await Card.find({ usuario_id: user._id, activa: true });
    const formattedUser = {
      id: user._id,
      username: user.username,
      nombre: user.nombre,
      tipo_tarjeta: user.tipo_tarjeta,
      email: user.email,
      telefono: user.telefono
    };
    const formattedCards = cards.map(card => ({
      uid: card.uid,
      saldo_actual: Number.parseFloat(card.saldo_actual),
      fecha_creacion: card.createdAt
    }));
    // Siempre devolver 200 si el usuario es válido, aunque no tenga tarjetas
    res.status(200).json({ success: true, data: { user: formattedUser, cards: formattedCards } });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ success: false, error: "Error en autenticación" });
  }
});

// Login con UID de tarjeta
router.post("/login-card", async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) {
      return res.status(400).json({ success: false, error: "UID de tarjeta es requerido" });
    }
    
    // Buscar la tarjeta con sus datos de usuario
    const card = await Card.findOne({ uid, activa: true }).populate('usuario_id');
    if (!card) {
      return res.status(404).json({ success: false, error: "Tarjeta no encontrada o inactiva" });
    }

    // Formatear respuesta para login por tarjeta
    const formattedCard = {
      uid: card.uid,
      saldo_actual: Number.parseFloat(card.saldo_actual),
      fecha_creacion: card.createdAt,
      usuario: {
        nombre: card.usuario_id.nombre,
        tipo_tarjeta: card.usuario_id.tipo_tarjeta
      }
    };

    res.status(200).json({ 
      success: true, 
      data: { 
        card: formattedCard,
        authMode: 'card' // Indicar modo de autenticación
      } 
    });
  } catch (error) {
    console.error("Error en login por tarjeta:", error);
    res.status(500).json({ success: false, error: "Error en autenticación por tarjeta" });
  }
});

// Registro de nuevo usuario
router.post("/register", async (req, res) => {
  try {
    const { username, password, nombre, tipo_tarjeta, telefono, email } = req.body;
    if (!username || !password || !nombre || !tipo_tarjeta) {
      return res.status(400).json({ success: false, error: "Todos los campos obligatorios son requeridos" });
    }
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "El nombre de usuario ya está en uso" });
    }
    const user = new User({ username, password, nombre, tipo_tarjeta, telefono, email });
    try {
      await user.save();
    } catch (err) {
      if (err.message && err.message.includes('Duplicado')) {
        return res.status(400).json({ success: false, error: "El nombre de usuario ya está en uso" });
      }
      if (err.name === 'ValidationError') {
        return res.status(400).json({ success: false, error: err.message });
      }
      throw err;
    }
    const formattedUser = {
      id: user._id,
      username: user.username,
      nombre: user.nombre,
      tipo_tarjeta: user.tipo_tarjeta,
      email: user.email,
      telefono: user.telefono
    };
    res.status(201).json({ success: true, data: { user: formattedUser } });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ success: false, error: "Error al registrar usuario" });
  }
});

module.exports = router
