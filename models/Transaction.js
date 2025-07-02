const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema({
  tarjeta_uid: {
    type: String,
    required: [true, "El UID de la tarjeta es requerido"],
    ref: "Card"
  },
  monto: {
    type: Number,
    required: [true, "El monto es requerido"]
  },
  tipo: {
    type: String,
    enum: ["viaje", "recarga"],
    required: [true, "El tipo de transacción es requerido"]
  },
  ubicacion: {
    type: String,
    trim: true,
    maxlength: [200, "La ubicación no puede tener más de 200 caracteres"]
  },
  validador_id: {
    type: String,
    ref: "Validator"
  },
  resultado: {
    type: String,
    enum: ["exitoso", "fallido", "pendiente"],
    default: "exitoso"
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
})

transactionSchema.index({ tarjeta_uid: 1 })
transactionSchema.index({ createdAt: -1 })
transactionSchema.index({ validador_id: 1 })
transactionSchema.index({ tipo: 1 })

transactionSchema.statics.create = async function(transactionData) {
  const transaction = new this(transactionData)
  return await transaction.save()
}

transactionSchema.statics.getByCardUid = async function(uid, limit = 50, offset = 0) {
  return await this.find({ tarjeta_uid: uid })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset)
}

transactionSchema.statics.getById = async function(id) {
  return await this.findById(id)
}

transactionSchema.statics.getRecentTransactions = async function(hours = 24) {
  const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000)
  
  return await this.aggregate([
    {
      $match: {
        createdAt: { $gte: hoursAgo }
      }
    },
    {
      $lookup: {
        from: "cards",
        localField: "tarjeta_uid",
        foreignField: "uid",
        as: "tarjeta"
      }
    },
    {
      $unwind: "$tarjeta"
    },
    {
      $lookup: {
        from: "users",
        localField: "tarjeta.usuario_id",
        foreignField: "_id",
        as: "usuario"
      }
    },
    {
      $unwind: "$usuario"
    },
    {
      $project: {
        _id: 1,
        tarjeta_uid: 1,
        monto: 1,
        tipo: 1,
        ubicacion: 1,
        validador_id: 1,
        resultado: 1,
        createdAt: 1,
        "usuario.nombre": 1,
        "usuario.tipo_tarjeta": 1
      }
    },
    {
      $sort: { createdAt: -1 }
    }
  ])
}

transactionSchema.statics.getDailyStats = async function(date = new Date()) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)
  
  return await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      }
    },
    {
      $group: {
        _id: null,
        total_transacciones: { $sum: 1 },
        total_viajes: {
          $sum: { $cond: [{ $eq: ["$tipo", "viaje"] }, 1, 0] }
        },
        total_recargas: {
          $sum: { $cond: [{ $eq: ["$tipo", "recarga"] }, 1, 0] }
        },
        ingresos_viajes: {
          $sum: { $cond: [{ $eq: ["$tipo", "viaje"] }, { $abs: "$monto" }, 0] }
        },
        total_recargas_monto: {
          $sum: { $cond: [{ $eq: ["$tipo", "recarga"] }, "$monto", 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        total_transacciones: 1,
        total_viajes: 1,
        total_recargas: 1,
        ingresos_viajes: 1,
        total_recargas_monto: 1
      }
    }
  ]).then(results => results[0] || {
    total_transacciones: 0,
    total_viajes: 0,
    total_recargas: 0,
    ingresos_viajes: 0,
    total_recargas_monto: 0
  })
}

module.exports = mongoose.model("Transaction", transactionSchema)
