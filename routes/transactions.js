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

const TransactionService = require("../services/transactionService");
const PaymentService = require("../services/paymentService");

// Recargar tarjeta con validación real de pago
router.post("/recargar", async (req, res) => {
  try {
    const { uid, monto, metodo_pago = "efectivo" } = req.body;
    
    // Validaciones básicas
    if (!uid || !monto || monto <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: "UID y monto son requeridos, monto debe ser mayor a 0" 
      });
    }
    
    if (monto < 5) {
      return res.status(400).json({ 
        success: false, 
        error: "El monto mínimo de recarga es 5 Bs" 
      });
    }

    // Ejecutar transacción atómica
    const result = await TransactionService.executeAtomicTransaction(async (session) => {
      // 1. Validar pago real antes de actualizar saldo
      let paymentValidation;
      switch (metodo_pago) {
        case 'tigo_money':
          paymentValidation = await PaymentService.validateTigoMoney(
            monto, 
            req.body.phone, 
            req.body.reference
          );
          break;
        case 'qr':
          paymentValidation = await PaymentService.validateQRPayment(
            monto, 
            req.body.qrCode
          );
          break;
        case 'efectivo':
          paymentValidation = await PaymentService.validateCashPayment(
            monto, 
            req.body.location, 
            req.body.operator
          );
          break;
        default:
          throw new Error('Método de pago no válido');
      }
      
      if (!paymentValidation.success) {
        throw new Error(`Pago fallido: ${paymentValidation.error}`);
      }
      
      // 2. Verificar que la tarjeta existe y está activa
      const card = await Card.findOne({ uid, activa: true }).session(session);
      if (!card) {
        throw new Error('Tarjeta no encontrada');
      }
      
      // 3. Actualizar saldo solo si pago exitoso
      const montoFloat = Number.parseFloat(monto);
      const saldoActual = Number.parseFloat(card.saldo_actual);
      const newBalance = saldoActual + montoFloat;
      
      const updatedCard = await Card.findOneAndUpdate(
        { uid },
        { saldo_actual: newBalance },
        { new: true, session: session }
      );
      
      if (!updatedCard) {
        throw new Error('Error al actualizar saldo');
      }
      
      // 4. Registrar transacción exitosa
      const [transaction] = await Transaction.create([{
        tarjeta_uid: uid,
        monto: montoFloat,
        tipo: "recarga",
        ubicacion: `Recarga ${metodo_pago}`,
        resultado: "exitoso",
        metadata: {
          metodo_pago,
          payment_id: paymentValidation.transactionId,
          saldo_anterior: saldoActual,
          saldo_nuevo: newBalance,
          provider: paymentValidation.provider
        }
      }], { session: session });
      
      return { card: updatedCard, transaction };
    });
    
    if (result.success) {
      const { card, transaction } = result.data;
      const formattedTransaction = {
        id: transaction._id,
        tarjeta_uid: transaction.tarjeta_uid,
        monto: transaction.monto,
        tipo: transaction.tipo,
        ubicacion: transaction.ubicacion,
        resultado: transaction.resultado,
        fecha_hora: transaction.createdAt,
        metadata: transaction.metadata
      };
      
      console.log('✅ Recarga exitosa:', {
        uid: uid,
        monto: monto,
        metodo_pago: metodo_pago,
        payment_id: transaction.metadata.payment_id
      });
      
      res.status(200).json({
        success: true,
        message: "Recarga exitosa",
        data: {
          card: card,
          transaction: formattedTransaction
        }
      });
    } else {
      console.error('❌ Recarga fallida:', result.error);
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error("Error al recargar:", error);
    res.status(500).json({
      success: false,
      error: "Error al procesar la recarga"
    });
  }
});

module.exports = router;
