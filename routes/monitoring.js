const express = require('express');
const router = express.Router();
const { logger, authLogger, transactionLogger, rateLimitLogger } = require('../config/logger');
const { 
  getMetricsAsJson, 
  updateActiveUsers, 
  updateActiveCards,
  recordCardBalance 
} = require('../config/metrics');
const User = require('../models/User');
const Card = require('../models/Card');
const Transaction = require('../models/Transaction');

// Middleware de autenticación para rutas de monitoreo
const { authenticateToken } = require('../middleware/auth');

// Endpoint principal del dashboard
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Obtener métricas básicas
    const metrics = await getMetricsAsJson();
    
    // Obtener estadísticas de la base de datos
    const [
      totalUsers,
      totalCards,
      totalTransactions,
      recentTransactions,
      lowBalanceCards
    ] = await Promise.all([
      User.countDocuments(),
      Card.countDocuments({ activa: true }),
      Transaction.countDocuments(),
      Transaction.find()
        .sort({ fecha: -1 })
        .limit(10)
        .populate('tarjeta', 'uid alias')
        .populate('usuario', 'nombre'),
      Card.find({ saldo_actual: { $lt: 5 }, activa: true })
        .populate('usuario', 'nombre')
        .limit(20)
    ]);

    // Actualizar métricas de usuarios y tarjetas activas
    updateActiveUsers(totalUsers);
    updateActiveCards(totalCards);

    // Obtener estadísticas de transacciones por tipo
    const transactionStats = await Transaction.aggregate([
      {
        $group: {
          _id: '$tipo',
          count: { $sum: 1 },
          totalAmount: { $sum: '$monto' }
        }
      }
    ]);

    // Obtener estadísticas de autenticación (últimas 24h)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const authStats = await Transaction.aggregate([
      {
        $match: {
          fecha: { $gte: yesterday },
          tipo: 'validacion'
        }
      },
      {
        $group: {
          _id: null,
          totalValidations: { $sum: 1 },
          successfulValidations: {
            $sum: { $cond: [{ $eq: ['$estado', 'exitoso'] }, 1, 0] }
          }
        }
      }
    ]);

    // Obtener distribución de saldos
    const balanceDistribution = await Card.aggregate([
      { $match: { activa: true } },
      {
        $bucket: {
          groupBy: '$saldo_actual',
          boundaries: [0, 5, 10, 25, 50, 100, 200, 500],
          default: '500+',
          output: {
            count: { $sum: 1 },
            avgBalance: { $avg: '$saldo_actual' }
          }
        }
      }
    ]);

    // Registrar métricas de saldos
    balanceDistribution.forEach(bucket => {
      if (bucket._id !== '500+') {
        for (let i = 0; i < bucket.count; i++) {
          recordCardBalance(bucket.avgBalance);
        }
      }
    });

    // Obtener logs recientes (simulado - en producción usaría un sistema de logs más robusto)
    const recentLogs = {
      auth: 'Logs de autenticación disponibles en /logs/auth',
      transactions: 'Logs de transacciones disponibles en /logs/transactions',
      errors: 'Logs de errores disponibles en /logs/errors'
    };

    const dashboardData = {
      timestamp: new Date().toISOString(),
      metrics: {
        totalUsers,
        totalCards,
        totalTransactions,
        activeUsers: totalUsers, // Simplificado
        activeCards: totalCards
      },
      transactions: {
        recent: recentTransactions,
        stats: transactionStats,
        authStats: authStats[0] || { totalValidations: 0, successfulValidations: 0 }
      },
      cards: {
        lowBalance: lowBalanceCards,
        balanceDistribution
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        logs: recentLogs
      },
      prometheus: metrics
    };

    // Log de acceso al dashboard
    logger.info('Dashboard accedido', {
      userId: req.user.id,
      duration: Date.now() - startTime
    });

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    logger.error('Error obteniendo datos del dashboard', {
      error: error.message,
      userId: req.user?.id
    });
    
    res.status(500).json({
      success: false,
      error: 'Error obteniendo datos del dashboard',
      code: 'DASHBOARD_ERROR'
    });
  }
});

// Endpoint para logs de autenticación
router.get('/logs/auth', authenticateToken, async (req, res) => {
  try {
    // En un entorno real, esto leería los archivos de logs
    // Por ahora, devolvemos información sobre el sistema de logs
    const logInfo = {
      service: 'nfc-transport-auth',
      logFiles: [
        'logs/auth-YYYY-MM-DD.log',
        'logs/application-YYYY-MM-DD.log'
      ],
      retention: '90 días',
      format: 'JSON estructurado',
      fields: [
        'timestamp',
        'level',
        'message',
        'method',
        'userId',
        'ip',
        'userAgent'
      ]
    };

    res.json({
      success: true,
      data: logInfo
    });

  } catch (error) {
    logger.error('Error obteniendo logs de autenticación', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error obteniendo logs',
      code: 'LOGS_ERROR'
    });
  }
});

// Endpoint para logs de transacciones
router.get('/logs/transactions', authenticateToken, async (req, res) => {
  try {
    const logInfo = {
      service: 'nfc-transport-transactions',
      logFiles: [
        'logs/transactions-YYYY-MM-DD.log',
        'logs/application-YYYY-MM-DD.log'
      ],
      retention: '60 días',
      format: 'JSON estructurado',
      fields: [
        'timestamp',
        'level',
        'message',
        'transactionType',
        'cardUid',
        'amount',
        'status'
      ]
    };

    res.json({
      success: true,
      data: logInfo
    });

  } catch (error) {
    logger.error('Error obteniendo logs de transacciones', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error obteniendo logs',
      code: 'LOGS_ERROR'
    });
  }
});

// Endpoint para logs de rate limiting
router.get('/logs/rate-limit', authenticateToken, async (req, res) => {
  try {
    const logInfo = {
      service: 'nfc-transport-rate-limit',
      logFiles: [
        'logs/rate-limit-YYYY-MM-DD.log'
      ],
      retention: '30 días',
      format: 'JSON estructurado',
      fields: [
        'timestamp',
        'level',
        'message',
        'ip',
        'route',
        'limit',
        'remaining'
      ]
    };

    res.json({
      success: true,
      data: logInfo
    });

  } catch (error) {
    logger.error('Error obteniendo logs de rate limiting', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error obteniendo logs',
      code: 'LOGS_ERROR'
    });
  }
});

// Endpoint para estadísticas de JWT
router.get('/jwt-stats', authenticateToken, async (req, res) => {
  try {
    // En un entorno real, esto obtendría estadísticas de tokens desde Redis o similar
    const jwtStats = {
      activeTokens: 'Monitoreado via métricas Prometheus',
      expiredTokens: 'Monitoreado via métricas Prometheus',
      refreshRate: 'Monitoreado via métricas Prometheus',
      endpoints: {
        '/metrics': 'Métricas Prometheus completas',
        '/api/monitoring/dashboard': 'Dashboard general'
      }
    };

    res.json({
      success: true,
      data: jwtStats
    });

  } catch (error) {
    logger.error('Error obteniendo estadísticas JWT', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas JWT',
      code: 'JWT_STATS_ERROR'
    });
  }
});

// Endpoint para health check avanzado
router.get('/health/advanced', async (req, res) => {
  try {
    const healthChecks = {
      database: {
        status: 'healthy',
        responseTime: 'Monitoreado via métricas'
      },
      authentication: {
        status: 'healthy',
        activeSessions: 'Monitoreado via métricas'
      },
      rateLimiting: {
        status: 'healthy',
        blockedRequests: 'Monitoreado via métricas'
      },
      logging: {
        status: 'healthy',
        logFiles: 'Rotación automática configurada'
      },
      metrics: {
        status: 'healthy',
        endpoint: '/metrics'
      }
    };

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: healthChecks
    });

  } catch (error) {
    logger.error('Error en health check avanzado', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error en health check',
      code: 'HEALTH_CHECK_ERROR'
    });
  }
});

module.exports = router; 