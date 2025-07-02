const mongoose = require("mongoose")

const cardSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: [true, "El UID de la tarjeta es requerido"],
    unique: true,
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

cardSchema.index({ uid: 1 })
cardSchema.index({ usuario_id: 1 })
cardSchema.index({ activa: 1 })

cardSchema.statics.findByUid = async function(uid) {
  return await this.findOne({ uid, activa: true }).populate("usuario_id", "nombre tipo_tarjeta")
}

cardSchema.statics.create = async function(cardData) {
  const card = new this(cardData)
  return await card.save()
}

cardSchema.statics.updateBalance = async function(uid, newBalance) {
  return await this.findOneAndUpdate(
    { uid, activa: true },
    { saldo_actual: newBalance },
    { new: true }
  )
}

cardSchema.statics.getBalance = async function(uid) {
  const card = await this.findOne({ uid, activa: true })
  return card ? card.saldo_actual : 0
}

cardSchema.statics.deactivate = async function(uid) {
  return await this.findOneAndUpdate(
    { uid },
    { activa: false },
    { new: true }
  )
}

cardSchema.statics.getAllCards = async function(limit = 50, offset = 0) {
  return await this.find({ activa: true })
    .populate("usuario_id", "nombre tipo_tarjeta")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset)
}

module.exports = mongoose.model("Card", cardSchema)
