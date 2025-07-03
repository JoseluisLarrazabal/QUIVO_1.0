const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const morgan = require("morgan")
require("dotenv").config()

const { connectDB } = require("./config/database")
const authRoutes = require("./routes/auth")
const cardRoutes = require("./routes/cards")
const transactionRoutes = require("./routes/transactions")
const validatorRoutes = require("./routes/validators")
const adminRoutes = require("./routes/admin")

const app = express()
const PORT = process.env.PORT || 3000

// Middleware de seguridad
app.use(helmet())
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000", 
      "http://localhost:19006",
      "http://192.168.0.5:3000",
      "http://192.168.0.5:19006",
      "exp://192.168.0.5:19000"
    ],
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana de tiempo
  message: "Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.",
})
app.use("/api/", limiter)

// Middleware de parsing
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Logging
app.use(morgan("combined"))

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// Rutas de la API
app.use("/api/auth", authRoutes)
app.use("/api", cardRoutes)
app.use("/api", transactionRoutes)
app.use("/api", validatorRoutes)
app.use("/api/admin", adminRoutes)

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error("Error:", err)

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "JSON inválido" })
  }

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production" ? "Error interno del servidor" : err.message,
  })
})

// Ruta 404
app.use("*", (req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" })
})

// Inicializar servidor
const startServer = async () => {
  try {
    // Conectar a MongoDB Atlas
    await connectDB()
    console.log("✅ Conexión a MongoDB Atlas establecida")

    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`)
      console.log(`📱 API disponible en http://localhost:${PORT}/api`)
      console.log(`🏥 Health check en http://localhost:${PORT}/health`)
    })
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error)
    process.exit(1)
  }
}

startServer()

// Manejo de cierre graceful
process.on("SIGTERM", () => {
  console.log("🛑 Cerrando servidor...")
  process.exit(0)
})

process.on("SIGINT", () => {
  console.log("🛑 Cerrando servidor...")
  process.exit(0)
})
