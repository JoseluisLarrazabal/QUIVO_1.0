const mongoose = require("mongoose")

// Esquema de Usuario
const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, "El nombre es requerido"],
    trim: true,
    maxlength: [100, "El nombre no puede tener más de 100 caracteres"]
  },
  tipo_tarjeta: {
    type: String,
    enum: ["estudiante", "adulto", "adulto_mayor", "discapacitado"],
    required: [true, "El tipo de tarjeta es requerido"]
  },
  telefono: {
    type: String,
    trim: true,
    maxlength: [20, "El teléfono no puede tener más de 20 caracteres"]
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [100, "El email no puede tener más de 100 caracteres"]
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Índices para optimizar consultas
userSchema.index({ tipo_tarjeta: 1 })
userSchema.index({ activo: 1 })

// Virtual para obtener las tarjetas del usuario
userSchema.virtual("tarjetas", {
  ref: "Card",
  localField: "_id",
  foreignField: "usuario_id"
})

// Métodos estáticos
// Removemos este método estático que puede estar causando conflictos
// userSchema.statics.findById = async function(id) {
//   return await this.findById(id)
// }

userSchema.statics.findByCardUid = async function(uid) {
  return await this.aggregate([
    {
      $lookup: {
        from: "cards",
        localField: "_id",
        foreignField: "usuario_id",
        as: "tarjetas"
      }
    },
    {
      $unwind: "$tarjetas"
    },
    {
      $match: {
        "tarjetas.uid": uid,
        "tarjetas.activa": true
      }
    }
  ]).then(results => results[0])
}

// Removemos este método estático que puede estar causando conflictos
// userSchema.statics.create = async function(userData) {
//   const user = new this(userData)
//   return await user.save()
// }

userSchema.statics.update = async function(id, userData) {
  return await this.findByIdAndUpdate(
    id,
    { ...userData, updatedAt: new Date() },
    { new: true, runValidators: true }
  )
}

userSchema.statics.delete = async function(id) {
  return await this.findByIdAndUpdate(
    id,
    { activo: false },
    { new: true }
  )
}

module.exports = mongoose.model("User", userSchema)