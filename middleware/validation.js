const validateUid = (req, res, next) => {
  const { uid } = req.params

  if (!uid || uid.length < 4) {
    return res.status(400).json({
      success: false,
      error: "UID inválido",
    })
  }

  next()
}

const validateAmount = (req, res, next) => {
  const { monto } = req.body

  if (!monto || isNaN(monto) || Number.parseFloat(monto) <= 0) {
    return res.status(400).json({
      success: false,
      error: "Monto inválido",
    })
  }

  next()
}

const validateCardType = (req, res, next) => {
  const { tipo_tarjeta } = req.body
  const validTypes = ["adulto", "estudiante", "adulto_mayor"]

  if (!tipo_tarjeta || !validTypes.includes(tipo_tarjeta)) {
    return res.status(400).json({
      success: false,
      error: "Tipo de tarjeta inválido",
    })
  }

  next()
}

module.exports = {
  validateUid,
  validateAmount,
  validateCardType,
}
