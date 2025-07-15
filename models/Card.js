const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: [true, "El UID de la tarjeta es requerido"],
    trim: true,
    maxlength: [50, "El UID no puede tener más de 50 caracteres"],
    unique: true,
    index: true
  },
  usuario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "El usuario es requerido"],
    index: true
  },
  saldo_actual: {
    type: Number,
    default: 0.00,
    min: [0, "El saldo no puede ser negativo"],
    set: v => Math.round(v * 100) / 100, // Redondear a 2 decimales
    validate: {
      validator: function(value) {
        return value >= 0;
      },
      message: "El saldo no puede ser negativo"
    }
  },
  activa: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Índices compuestos para optimizar consultas comunes
cardSchema.index({ uid: 1, activa: 1 });
cardSchema.index({ usuario_id: 1, activa: 1 });

// Middleware para procesar datos antes de guardar
cardSchema.pre('save', function(next) {
  if (this.isModified('saldo_actual')) {
    this.saldo_actual = Math.round(this.saldo_actual * 100) / 100;
  }
  next();
});

// Middleware para manejar errores de duplicado en save y insertMany
cardSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('Duplicado: el UID de la tarjeta ya existe.'));
  } else {
    next(error);
  }
});
cardSchema.post('insertMany', function(error, docs, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('Duplicado: el UID de la tarjeta ya existe.'));
  } else {
    next(error);
  }
});

// Middleware para manejo de errores en actualizaciones
cardSchema.post('findOneAndUpdate', function(error, doc, next) {
  if (error.name === 'ValidationError') {
    next(new Error('Error de validación al actualizar tarjeta'));
  } else {
    next(error);
  }
});

// Métodos de instancia
cardSchema.methods.hasEnoughBalance = function(amount) {
  return this.saldo_actual >= amount;
};

cardSchema.methods.addBalance = async function(amount) {
  this.saldo_actual += Math.round(amount * 100) / 100;
  return await this.save();
};

cardSchema.methods.deductBalance = async function(amount) {
  if (!this.hasEnoughBalance(amount)) {
    throw new Error('Saldo insuficiente');
  }
  this.saldo_actual -= Math.round(amount * 100) / 100;
  return await this.save();
};

// Métodos estáticos mejorados
cardSchema.statics.findByUid = async function(uid) {
  try {
    // Buscar solo tarjetas activas
    const card = await this.findOne({ uid, activa: true })
      .populate("usuario_id", "nombre tipo_tarjeta email telefono");
    return card;
  } catch (error) {
    console.error("Error en findByUid:", error);
    return null;
  }
};

cardSchema.statics.updateBalance = async function(uid, newBalance, session = null) {
  if (newBalance < 0) {
    throw new Error("El saldo no puede ser negativo");
  }
  const options = session ? { session, new: true } : { new: true };
  try {
    const card = await this.findOneAndUpdate(
      { uid },
      { saldo_actual: Math.round(newBalance * 100) / 100 },
      { ...options, runValidators: true }
    ).populate("usuario_id", "nombre tipo_tarjeta email telefono");
    if (!card) {
      throw new Error("Tarjeta no encontrada");
    }
    return card;
  } catch (error) {
    console.error("Error en updateBalance:", error);
    throw error;
  }
};

cardSchema.statics.getBalance = async function(uid) {
  try {
    const card = await this.findOne({ uid })
      .select('saldo_actual')
      .lean();
    return card ? Math.round(card.saldo_actual * 100) / 100 : 0;
  } catch (error) {
    console.error("Error en getBalance:", error);
    return 0;
  }
};

cardSchema.statics.deactivate = async function(uid) {
  try {
    const card = await this.findOneAndUpdate(
      { uid },
      { activa: false },
      { new: true, runValidators: true }
    ).populate("usuario_id", "nombre tipo_tarjeta email telefono");
    if (!card) {
      throw new Error("Tarjeta no encontrada");
    }
    return card;
  } catch (error) {
    console.error("Error en deactivate:", error);
    throw error;
  }
};

cardSchema.statics.getAllCards = async function(limit = 50, offset = 0, activeOnly = true) {
  try {
    const query = activeOnly ? { activa: true } : {};
    const cards = await this.find(query)
      .populate("usuario_id", "nombre tipo_tarjeta email telefono")
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();
    return cards;
  } catch (error) {
    console.error("Error en getAllCards:", error);
    return [];
  }
};

const Card = mongoose.model("Card", cardSchema);

module.exports = Card;
