const mongoose = require('mongoose');

/**
 * Servicio para manejar transacciones atómicas
 * Garantiza consistencia de datos en operaciones críticas
 */
class TransactionService {
  /**
   * Ejecuta una transacción atómica
   * @param {Function} operations - Función que contiene las operaciones a ejecutar
   * @returns {Object} - Resultado de la transacción
   */
  async executeAtomicTransaction(operations) {
    // En entorno de test o desarrollo, ejecutar sin transacciones
    if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
      try {
        console.log('🔄 Ejecutando operaciones (modo no-transaccional)...');
        const results = await operations(null);
        console.log('✅ Operaciones completadas exitosamente');
        return { success: true, data: results };
      } catch (error) {
        console.error('❌ Error en operaciones:', error.message);
        return { success: false, error: error.message };
      }
    }

    // En producción, usar transacciones reales
    const session = await mongoose.startSession();
    
    try {
      console.log('🔄 Ejecutando operaciones...');
      
      await session.startTransaction();
      const results = await operations(session);
      await session.commitTransaction();
      
      console.log('✅ Operaciones completadas exitosamente');
      return { success: true, data: results };
    } catch (error) {
      console.error('❌ Error en operaciones:', error.message);
      await session.abortTransaction();
      return { success: false, error: error.message };
    } finally {
      await session.endSession();
    }
  }

  /**
   * Ejecuta múltiples transacciones en paralelo
   * @param {Array} transactionPromises - Array de promesas de transacciones
   * @returns {Array} - Resultados de todas las transacciones
   */
  async executeMultipleTransactions(transactionPromises) {
    const results = await Promise.allSettled(transactionPromises);
    
    const successful = results.filter(r => r.status === 'fulfilled');
    const failed = results.filter(r => r.status === 'rejected');
    
    console.log(`📊 Transacciones múltiples: ${successful.length} exitosas, ${failed.length} fallidas`);
    
    return {
      successful: successful.map(r => r.value),
      failed: failed.map(r => r.reason),
      total: results.length
    };
  }

  /**
   * Valida que una transacción sea consistente
   * @param {Object} transaction - Transacción a validar
   * @returns {boolean} - True si es consistente
   */
  validateTransaction(transaction) {
    const requiredFields = ['tarjeta_uid', 'monto', 'tipo', 'resultado'];
    const hasAllFields = requiredFields.every(field => transaction[field] !== undefined);
    
    if (!hasAllFields) {
      console.error('❌ Transacción inválida: campos faltantes');
      return false;
    }
    
    if (transaction.monto <= 0) {
      console.error('❌ Transacción inválida: monto debe ser positivo');
      return false;
    }
    
    if (!['viaje', 'recarga'].includes(transaction.tipo)) {
      console.error('❌ Transacción inválida: tipo no válido');
      return false;
    }
    
    if (!['exitoso', 'fallido', 'pendiente'].includes(transaction.resultado)) {
      console.error('❌ Transacción inválida: resultado no válido');
      return false;
    }
    
    console.log('✅ Transacción válida');
    return true;
  }

  /**
   * Obtiene estadísticas de transacciones
   * @returns {Object} - Estadísticas de transacciones
   */
  async getTransactionStats() {
    const Transaction = require('../models/Transaction');
    
    const stats = await Transaction.aggregate([
      {
        $group: {
          _id: '$resultado',
          count: { $sum: 1 },
          totalAmount: { $sum: '$monto' }
        }
      }
    ]);
    
    return stats.reduce((acc, stat) => {
      acc[stat._id] = {
        count: stat.count,
        totalAmount: stat.totalAmount
      };
      return acc;
    }, {});
  }
}

module.exports = new TransactionService(); 