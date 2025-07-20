const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const morgan = require("morgan")
require("dotenv").config()
const os = require('os');

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

// Rate limiting configurado por entorno
const rateLimitConfig = {
  windowMs: process.env.NODE_ENV === 'test' 
    ? 1 * 60 * 1000  // 1 minuto en test para que se resetee más rápido
    : 15 * 60 * 1000, // 15 minutos en producción
  max: process.env.NODE_ENV === 'test' 
    ? parseInt(process.env.TEST_RATE_LIMIT_MAX) || 100  // 100 requests en test por defecto
    : parseInt(process.env.RATE_LIMIT_MAX) || 100,      // 100 requests en producción por defecto
  message: "Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.",
  standardHeaders: true, // Incluir headers X-RateLimit-*
  legacyHeaders: false,  // No incluir headers legacy
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: "Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.",
      code: "RATE_LIMIT_EXCEEDED"
    });
  }
}

const limiter = rateLimit(rateLimitConfig)
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

    app.listen(PORT, '0.0.0.0', () => {
      // Detectar IP local para mostrar en el log
      const interfaces = os.networkInterfaces();
      let localIp = 'localhost';
      for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
          if (iface.family === 'IPv4' && !iface.internal) {
            localIp = iface.address;
            break;
          }
        }
      }
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`📱 API disponible en http://${localIp}:${PORT}/api`);
      console.log(`🏥 Health check en http://${localIp}:${PORT}/health`);
    })
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error)
    process.exit(1)
  }
}

// Solo iniciar el servidor si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  startServer()
}

// Manejo de cierre graceful
process.on("SIGTERM", () => {
  console.log("🛑 Cerrando servidor...")
  process.exit(0)
})

process.on("SIGINT", () => {
  console.log("🛑 Cerrando servidor...")
  process.exit(0)
})

// Exportar la aplicación para tests
module.exports = app
