const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

// Esquema de Usuario
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "El nombre de usuario es requerido"],
    unique: true,
    trim: true,
    maxlength: [50, "El nombre de usuario no puede tener más de 50 caracteres"]
  },
  password: {
    type: String,
    required: [true, "La contraseña es requerida"],
    minlength: [6, "La contraseña debe tener al menos 6 caracteres"]
  },
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
userSchema.index({ username: 1 })
userSchema.index({ tipo_tarjeta: 1 })
userSchema.index({ activo: 1 })

// Virtual para obtener las tarjetas del usuario
userSchema.virtual("tarjetas", {
  ref: "Card",
  localField: "_id",
  foreignField: "usuario_id"
})

// Método para encriptar contraseña antes de guardar
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next()
  
  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Métodos estáticos
userSchema.statics.findByUsername = async function(username) {
  return await this.findOne({ username, activo: true })
}

userSchema.statics.authenticate = async function(username, password) {
  const user = await this.findOne({ username, activo: true })
  if (!user) {
    return null
  }
  
  const isMatch = await user.comparePassword(password)
  return isMatch ? user : null
}

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
