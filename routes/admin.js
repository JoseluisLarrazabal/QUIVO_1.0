const express = require("express")
const router = express.Router()
const Transaction = require("../models/Transaction")
const Card = require("../models/Card")
const Validator = require("../models/Validator")

// Dashboard con estadísticas
router.get("/dashboard", async (req, res) => {
  try {
    const today = new Date()
    const dailyStats = await Transaction.getDailyStats(today)
    const activeValidators = await Validator.getActiveValidators()
    const recentTransactions = await Transaction.getRecentTransactions(24)

    res.json({
      success: true,
      data: {
        estadisticas_diarias: dailyStats,
        validadores_activos: activeValidators.length,
        transacciones_recientes: recentTransactions.slice(0, 10),
        resumen: {
          total_validadores: activeValidators.length,
          transacciones_hoy: dailyStats.total_transacciones || 0,
          ingresos_hoy: dailyStats.ingresos_viajes || 0,
          recargas_hoy: dailyStats.total_recargas_monto || 0,
        },
      },
    })
  } catch (error) {
    console.error("Error en dashboard:", error)
    res.status(500).json({
      success: false,
      error: "Error al obtener estadísticas",
    })
  }
})

// Reportes por fecha
router.get("/reportes", async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        success: false,
        error: "Fechas de inicio y fin son requeridas",
      })
    }

    const startDate = new Date(fecha_inicio)
    const endDate = new Date(fecha_fin)
    endDate.setHours(23, 59, 59, 999)

    const result = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          total_transacciones: { $sum: 1 },
          viajes: {
            $sum: { $cond: [{ $eq: ["$tipo", "viaje"] }, 1, 0] }
          },
          recargas: {
            $sum: { $cond: [{ $eq: ["$tipo", "recarga"] }, 1, 0] }
          },
          ingresos: {
            $sum: { $cond: [{ $eq: ["$tipo", "viaje"] }, { $abs: "$monto" }, 0] }
          },
          total_recargas: {
            $sum: { $cond: [{ $eq: ["$tipo", "recarga"] }, "$monto", 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          fecha: "$_id",
          total_transacciones: 1,
          viajes: 1,
          recargas: 1,
          ingresos: 1,
          total_recargas: 1
        }
      },
      {
        $sort: { fecha: -1 }
      }
    ])

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Error en reportes:", error)
    res.status(500).json({
      success: false,
      error: "Error al generar reporte",
    })
  }
})

module.exports = router
