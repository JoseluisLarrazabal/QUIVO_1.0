const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

// Esquema de Usuario
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "El nombre de usuario es requerido"],
    trim: true,
    maxlength: [50, "El nombre de usuario no puede tener más de 50 caracteres"],
    unique: true
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
  apellido: {
    type: String,
    required: [true, "El apellido es requerido"],
    trim: true,
    maxlength: [100, "El apellido no puede tener más de 100 caracteres"]
  },
  email: {
    type: String,
    required: [true, "El email es requerido"],
    trim: true,
    lowercase: true,
    maxlength: [100, "El email no puede tener más de 100 caracteres"],
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un email válido']
  },
  telefono: {
    type: String,
    required: [true, "El teléfono es requerido"],
    trim: true,
    maxlength: [20, "El teléfono no puede tener más de 20 caracteres"]
  },
  // Campo opcional para compatibilidad con código existente
  tipo_tarjeta: {
    type: String,
    enum: ["estudiante", "adulto", "adulto_mayor", "discapacitado"],
    default: "adulto" // Valor por defecto para usuarios existentes
  },
  // Campos para recuperación de contraseña
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  // Campos para verificación de email
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  },
  // Campos para OAuth (futuro)
  oauthProvider: {
    type: String,
    enum: ["google", "facebook", "apple", null],
    default: null
  },
  oauthId: {
    type: String,
    default: null
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
userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ resetPasswordToken: 1 })
userSchema.index({ emailVerificationToken: 1 })
userSchema.index({ oauthProvider: 1, oauthId: 1 })

// Middleware para manejar errores de duplicado en save y insertMany
userSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    // Determinar qué campo está duplicado
    const field = Object.keys(error.keyPattern)[0];
    const message = field === 'username' 
      ? 'El nombre de usuario ya está en uso'
      : field === 'email'
      ? 'El email ya está registrado'
      : 'El registro ya existe';
    next(new Error(message));
  } else {
    next(error);
  }
});

userSchema.post('insertMany', function(error, docs, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    const message = field === 'username' 
      ? 'El nombre de usuario ya está en uso'
      : field === 'email'
      ? 'El email ya está registrado'
      : 'El registro ya existe';
    next(new Error(message));
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

// Virtual para nombre completo
userSchema.virtual("nombreCompleto").get(function() {
  return `${this.nombre} ${this.apellido}`.trim();
});

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

// Método para generar token de reset de contraseña
userSchema.methods.generatePasswordResetToken = function() {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutos
  
  return resetToken;
};

// Método para generar token de verificación de email
userSchema.methods.generateEmailVerificationToken = function() {
  const crypto = require('crypto');
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 horas
  
  return verificationToken;
};

// Método para limpiar tokens de reset
userSchema.methods.clearPasswordResetToken = function() {
  this.resetPasswordToken = null;
  this.resetPasswordExpires = null;
};

// Método para limpiar tokens de verificación
userSchema.methods.clearEmailVerificationToken = function() {
  this.emailVerificationToken = null;
  this.emailVerificationExpires = null;
};

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

userSchema.statics.findByEmail = async function(email, onlyActive = true) {
  try {
    const filter = onlyActive ? { email: email.toLowerCase(), activo: true } : { email: email.toLowerCase() };
    return await this.findOne(filter).exec();
  } catch (error) {
    console.error("Error en findByEmail:", error);
    return null;
  }
};

userSchema.statics.findByResetToken = async function(token) {
  try {
    const crypto = require('crypto');
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    return await this.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
      activo: true
    }).exec();
  } catch (error) {
    console.error("Error en findByResetToken:", error);
    return null;
  }
};

userSchema.statics.findByVerificationToken = async function(token) {
  try {
    const crypto = require('crypto');
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    return await this.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
      activo: true
    }).exec();
  } catch (error) {
    console.error("Error en findByVerificationToken:", error);
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
