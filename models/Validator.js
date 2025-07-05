const mongoose = require("mongoose")

const validatorSchema = new mongoose.Schema({
  id_validador: {
    type: String,
    required: [true, "El ID del validador es requerido"],
    unique: true,
    trim: true,
    maxlength: [50, "El ID del validador no puede tener más de 50 caracteres"]
  },
  bus_id: {
    type: String,
    trim: true,
    maxlength: [50, "El ID del bus no puede tener más de 50 caracteres"]
  },
  ubicacion: {
    type: String,
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
    enum: ["activo", "inactivo", "mantenimiento"],
    default: "activo"
  }
}, {
  timestamps: true
})

validatorSchema.index({ id_validador: 1 })
validatorSchema.index({ estado: 1 })
validatorSchema.index({ ubicacion: 1 })

// Removemos estos métodos estáticos que pueden estar causando conflictos
// validatorSchema.statics.findById = async function(id) {
//   return await this.findOne({ id_validador: id })
// }

// validatorSchema.statics.create = async function(validatorData) {
//   const validator = new this(validatorData)
//   return await validator.save()
// }

validatorSchema.statics.updateStatus = async function(id, estado) {
  return await this.findOneAndUpdate(
    { id_validador: id },
    { estado, updatedAt: new Date() },
    { new: true }
  )
}

validatorSchema.statics.getAll = async function() {
  return await this.find().sort({ createdAt: -1 })
}

validatorSchema.statics.getActiveValidators = async function() {
  return await this.find({ estado: "activo" }).sort({ ubicacion: 1 })
}

module.exports = mongoose.model("Validator", validatorSchema)