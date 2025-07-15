const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

// Esquema de Usuario
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "El nombre de usuario es requerido"],
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
userSchema.index({ tipo_tarjeta: 1 })
userSchema.index({ activo: 1 })
userSchema.index({ username: 1 }, { unique: true })

// Middleware para manejar errores de duplicado en save y insertMany
userSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('Duplicado: el nombre de usuario ya existe.'));
  } else {
    next(error);
  }
});
userSchema.post('insertMany', function(error, docs, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('Duplicado: el nombre de usuario ya existe.'));
  } else {
    next(error);
  }
});

// Virtual para obtener las tarjetas del usuario
userSchema.virtual("tarjetas", {
  ref: "Card",
  localField: "_id",
  foreignField: "usuario_id",
  justOne: false
})

// Configurar virtuals para que se incluyan en JSON
userSchema.set('toJSON', { virtuals: true })
userSchema.set('toObject', { virtuals: true })

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
userSchema.statics.findByUsername = async function(username, onlyActive = true) {
  try {
    // Buscar usuario por username, por defecto solo activos
    const filter = onlyActive ? { username, activo: true } : { username };
    return await this.findOne(filter).exec();
  } catch (error) {
    console.error("Error en findByUsername:", error);
    return null;
  }
};

userSchema.statics.authenticate = async function(username, password) {
  try {
    const user = await this.findOne({ username, activo: true }).exec();
    if (!user) {
      return null;
    }
    const isMatch = await user.comparePassword(password);
    return isMatch ? user : null;
  } catch (error) {
    console.error("Error en authenticate:", error);
    return null;
  }
};

userSchema.statics.findByCardUid = async function(uid) {
  try {
    // Buscar la tarjeta y poblar el usuario
    const card = await mongoose.model('Card').findOne({ uid, activa: true });
    if (!card) return null;
    const user = await this.findById(card.usuario_id);
    return user;
  } catch (error) {
    console.error("Error en findByCardUid:", error);
    return null;
  }
};

userSchema.statics.update = async function(id, userData) {
  try {
    return await this.findByIdAndUpdate(
      id,
      { ...userData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).exec();
  } catch (error) {
    console.error("Error en update:", error);
    return null;
  }
};

userSchema.statics.delete = async function(id) {
  try {
    return await this.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true }
    )
  } catch (error) {
    console.error("Error en delete:", error)
    return null
  }
}

module.exports = mongoose.model("User", userSchema)
