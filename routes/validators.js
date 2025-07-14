const express = require("express")
const router = express.Router()
const Card = require("../models/Card")
const Transaction = require("../models/Transaction")
const Validator = require("../models/Validator")

// Validar tarjeta en bus
router.post("/validar", async (req, res) => {
  try {
    const { uid, validador_id } = req.body;
    // Validación de campos requeridos
    if (!uid || !validador_id) {
      return res.status(400).json({
        success: false,
        error: "UID y validador_id son requeridos"
      });
    }

    // Verificar que el validador existe y está activo
    const validator = await Validator.findOne({ id_validador: validador_id });
    if (!validator || validator.estado !== "activo") {
      return res.status(400).json({
        success: false,
        error: "Validador no disponible"
      });
    }

    // Obtener información de la tarjeta con población de datos de usuario
    const card = await Card.findByUid(uid).populate('usuario_id');
    if (!card || !card.activa) {
      return res.status(404).json({
        success: false,
        error: "Tarjeta no encontrada o inactiva"
      });
    }

    // Determinar tarifa según tipo de usuario
    let tarifa = 2.5; // Default adulto
    if (card.usuario_id && card.usuario_id.tipo_tarjeta) {
      switch (card.usuario_id.tipo_tarjeta) {
        case "estudiante":
        case "adulto_mayor":
          tarifa = 1.0;
          break;
        default:
          tarifa = 2.5;
      }
    }

    const saldo_anterior = Number(card.saldo_actual);

    // Verificar saldo suficiente
    if (saldo_anterior < tarifa) {
      // Registrar transacción fallida por saldo insuficiente
      const trans = await Transaction.create({
        tarjeta_uid: card.uid,
        monto: -tarifa,
        tipo: "viaje",
        validador_id,
        resultado: "saldo_insuficiente",
        metadata: { tipo_tarjeta: card.usuario_id?.tipo_tarjeta }
      });
      return res.status(400).json({
        success: false,
        error: "Saldo insuficiente",
        saldo_actual: saldo_anterior,
        tarifa_requerida: tarifa
      });
    }

    // Descontar tarifa y actualizar saldo
    card.saldo_actual = saldo_anterior - tarifa;
    await card.save();

    // Registrar transacción exitosa
    const trans = await Transaction.create({
      tarjeta_uid: card.uid,
      monto: -tarifa,
      tipo: "viaje",
      validador_id,
      resultado: "exitoso",
      metadata: { tipo_tarjeta: card.usuario_id?.tipo_tarjeta }
    });

    // Respuesta exitosa
    return res.status(200).json({
      success: true,
      saldo_anterior,
      saldo_actual: card.saldo_actual,
      tarifa
    });
  } catch (error) {
    console.error("Error en /validar:", error);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      details: error.message
    });
  }
});

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
