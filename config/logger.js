const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Crear directorio de logs si no existe
const fs = require('fs');
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Formato personalizado para logs
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // Agregar metadata si existe
    if (Object.keys(meta).length > 0) {
      log += ` | ${JSON.stringify(meta)}`;
    }
    
    return log;
  })
);

// Configuración de rotación de archivos
const fileRotateTransport = new DailyRotateFile({
  filename: path.join(logDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d', // Mantener logs por 14 días
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
});

// Configuración de error logs
const errorFileRotateTransport = new DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d', // Mantener errores por 30 días
  level: 'error'
});

// Configuración de auth logs
const authFileRotateTransport = new DailyRotateFile({
  filename: path.join(logDir, 'auth-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '90d', // Mantener logs de auth por 90 días
  level: 'info'
});

// Crear logger principal
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { 
    service: 'nfc-transport-api',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Console transport para desarrollo
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ] : []),
    
    // File transports
    fileRotateTransport,
    errorFileRotateTransport
  ],
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'exceptions.log') 
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'rejections.log') 
    })
  ]
});

// Logger específico para autenticación
const authLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { 
    service: 'nfc-transport-auth',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    authFileRotateTransport,
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ] : [])
  ]
});

// Logger específico para transacciones
const transactionLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { 
    service: 'nfc-transport-transactions',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    new DailyRotateFile({
      filename: path.join(logDir, 'transactions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '60d'
    }),
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ] : [])
  ]
});

// Logger específico para rate limiting
const rateLimitLogger = winston.createLogger({
  level: 'warn',
  format: logFormat,
  defaultMeta: { 
    service: 'nfc-transport-rate-limit',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    new DailyRotateFile({
      filename: path.join(logDir, 'rate-limit-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '10m',
      maxFiles: '30d'
    }),
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ] : [])
  ]
});

// Middleware para logging de requests
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log al inicio de la request
  logger.info('Request iniciada', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous'
  });

  // Interceptar el final de la response
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('Request completada', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userId: req.user?.id || 'anonymous'
    });
  });

  next();
};

// Función para limpiar logs antiguos (ejecutar diariamente)
const cleanupOldLogs = () => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const logDir = path.join(__dirname, '..', 'logs');
    const files = fs.readdirSync(logDir);
    const now = Date.now();
    const maxAge = 90 * 24 * 60 * 60 * 1000; // 90 días
    
    files.forEach(file => {
      const filePath = path.join(logDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
        logger.info(`Log antiguo eliminado: ${file}`);
      }
    });
  } catch (error) {
    logger.error('Error limpiando logs antiguos', { error: error.message });
  }
};

module.exports = {
  logger,
  authLogger,
  transactionLogger,
  rateLimitLogger,
  requestLogger,
  cleanupOldLogs
}; 