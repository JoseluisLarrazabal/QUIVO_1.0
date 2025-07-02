const express = require("express")
const router = express.Router()
const User = require("../models/User")
const Card = require("../models/Card")

// Login básico con UID
router.post("/login", async (req, res) => {
  try {
    const { uid } = req.body

    if (!uid) {
      return res.status(400).json({
        success: false,
        error: "UID es requerido",
      })
    }

    const card = await Card.findByUid(uid)

    if (!card) {
      return res.status(404).json({
        success: false,
        error: "Tarjeta no encontrada",
      })
    }

    res.json({
      success: true,
      data: {
        uid: card.uid,
        nombre: card.usuario_id.nombre,
        tipo_tarjeta: card.usuario_id.tipo_tarjeta,
        saldo_actual: Number.parseFloat(card.saldo_actual),
      },
    })
  } catch (error) {
    console.error("Error en login:", error)
    res.status(500).json({
      success: false,
      error: "Error en autenticación",
    })
  }
})

module.exports = router
