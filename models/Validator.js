const mongoose = require("mongoose");

const validatorSchema = new mongoose.Schema({
  id_validador: {
    type: String,
    required: [true, "El ID del validador es requerido"],
    trim: true,
    maxlength: [50, "El ID del validador no puede tener más de 50 caracteres"],
    unique: true,
    index: true
  },
  bus_id: {
    type: String,
    required: [true, "El ID del bus es requerido"],
    trim: true,
    maxlength: [50, "El ID del bus no puede tener más de 50 caracteres"]
  },
  ubicacion: {
    type: String,
    required: [true, "La ubicación es requerida"],
    trim: true,
    maxlength: [200, "La ubicación no puede tener más de 200 caracteres"]
  },
  operador: {
    type: String,
    trim: true,
    maxlength: [100, "El operador no puede tener más de 100 caracteres"]
  },
  estado: {
    type: String,
    enum: {
      values: ["activo", "inactivo", "mantenimiento"],
      message: "Estado {VALUE} no válido"
    },
    default: "activo",
    required: true
  },
  ultima_validacion: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices compuestos para optimizar consultas comunes
validatorSchema.index({ estado: 1, ubicacion: 1 });
validatorSchema.index({ bus_id: 1, estado: 1 });

// Middleware para actualizar ultima_validacion
validatorSchema.pre('save', function(next) {
  if (this.isNew && !this.ultima_validacion) {
    this.ultima_validacion = new Date();
  }
  next();
});

// Métodos de instancia
validatorSchema.methods.isActive = function() {
  return this.estado === 'activo';
};

validatorSchema.methods.updateLastValidation = async function() {
  this.ultima_validacion = new Date();
  return await this.save();
};

// Métodos estáticos
validatorSchema.statics.findByValidatorId = async function(id) {
  return await this.findOne({ id_validador: id });
};

validatorSchema.statics.updateStatus = async function(id, estado) {
  return await this.findOneAndUpdate(
    { id_validador: id },
    { 
      estado,
      updatedAt: new Date()
    },
    { 
      new: true,
      runValidators: true
    }
  );
};

validatorSchema.statics.getActiveValidators = async function() {
  return await this.find({ 
    estado: "activo" 
  })
  .select('id_validador bus_id ubicacion ultima_validacion')
  .sort({ ubicacion: 1 });
};

validatorSchema.statics.getValidatorsByBus = async function(busId) {
  return await this.find({ 
    bus_id: busId
  })
  .sort({ ubicacion: 1 });
};

// Virtual para calcular tiempo desde última validación
validatorSchema.virtual('tiempoUltimaValidacion').get(function() {
  if (!this.ultima_validacion) return null;
  return Math.floor((Date.now() - this.ultima_validacion) / 1000); // en segundos
});

module.exports = mongoose.model("Validator", validatorSchema);
