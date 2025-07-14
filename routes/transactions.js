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

    // Formatear las transacciones para el frontend/tests
    const formattedTransactions = transactions.map(t => ({
      id: t._id,
      tarjeta_uid: t.tarjeta_uid,
      monto: t.monto,
      tipo: t.tipo,
      ubicacion: t.ubicacion,
      validador_id: t.validador_id,
      resultado: t.resultado,
      fecha_hora: t.createdAt,
    }))

    res.json({
      success: true,
      data: formattedTransactions,
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

    // Formatear la transacción para la respuesta
    const formattedTransaction = {
      id: transaction._id,
      tarjeta_uid: transaction.tarjeta_uid,
      monto: transaction.monto,
      tipo: transaction.tipo,
      ubicacion: transaction.ubicacion,
      validador_id: transaction.validador_id,
      resultado: transaction.resultado,
      fecha_hora: transaction.createdAt,
    }

    res.json({
      success: true,
      message: "Recarga exitosa",
      data: {
        nuevo_saldo: newBalance,
        transaccion: formattedTransaction,
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
