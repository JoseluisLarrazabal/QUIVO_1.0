const express = require("express")
const router = express.Router()
const Transaction = require("../models/Transaction")
const Card = require("../models/Card")
const { validateUid } = require("../middleware/validation")

// Obtener historial de transacciones
router.get("/historial/:uid", validateUid, async (req, res) => {
  try {
    const { uid } = req.params
    const { limit = 50, offset = 0 } = req.query

    // Verificar que la tarjeta existe
    const card = await Card.findByUid(uid)
    if (!card) {
      return res.status(404).json({
        success: false,
        error: "Tarjeta no encontrada",
      })
    }

    const transactions = await Transaction.getByCardUid(uid, Number.parseInt(limit), Number.parseInt(offset))

    res.json({
      success: true,
      data: transactions,
    })
  } catch (error) {
    console.error("Error al obtener historial:", error)
    res.status(500).json({
      success: false,
      error: "Error al obtener el historial",
    })
  }
})

// Recargar tarjeta
router.post("/recargar", async (req, res) => {
  try {
    const { uid, monto, metodo_pago = "efectivo" } = req.body

    if (!uid || !monto || monto <= 0) {
      return res.status(400).json({
        success: false,
        error: "UID y monto son requeridos, monto debe ser mayor a 0",
      })
    }

    if (monto < 5) {
      return res.status(400).json({
        success: false,
        error: "El monto mínimo de recarga es 5 Bs",
      })
    }

    // Obtener tarjeta actual
    const card = await Card.findByUid(uid)
    if (!card) {
      return res.status(404).json({
        success: false,
        error: "Tarjeta no encontrada",
      })
    }

    const newBalance = Number.parseFloat(card.saldo_actual) + Number.parseFloat(monto)

    // Actualizar saldo
    await Card.updateBalance(uid, newBalance)

    // Registrar transacción
    const transaction = await Transaction.create({
      tarjeta_uid: uid,
      monto: Number.parseFloat(monto),
      tipo: "recarga",
      ubicacion: `Recarga ${metodo_pago}`,
      resultado: "exitoso",
    })

    res.json({
      success: true,
      message: "Recarga exitosa",
      data: {
        nuevo_saldo: newBalance,
        transaccion: transaction,
      },
    })
  } catch (error) {
    console.error("Error al recargar:", error)
    res.status(500).json({
      success: false,
      error: error.message || "Error al procesar la recarga",
    })
  }
})

module.exports = router
