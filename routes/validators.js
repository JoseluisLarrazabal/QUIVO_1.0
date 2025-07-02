const express = require("express")
const router = express.Router()
const Card = require("../models/Card")
const Transaction = require("../models/Transaction")
const Validator = require("../models/Validator")

// Validar tarjeta en bus
router.post("/validar", async (req, res) => {
  try {
    const { uid, validador_id } = req.body

    if (!uid || !validador_id) {
      return res.status(400).json({
        success: false,
        error: "UID y validador_id son requeridos",
      })
    }

    // Verificar que el validador existe y está activo
    const validator = await Validator.findById(validador_id)
    if (!validator || validator.estado !== "activo") {
      return res.status(400).json({
        success: false,
        error: "Validador no disponible",
      })
    }

    // Obtener información de la tarjeta
    const card = await Card.findByUid(uid)
    if (!card) {
      return res.status(404).json({
        success: false,
        error: "Tarjeta no encontrada o inactiva",
      })
    }

    const currentBalance = Number.parseFloat(card.saldo_actual)

    // Determinar tarifa según tipo de usuario
    const tarifas = {
      adulto: 2.5,
      estudiante: 1.0,
      adulto_mayor: 1.5,
    }

    const tarifa = tarifas[card.usuario_id.tipo_tarjeta] || 2.5

    // Verificar saldo suficiente
    if (currentBalance < tarifa) {
      // Registrar transacción fallida
      await Transaction.create({
        tarjeta_uid: uid,
        monto: -tarifa,
        tipo: "viaje",
        ubicacion: validator.ubicacion,
        validador_id: validador_id,
        resultado: "saldo_insuficiente",
      })

      return res.status(400).json({
        success: false,
        error: "Saldo insuficiente",
        saldo_actual: currentBalance,
        tarifa_requerida: tarifa,
      })
    }

    // Descontar tarifa
    const newBalance = currentBalance - tarifa
    await Card.updateBalance(uid, newBalance)

    // Registrar transacción exitosa
    const transaction = await Transaction.create({
      tarjeta_uid: uid,
      monto: -tarifa,
      tipo: "viaje",
      ubicacion: validator.ubicacion,
      validador_id: validador_id,
      resultado: "exitoso",
    })

    res.json({
      success: true,
      saldo_anterior: currentBalance,
      saldo_actual: newBalance,
      tarifa: tarifa,
      usuario: {
        nombre: card.usuario_id.nombre,
        tipo: card.usuario_id.tipo_tarjeta,
      },
      transaccion: transaction,
    })
  } catch (error) {
    console.error("Error en validación:", error)
    res.status(500).json({
      success: false,
      error: error.message || "Error al validar la tarjeta",
    })
  }
})

// Registrar nuevo validador
router.post("/validadores", async (req, res) => {
  try {
    const { id_validador, bus_id, ubicacion, operador } = req.body

    const validator = await Validator.create({
      id_validador,
      bus_id,
      ubicacion,
      operador,
    })

    res.status(201).json({
      success: true,
      data: validator,
    })
  } catch (error) {
    console.error("Error al crear validador:", error)
    res.status(500).json({
      success: false,
      error: "Error al registrar el validador",
    })
  }
})

// Actualizar estado de validador
router.put("/validadores/:id/estado", async (req, res) => {
  try {
    const { id } = req.params
    const { estado } = req.body

    if (!["activo", "inactivo", "mantenimiento"].includes(estado)) {
      return res.status(400).json({
        success: false,
        error: "Estado inválido",
      })
    }

    const validator = await Validator.updateStatus(id, estado)

    if (!validator) {
      return res.status(404).json({
        success: false,
        error: "Validador no encontrado",
      })
    }

    res.json({
      success: true,
      data: validator,
    })
  } catch (error) {
    console.error("Error al actualizar validador:", error)
    res.status(500).json({
      success: false,
      error: "Error al actualizar el validador",
    })
  }
})

// Listar validadores
router.get("/validadores", async (req, res) => {
  try {
    const validators = await Validator.getAll()
    res.json({
      success: true,
      data: validators,
    })
  } catch (error) {
    console.error("Error al listar validadores:", error)
    res.status(500).json({
      success: false,
      error: "Error al obtener los validadores",
    })
  }
})

module.exports = router
