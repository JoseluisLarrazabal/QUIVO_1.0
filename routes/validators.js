const express = require("express")
const router = express.Router()
const Card = require("../models/Card")
const Transaction = require("../models/Transaction")
const Validator = require("../models/Validator")
const mongoose = require("mongoose")

// Validar tarjeta en bus
router.post("/validar", async (req, res) => {
  try {
    const { uid, validador_id } = req.body;
    if (!uid || !validador_id) {
      return res.status(400).json({ success: false, error: "UID y validador_id son requeridos" });
    }
    // Verificar que el validador existe y está activo
    const validator = await Validator.findOne({ id_validador: validador_id });
    if (!validator || validator.estado !== "activo") {
      return res.status(400).json({ success: false, error: "Validador no disponible" });
    }
    // Buscar la tarjeta con sus datos de usuario y activa
    const card = await Card.findOne({ uid, activa: true }).populate('usuario_id');
    if (!card || !card.activa) {
      return res.status(404).json({ success: false, error: "Tarjeta no encontrada o inactiva" });
    }
    // Determinar tarifa según tipo de usuario
    let tarifa = 2.5;
    if (card.usuario_id.tipo_tarjeta === 'estudiante') {
      tarifa = 1.0;
    } else if (card.usuario_id.tipo_tarjeta === 'adulto_mayor') {
      tarifa = 1.5;
    }
    // Verificar saldo suficiente
    if (card.saldo_actual < tarifa) {
      let failedTransaction;
      try {
        [failedTransaction] = await Transaction.create([{
          tarjeta_uid: uid,
          monto: -tarifa,
          tipo: "viaje",
          validador_id: validador_id,
          resultado: "saldo_insuficiente",
          metadata: {
            saldo_actual: card.saldo_actual,
            ubicacion: validator.ubicacion
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
      return res.status(400).json({
        success: false,
        error: "Saldo insuficiente",
        saldo_actual: card.saldo_actual,
        tarifa_requerida: tarifa,
        usuario: {
          nombre: card.usuario_id.nombre,
          tipo: card.usuario_id.tipo_tarjeta
        },
        transaccion: failedTransaction
      });
    }
    // Actualizar saldo
    const saldo_anterior = card.saldo_actual;
    const newBalance = card.saldo_actual - tarifa;
    const updatedCard = await Card.findOneAndUpdate(
      { uid },
      { saldo_actual: newBalance },
      { new: true }
    );
    let transaction;
    try {
      [transaction] = await Transaction.create([{
        tarjeta_uid: uid,
        monto: -tarifa,
        tipo: "viaje",
        validador_id: validador_id,
        resultado: "exitoso",
        metadata: {
          saldo_anterior: saldo_anterior,
          saldo_nuevo: newBalance,
          ubicacion: validator.ubicacion
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
    return res.status(200).json({
      success: true,
      message: "Validación exitosa",
      saldo_anterior: saldo_anterior,
      saldo_actual: newBalance,
      tarifa: tarifa,
      usuario: {
        nombre: card.usuario_id.nombre,
        tipo: card.usuario_id.tipo_tarjeta
      },
      transaccion: transaction
    });
  } catch (error) {
    console.error("Error en validación:", error);
    return res.status(500).json({ success: false, error: "Error en la validación" });
  }
});

// Registrar nuevo validador
router.post("/validadores", async (req, res) => {
  try {
    const { id_validador, bus_id, ubicacion, operador } = req.body;

    // Verificar si ya existe un validador con el mismo ID
    const existingValidator = await Validator.findOne({ id_validador });
    if (existingValidator) {
      return res.status(400).json({
        success: false,
        error: "El ID del validador ya está en uso"
      });
    }

    const validator = await Validator.create({
      id_validador,
      bus_id,
      ubicacion,
      operador,
      estado: 'activo' // Estado por defecto
    });

    res.status(201).json({
      success: true,
      data: validator,
    });
  } catch (error) {
    console.error("Error al crear validador:", error);
    if (error.code === 11000) { // Error de índice único
      return res.status(400).json({
        success: false,
        error: "El ID del validador ya está en uso"
      });
    }
    res.status(500).json({
      success: false,
      error: "Error al registrar el validador",
    });
  }
});

// Actualizar estado de validador
router.put("/validadores/:id/estado", async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!["activo", "inactivo", "mantenimiento"].includes(estado)) {
      return res.status(400).json({
        success: false,
        error: "Estado inválido",
      });
    }

    const validator = await Validator.findOneAndUpdate(
      { id_validador: id },
      { estado },
      { new: true }
    );

    if (!validator) {
      return res.status(404).json({
        success: false,
        error: "Validador no encontrado",
      });
    }

    res.json({
      success: true,
      data: validator,
    });
  } catch (error) {
    console.error("Error al actualizar validador:", error);
    res.status(500).json({
      success: false,
      error: "Error al actualizar el validador",
    });
  }
});

// Listar validadores
router.get("/validadores", async (req, res) => {
  try {
    const validators = await Validator.find().sort({ id_validador: 1 });
    res.json({
      success: true,
      data: validators,
    });
  } catch (error) {
    console.error("Error al listar validadores:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener los validadores",
    });
  }
});

module.exports = router
