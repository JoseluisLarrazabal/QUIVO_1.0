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
    enum: ["exitoso", "fallido", "pendiente", "saldo_insuficiente"],
    default: "exitoso"
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
})

// Índices para optimizar consultas
transactionSchema.index({ tarjeta_uid: 1 })
transactionSchema.index({ createdAt: -1 })
transactionSchema.index({ validador_id: 1 })
transactionSchema.index({ tipo: 1 })

// Configurar antes de compilar el modelo
transactionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false
})

// Resto de los métodos estáticos
transactionSchema.statics.getByCardUid = async function(uid, limit = 50, offset = 0) {
  try {
    const transactions = await this.find({ tarjeta_uid: uid })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .exec();
    return transactions || [];
  } catch (error) {
    console.error("Error en getByCardUid:", error);
    return [];
  }
}

transactionSchema.statics.getById = async function(id) {
  try {
    const transaction = await this.findById(id).exec();
    return transaction || null;
  } catch (error) {
    console.error("Error en getById:", error);
    return null;
  }
}

transactionSchema.statics.getRecentTransactions = async function(hours = 24) {
  try {
    const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000)
    return await this.aggregate([
      { $match: { createdAt: { $gte: hoursAgo } } },
      { $lookup: { from: "cards", localField: "tarjeta_uid", foreignField: "uid", as: "tarjeta" } },
      { $unwind: { path: "$tarjeta", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "users", localField: "tarjeta.usuario_id", foreignField: "_id", as: "usuario" } },
      { $unwind: { path: "$usuario", preserveNullAndEmptyArrays: true } },
      { $project: {
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
      } },
      { $sort: { createdAt: -1 } }
    ])
  } catch (error) {
    console.error("Error en getRecentTransactions:", error);
    return [];
  }
}

transactionSchema.statics.getDailyStats = async function(date = new Date()) {
  try {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    
    const result = await this.aggregate([
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
            $sum: { 
              $cond: [{ $eq: ["$tipo", "viaje"] }, 1, 0] 
            } 
          },
          total_recargas: { 
            $sum: { 
              $cond: [{ $eq: ["$tipo", "recarga"] }, 1, 0] 
            } 
          },
          ingresos_viajes: {
            $sum: {
              $cond: [{ $eq: ["$tipo", "viaje"] }, { $abs: "$monto" }, 0]
            }
          },
          total_recargas_monto: { 
            $sum: { 
              $cond: [{ $eq: ["$tipo", "recarga"] }, "$monto", 0] 
            } 
          }
        }
      }
    ])

    if (!result.length) {
      return {
        total_transacciones: 0,
        total_viajes: 0,
        total_recargas: 0,
        ingresos_viajes: 0,
        total_recargas_monto: 0
      }
    }

    return result[0]
  } catch (error) {
    console.error("Error en getDailyStats:", error);
    return {
      total_transacciones: 0,
      total_viajes: 0,
      total_recargas: 0,
      ingresos_viajes: 0,
      total_recargas_monto: 0
    };
  }
}

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
