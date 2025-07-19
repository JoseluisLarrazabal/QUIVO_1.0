const express = require("express")
const router = express.Router()
const Card = require("../models/Card")
const User = require("../models/User")
const { validateUid } = require("../middleware/validation")
const { authenticateToken, verifyCardOwnership } = require("../middleware/auth")

// Obtener información de tarjeta por UID
router.get("/saldo/:uid", validateUid, async (req, res) => {
  try {
    const { uid } = req.params
    const card = await Card.findByUid(uid)

    if (!card) {
      return res.status(404).json({
        success: false,
        error: "Tarjeta no encontrada",
      })
    }

    // Formatear la tarjeta para la respuesta
    const formattedCard = {
      id: card._id,
      uid: card.uid,
      saldo_actual: card.saldo_actual,
      fecha_creacion: card.createdAt,
      usuario: card.usuario_id ? {
        nombre: card.usuario_id.nombre,
        tipo_tarjeta: card.usuario_id.tipo_tarjeta
      } : undefined
    }
    res.json({
      success: true,
      data: formattedCard
    })
  } catch (error) {
    console.error("Error al obtener saldo:", error)
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    })
  }
})

// Crear nueva tarjeta
router.post("/tarjetas", async (req, res) => {
  try {
    const { uid, username, password, nombre, tipo_tarjeta, telefono, email, saldo_inicial = 0 } = req.body;

    // Validar que la tarjeta no exista
    const existingCard = await Card.findByUid(uid)
    if (existingCard) {
      return res.status(400).json({
        success: false,
        error: "La tarjeta ya está registrada",
      })
    }

    // Validar que username y password estén presentes
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username y password son requeridos para crear el usuario asociado",
      })
    }

    // Crear usuario
    const user = await User.create({
      username,
      password,
      nombre,
      tipo_tarjeta,
      telefono,
      email,
    })

    // Crear tarjeta
    const card = await Card.create({
      uid,
      usuario_id: user._id,
      saldo_actual: saldo_inicial,
    })

    res.status(201).json({
      success: true,
      data: {
        usuario: user,
        tarjeta: card,
      },
    })
  } catch (error) {
    console.error("Error al crear tarjeta:", error)
    res.status(500).json({
      success: false,
      error: "Error al crear la tarjeta",
    })
  }
})

// Obtener tarjetas de un usuario específico (requiere autenticación)
router.get("/usuario/:userId/tarjetas", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params
    const cards = await Card.find({ usuario_id: userId, activa: true })
      .populate("usuario_id", "nombre tipo_tarjeta")

    const formattedCards = cards.map(card => ({
      id: card._id,
      uid: card.uid,
      saldo_actual: card.saldo_actual,
      fecha_creacion: card.createdAt,
      usuario: card.usuario_id ? {
        nombre: card.usuario_id.nombre,
        tipo_tarjeta: card.usuario_id.tipo_tarjeta
      } : undefined
    }))
    res.json({
      success: true,
      data: formattedCards
    })
  } catch (error) {
    console.error("Error al obtener tarjetas del usuario:", error)
    res.status(500).json({
      success: false,
      error: "Error al obtener las tarjetas del usuario",
    })
  }
})

// Agregar tarjeta a usuario existente (requiere autenticación)
router.post('/usuario/:userId/tarjetas', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { uid, alias = '', tipo_tarjeta, saldo_inicial = 0 } = req.body;

    // Validar que la tarjeta no exista
    const existingCard = await Card.findByUid(uid);
    if (existingCard) {
      return res.status(400).json({
        success: false,
        error: 'La tarjeta ya está registrada',
      });
    }

    // Buscar usuario existente
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
      });
    }

    // Crear tarjeta
    const card = await Card.create({
      uid,
      usuario_id: user._id,
      alias,
      saldo_actual: saldo_inicial,
    });

    // (Opcional) Actualizar tipo_tarjeta del usuario si se provee
    if (tipo_tarjeta) {
      user.tipo_tarjeta = tipo_tarjeta;
      await user.save();
    }

    res.status(201).json({
      success: true,
      data: card,
    });
  } catch (error) {
    console.error('Error al agregar tarjeta a usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al agregar la tarjeta',
    });
  }
});

// Eliminar (desactivar) tarjeta (requiere autenticación y propiedad)
router.delete('/tarjetas/:uid', authenticateToken, verifyCardOwnership, async (req, res) => {
  try {
    const { uid } = req.params;
    const card = await Card.deactivate(uid);
    res.json({
      success: true,
      data: card,
    });
  } catch (error) {
    console.error('Error al eliminar tarjeta:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar la tarjeta',
    });
  }
});

// Actualizar alias de tarjeta (requiere autenticación y propiedad)
router.patch('/tarjetas/:uid', authenticateToken, verifyCardOwnership, async (req, res) => {
  try {
    const { uid } = req.params;
    const { alias } = req.body;
    if (typeof alias !== 'string' || alias.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Alias inválido',
      });
    }
    const card = await Card.findOneAndUpdate(
      { uid },
      { alias },
      { new: true, runValidators: true }
    );
    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Tarjeta no encontrada',
      });
    }
    res.json({
      success: true,
      data: card,
    });
  } catch (error) {
    console.error('Error al actualizar alias de tarjeta:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar el alias',
    });
  }
});

// Listar todas las tarjetas (admin)
router.get("/tarjetas", async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query
    const cards = await Card.getAllCards(Number.parseInt(limit), Number.parseInt(offset))

    const formattedCards = cards.map(card => ({
      id: card._id,
      uid: card.uid,
      saldo_actual: card.saldo_actual,
      fecha_creacion: card.createdAt,
      usuario: card.usuario_id ? {
        nombre: card.usuario_id.nombre,
        tipo_tarjeta: card.usuario_id.tipo_tarjeta
      } : undefined
    }))
    res.json({
      success: true,
      data: formattedCards,
      pagination: {
        limit: Number.parseInt(limit),
        offset: Number.parseInt(offset),
        total: cards.length,
      },
    })
  } catch (error) {
    console.error("Error al listar tarjetas:", error)
    res.status(500).json({
      success: false,
      error: "Error al obtener las tarjetas",
    })
  }
})

module.exports = router
