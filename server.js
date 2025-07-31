const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const morgan = require("morgan")
require("dotenv").config()
const os = require('os');

// Importar sistema de logs y métricas
const { logger, requestLogger } = require('./config/logger');
const { metricsMiddleware, metricsEndpoint, recordRateLimitMetric } = require('./config/metrics');

const { connectDB } = require("./config/database")
const authRoutes = require("./routes/auth")
const cardRoutes = require("./routes/cards")
const transactionRoutes = require("./routes/transactions")
const validatorRoutes = require("./routes/validators")
const adminRoutes = require("./routes/admin")
const monitoringRoutes = require("./routes/monitoring")

const app = express()
const PORT = process.env.PORT || 3000

// Configuración obligatoria para Render.com y proxies
app.set('trust proxy', true); // 👈 Esto es obligatorio en Render

// Middleware de seguridad
app.use(helmet())
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000", 
      "http://localhost:19006",
      "http://192.168.0.5:3000",
      "http://192.168.0.5:19006",
      "exp://192.168.0.5:19000",
      "https://quivo-backend-3vhv.onrender.com",
      "*" // Permitir todas las conexiones para APK standalone
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
    // Registrar métrica de rate limiting
    recordRateLimitMetric(req.ip, req.path);
    
    res.status(429).json({
      success: false,
      error: "Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.",
      code: "RATE_LIMIT_EXCEEDED"
    });
  }
}

const limiter = rateLimit(rateLimitConfig)
app.use("/api/", limiter)

// Middleware de métricas (debe ir antes de las rutas)
app.use(metricsMiddleware);

// Middleware de parsing
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Logging estructurado con Winston
app.use(requestLogger);

// Logging básico con Morgan (mantener para compatibilidad)
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
app.use("/api/monitoring", monitoringRoutes)

// Endpoint de métricas Prometheus
app.get("/metrics", metricsEndpoint)

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  // Log estructurado del error
  logger.error('Error no manejado', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id || 'anonymous'
  });

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

    // Logs de depuración
    console.log("Antes de app.listen");
    app.listen(PORT, '0.0.0.0', () => {
      console.log("Dentro de callback de app.listen");
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
      
      // Log estructurado del inicio del servidor
      logger.info('Servidor iniciado exitosamente', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        localIp
      });
      
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`📱 API disponible en http://${localIp}:${PORT}/api`);
      console.log(`🏥 Health check en http://${localIp}:${PORT}/health`);
      console.log(`📊 Métricas en http://${localIp}:${PORT}/metrics`);
      console.log(`📈 Dashboard en http://${localIp}:${PORT}/api/monitoring/dashboard`);
    })
    console.log("Después de app.listen");
  } catch (error) {
    logger.error('Error al iniciar el servidor', {
      error: error.message,
      stack: error.stack
    });
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
