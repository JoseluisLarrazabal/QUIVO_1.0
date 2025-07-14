const express = require("express")
const router = express.Router()
const Card = require("../models/Card")
const User = require("../models/User")
const { validateUid } = require("../middleware/validation")

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
    const { uid, nombre, tipo_tarjeta, telefono, email, saldo_inicial = 0 } = req.body

    // Validar que la tarjeta no exista
    const existingCard = await Card.findByUid(uid)
    if (existingCard) {
      return res.status(400).json({
        success: false,
        error: "La tarjeta ya está registrada",
      })
    }

    // Crear usuario
    const user = await User.create({
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

// Obtener tarjetas de un usuario específico
router.get("/usuario/:userId/tarjetas", async (req, res) => {
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
