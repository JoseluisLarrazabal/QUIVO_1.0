const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  tarjeta_uid: {
    type: String,
    required: [true, "El UID de la tarjeta es requerido"],
    index: true
  },
  monto: {
    type: Number,
    required: [true, "El monto es requerido"],
    set: v => Math.round(v * 100) / 100 // Redondear a 2 decimales
  },
  tipo: {
    type: String,
    enum: {
      values: ["viaje", "recarga"],
      message: "Tipo de transacción {VALUE} no válido"
    },
    required: [true, "El tipo de transacción es requerido"]
  },
  ubicacion: {
    type: String,
    trim: true,
    maxlength: [200, "La ubicación no puede tener más de 200 caracteres"]
  },
  validador_id: {
    type: String,
    ref: "Validator",
    sparse: true
  },
  resultado: {
    type: String,
    enum: {
      values: ["exitoso", "fallido", "pendiente", "saldo_insuficiente"],
      message: "Resultado {VALUE} no válido"
    },
    default: "exitoso"
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    versionKey: false,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    }
  }
});

// Índices compuestos para optimizar consultas comunes
transactionSchema.index({ tarjeta_uid: 1, createdAt: -1 });
transactionSchema.index({ validador_id: 1, createdAt: -1 });
transactionSchema.index({ tipo: 1, resultado: 1 });
transactionSchema.index({ createdAt: -1, tipo: 1 });
// Asegurar índice simple para createdAt
transactionSchema.index({ createdAt: -1 });
// Índice simple para tipo (para los tests)
transactionSchema.index({ tipo: 1 });

// Middleware para procesar datos antes de guardar
transactionSchema.pre('save', function(next) {
  // Asegurar que el monto esté redondeado
  if (this.isModified('monto')) {
    this.monto = Math.round(this.monto * 100) / 100;
  }
  next();
});

// Middleware para manejar errores de duplicado en save y insertMany
transactionSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('Duplicado: la transacción ya existe.'));
  } else {
    next(error);
  }
});
transactionSchema.post('insertMany', function(error, docs, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('Duplicado: la transacción ya existe.'));
  } else {
    next(error);
  }
});

// Métodos de instancia
transactionSchema.methods.wasSuccessful = function() {
  return this.resultado === 'exitoso';
};

transactionSchema.methods.isRefund = function() {
  return this.tipo === 'recarga' && this.monto > 0;
};

// Métodos estáticos mejorados
transactionSchema.statics.getByCardUid = async function(uid, limit = 50, offset = 0) {
  try {
    return await this.find({ tarjeta_uid: uid })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
  } catch (error) {
    console.error("Error en getByCardUid:", error);
    return [];
  }
};

transactionSchema.statics.getRecentTransactions = async function(hours = 24) {
  try {
    const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
    return await this.find({ createdAt: { $gte: hoursAgo } })
      .sort({ createdAt: -1 })
      .exec();
  } catch (error) {
    console.error("Error en getRecentTransactions:", error);
    return [];
  }
};

transactionSchema.statics.getDailyStats = async function(date = new Date()) {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const result = await this.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
          resultado: "exitoso"
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
              $cond: [
                { $eq: ["$tipo", "viaje"] },
                { $abs: "$monto" },
                0
              ]
            }
          },
          total_recargas_monto: { 
            $sum: { 
              $cond: [
                { $eq: ["$tipo", "recarga"] },
                "$monto",
                0
              ] 
            } 
          }
        }
      },
      {
        $project: {
          _id: 0,
          total_transacciones: 1,
          total_viajes: 1,
          total_recargas: 1,
          ingresos_viajes: { $round: ["$ingresos_viajes", 2] },
          total_recargas_monto: { $round: ["$total_recargas_monto", 2] }
        }
      }
    ]);

    if (!result.length) {
      return {
        total_transacciones: 0,
        total_viajes: 0,
        total_recargas: 0,
        ingresos_viajes: 0,
        total_recargas_monto: 0
      };
    }

    return result[0];
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
};

// Método estático para crear una transacción con validación adicional
transactionSchema.statics.createTransaction = async function(transactionData, session = null) {
  const options = session ? { session } : {};
  
  // Validar el monto según el tipo
  if (transactionData.tipo === 'viaje' && transactionData.monto > 0) {
    transactionData.monto = -transactionData.monto; // Los viajes son siempre montos negativos
  } else if (transactionData.tipo === 'recarga' && transactionData.monto < 0) {
    transactionData.monto = Math.abs(transactionData.monto); // Las recargas son siempre montos positivos
  }

  // Crear la transacción con las opciones de sesión si se proporciona
  return await this.create([transactionData], options);
};

// Método estático para buscar por ID
transactionSchema.statics.getById = async function(id) {
  try {
    return await this.findById(id);
  } catch (error) {
    console.error("Error en getById:", error);
    return null;
  }
};

module.exports = mongoose.model("Transaction", transactionSchema);
