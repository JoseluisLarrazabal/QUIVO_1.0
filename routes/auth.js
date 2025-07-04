const express = require("express")
const router = express.Router()
const User = require("../models/User")
const Card = require("../models/Card")

// Login con usuario y contraseña
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Usuario y contraseña son requeridos",
      })
    }

    const user = await User.authenticate(username, password)

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Usuario o contraseña incorrectos",
      })
    }

    // Obtener todas las tarjetas del usuario
    const cards = await Card.find({ usuario_id: user._id, activa: true })
      .populate("usuario_id", "nombre tipo_tarjeta")

    res.json({
      success: true,
      data: {
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
          fecha_creacion: card.createdAt
        }))
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

// Registro de nuevo usuario
router.post("/register", async (req, res) => {
  try {
    const { username, password, nombre, tipo_tarjeta, telefono, email } = req.body

    if (!username || !password || !nombre || !tipo_tarjeta) {
      return res.status(400).json({
        success: false,
        error: "Todos los campos obligatorios son requeridos",
      })
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findByUsername(username)
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "El nombre de usuario ya está en uso",
      })
    }

    const user = new User({
      username,
      password,
      nombre,
      tipo_tarjeta,
      telefono,
      email
    })

    await user.save()

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          nombre: user.nombre,
          tipo_tarjeta: user.tipo_tarjeta,
          email: user.email,
          telefono: user.telefono
        }
      },
    })
  } catch (error) {
    console.error("Error en registro:", error)
    res.status(500).json({
      success: false,
      error: "Error al registrar usuario",
    })
  }
})

module.exports = router
