const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const Card = require("../models/Card");
const { validateUid } = require("../middleware/validation");
const mongoose = require("mongoose");

// Obtener historial de transacciones
router.get("/historial/:uid", validateUid, async (req, res) => {
  try {
    const { uid } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    // Verificar que la tarjeta existe y está activa
    const card = await Card.findOne({ uid, activa: true });
    if (!card) {
      return res.status(404).json({ success: false, error: "Tarjeta no encontrada" });
    }
    // Obtener transacciones paginadas y ordenadas por fecha
    const transactions = await Transaction.find({ tarjeta_uid: uid })
      .sort({ createdAt: -1 })
      .skip(Number.parseInt(offset))
      .limit(Number.parseInt(limit))
      .exec();
    // Formatear las transacciones
    const formattedTransactions = transactions.map(t => ({
      id: t._id,
      tarjeta_uid: t.tarjeta_uid,
      monto: t.monto,
      tipo: t.tipo,
      ubicacion: t.metadata?.ubicacion || t.ubicacion,
      validador_id: t.validador_id,
      resultado: t.resultado,
      fecha_hora: t.createdAt,
      metadata: t.metadata
    }));
    res.status(200).json({
      success: true,
      data: formattedTransactions,
    });
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener el historial"
    });
  }
});

// Recargar tarjeta
router.post("/recargar", async (req, res) => {
  try {
    const { uid, monto, metodo_pago = "efectivo" } = req.body;
    if (!uid || !monto || monto <= 0) {
      return res.status(400).json({ success: false, error: "UID y monto son requeridos, monto debe ser mayor a 0" });
    }
    if (monto < 5) {
      return res.status(400).json({ success: false, error: "El monto mínimo de recarga es 5 Bs" });
    }
    // Obtener tarjeta actual y activa
    const card = await Card.findOne({ uid, activa: true });
    if (!card) {
      return res.status(404).json({ success: false, error: "Tarjeta no encontrada" });
    }
    const montoFloat = Number.parseFloat(monto);
    const saldoActual = Number.parseFloat(card.saldo_actual);
    const newBalance = saldoActual + montoFloat;
    // Actualizar saldo
    const updatedCard = await Card.findOneAndUpdate(
      { uid },
      { saldo_actual: newBalance },
      { new: true }
    );
    if (!updatedCard) {
      return res.status(500).json({ success: false, error: "Error al actualizar saldo" });
    }
    // Registrar transacción
    let transaction;
    try {
      [transaction] = await Transaction.create([{
        tarjeta_uid: uid,
        monto: montoFloat,
        tipo: "recarga",
        ubicacion: `Recarga ${metodo_pago}`,
        resultado: "exitoso",
        metadata: {
          metodo_pago,
          saldo_anterior: saldoActual,
          saldo_nuevo: newBalance
        }
      }]);
    } catch (err) {
      if (err.message && err.message.includes('Duplicado')) {
        return res.status(400).json({ success: false, error: "Transacción duplicada" });
      }
      if (err.name === 'ValidationError') {
        return res.status(400).json({ success: false, error: err.message });
      }
      throw err;
    }
    const formattedTransaction = {
      id: transaction._id,
      tarjeta_uid: transaction.tarjeta_uid,
      monto: transaction.monto,
      tipo: transaction.tipo,
      ubicacion: transaction.ubicacion,
      validador_id: transaction.validador_id,
      resultado: transaction.resultado,
      fecha_hora: transaction.createdAt,
      metadata: transaction.metadata
    };
    res.json({ success: true, message: "Recarga exitosa", data: { nuevo_saldo: newBalance, transaccion: formattedTransaction } });
  } catch (error) {
    console.error("Error al recargar:", error);
    res.status(500).json({ success: false, error: error.message || "Error al procesar la recarga" });
  }
});

module.exports = router;
