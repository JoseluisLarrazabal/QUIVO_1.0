const mongoose = require("mongoose")

const cardSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: [true, "El UID de la tarjeta es requerido"],
    trim: true,
    maxlength: [50, "El UID no puede tener más de 50 caracteres"]
  },
  usuario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "El usuario es requerido"]
  },
  saldo_actual: {
    type: Number,
    default: 0.00,
    min: [0, "El saldo no puede ser negativo"]
  },
  activa: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Índices para optimizar consultas
cardSchema.index({ usuario_id: 1 })
cardSchema.index({ activa: 1 })
cardSchema.index({ uid: 1 }, { unique: true })

// Configurar antes de compilar el modelo
cardSchema.set('toJSON', {
  virtuals: true,
  versionKey: false
})

// Método estático para buscar tarjeta por UID
cardSchema.statics.findByUid = async function(uid) {
  try {
    const card = await this.findOne({ uid, activa: true })
      .populate("usuario_id", "nombre tipo_tarjeta email telefono")
      .lean()
      .exec();
    return card;
  } catch (error) {
    console.error("Error en findByUid:", error);
    return null;
  }
}

cardSchema.statics.updateBalance = async function(uid, newBalance) {
  try {
    const card = await this.findOneAndUpdate(
      { uid, activa: true },
      { $set: { saldo_actual: newBalance } },
      { 
        new: true,
        runValidators: true,
      }
    ).populate("usuario_id", "nombre tipo_tarjeta email telefono");
    return card;
  } catch (error) {
    console.error("Error en updateBalance:", error);
    return null;
  }
}

cardSchema.statics.getBalance = async function(uid) {
  try {
    const card = await this.findOne({ uid, activa: true })
      .select('saldo_actual')
      .lean()
      .exec();
    return card ? card.saldo_actual : 0;
  } catch (error) {
    console.error("Error en getBalance:", error);
    return 0;
  }
}

cardSchema.statics.deactivate = async function(uid) {
  try {
    const card = await this.findOneAndUpdate(
      { uid, activa: true },
      { activa: false },
      { 
        new: true,
        runValidators: true 
      }
    ).populate("usuario_id", "nombre tipo_tarjeta email telefono");
    return card;
  } catch (error) {
    console.error("Error en deactivate:", error);
    return null;
  }
}

cardSchema.statics.getAllCards = async function(limit = 50, offset = 0) {
  try {
    const cards = await this.find({ activa: true })
      .populate("usuario_id", "nombre tipo_tarjeta email telefono")
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean()
      .exec();
    return cards;
  } catch (error) {
    console.error("Error en getAllCards:", error);
    return [];
  }
}

const Card = mongoose.model("Card", cardSchema);

module.exports = Card;
