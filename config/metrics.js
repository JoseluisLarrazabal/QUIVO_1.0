const promClient = require('prom-client');
const { logger } = require('./logger');

// Crear registro de métricas
const register = new promClient.Registry();

// Agregar métricas por defecto de Node.js
promClient.collectDefaultMetrics({ register });

// Métricas personalizadas para la aplicación

// Contador de requests HTTP
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total de requests HTTP',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Histograma de duración de requests
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duración de requests HTTP en segundos',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register]
});

// Contador de autenticaciones exitosas
const authSuccessTotal = new promClient.Counter({
  name: 'auth_success_total',
  help: 'Total de autenticaciones exitosas',
  labelNames: ['method'], // 'credentials', 'card'
  registers: [register]
});

// Contador de autenticaciones fallidas
const authFailureTotal = new promClient.Counter({
  name: 'auth_failure_total',
  help: 'Total de autenticaciones fallidas',
  labelNames: ['method', 'reason'], // 'credentials', 'card' | 'invalid_password', 'user_not_found', etc.
  registers: [register]
});

// Contador de tokens JWT generados
const jwtTokensGenerated = new promClient.Counter({
  name: 'jwt_tokens_generated_total',
  help: 'Total de tokens JWT generados',
  labelNames: ['type'], // 'access', 'refresh'
  registers: [register]
});

// Contador de tokens JWT expirados
const jwtTokensExpired = new promClient.Counter({
  name: 'jwt_tokens_expired_total',
  help: 'Total de tokens JWT expirados',
  labelNames: ['type'], // 'access', 'refresh'
  registers: [register]
});

// Contador de refresh tokens
const jwtRefreshTotal = new promClient.Counter({
  name: 'jwt_refresh_total',
  help: 'Total de refresh tokens procesados',
  labelNames: ['status'], // 'success', 'failed'
  registers: [register]
});

// Contador de transacciones
const transactionsTotal = new promClient.Counter({
  name: 'transactions_total',
  help: 'Total de transacciones procesadas',
  labelNames: ['type', 'status'], // 'validation', 'recharge' | 'success', 'failed'
  registers: [register]
});

// Contador de rate limiting
const rateLimitHits = new promClient.Counter({
  name: 'rate_limit_hits_total',
  help: 'Total de hits de rate limiting',
  labelNames: ['ip', 'route'],
  registers: [register]
});

// Gauge de usuarios activos (sesiones)
const activeUsers = new promClient.Gauge({
  name: 'active_users_total',
  help: 'Total de usuarios activos',
  registers: [register]
});

// Gauge de tarjetas activas
const activeCards = new promClient.Gauge({
  name: 'active_cards_total',
  help: 'Total de tarjetas activas',
  registers: [register]
});

// Histograma de saldos de tarjetas
const cardBalanceHistogram = new promClient.Histogram({
  name: 'card_balance_bs',
  help: 'Distribución de saldos de tarjetas en Bolivianos',
  buckets: [0, 5, 10, 25, 50, 100, 200, 500],
  registers: [register]
});

// Contador de errores por tipo
const errorsTotal = new promClient.Counter({
  name: 'errors_total',
  help: 'Total de errores por tipo',
  labelNames: ['type', 'code'], // 'validation', 'auth', 'database' | 'TOKEN_EXPIRED', etc.
  registers: [register]
});

// Métricas de base de datos
const dbQueryDuration = new promClient.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duración de queries de base de datos',
  labelNames: ['operation', 'collection'], // 'find', 'insert', 'update' | 'users', 'cards', etc.
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register]
});

// Middleware para capturar métricas automáticamente
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Incrementar contador de requests
  httpRequestsTotal.inc({
    method: req.method,
    route: req.route?.path || req.path,
    status_code: res.statusCode
  });
  
  // Capturar duración al final de la request
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000; // Convertir a segundos
    
    httpRequestDuration.observe({
      method: req.method,
      route: req.route?.path || req.path
    }, duration);
  });
  
  next();
};

// Función para registrar métricas de autenticación
const recordAuthMetric = (method, success, reason = null) => {
  if (success) {
    authSuccessTotal.inc({ method });
    logger.info('Autenticación exitosa registrada', { method });
  } else {
    authFailureTotal.inc({ method, reason });
    logger.warn('Autenticación fallida registrada', { method, reason });
  }
};

// Función para registrar métricas de JWT
const recordJwtMetric = (type, action) => {
  switch (action) {
    case 'generated':
      jwtTokensGenerated.inc({ type });
      break;
    case 'expired':
      jwtTokensExpired.inc({ type });
      break;
    case 'refresh_success':
      jwtRefreshTotal.inc({ status: 'success' });
      break;
    case 'refresh_failed':
      jwtRefreshTotal.inc({ status: 'failed' });
      break;
  }
};

// Función para registrar métricas de transacciones
const recordTransactionMetric = (type, status) => {
  transactionsTotal.inc({ type, status });
  logger.info('Transacción registrada', { type, status });
};

// Función para registrar métricas de rate limiting
const recordRateLimitMetric = (ip, route) => {
  rateLimitHits.inc({ ip, route });
  logger.warn('Rate limiting registrado', { ip, route });
};

// Función para registrar métricas de errores
const recordErrorMetric = (type, code) => {
  errorsTotal.inc({ type, code });
  logger.error('Error registrado', { type, code });
};

// Función para actualizar métricas de usuarios activos
const updateActiveUsers = (count) => {
  activeUsers.set(count);
};

// Función para actualizar métricas de tarjetas activas
const updateActiveCards = (count) => {
  activeCards.set(count);
};

// Función para registrar saldo de tarjeta
const recordCardBalance = (balance) => {
  cardBalanceHistogram.observe(balance);
};

// Función para registrar duración de query de BD
const recordDbQuery = (operation, collection, duration) => {
  dbQueryDuration.observe({ operation, collection }, duration);
};

// Endpoint para exponer métricas
const metricsEndpoint = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    logger.error('Error obteniendo métricas', { error: error.message });
    res.status(500).json({ error: 'Error obteniendo métricas' });
  }
};

// Función para obtener métricas como JSON (para dashboard)
const getMetricsAsJson = async () => {
  try {
    const metrics = await register.getMetricsAsJSON();
    return metrics;
  } catch (error) {
    logger.error('Error obteniendo métricas como JSON', { error: error.message });
    return null;
  }
};

// Función para limpiar métricas (útil para tests)
const clearMetrics = () => {
  register.clear();
};

module.exports = {
  register,
  metricsMiddleware,
  recordAuthMetric,
  recordJwtMetric,
  recordTransactionMetric,
  recordRateLimitMetric,
  recordErrorMetric,
  updateActiveUsers,
  updateActiveCards,
  recordCardBalance,
  recordDbQuery,
  metricsEndpoint,
  getMetricsAsJson,
  clearMetrics
}; 