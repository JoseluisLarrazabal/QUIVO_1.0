const PaymentService = require('../../services/paymentService');

describe('PaymentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateTigoMoney', () => {
    test('debería validar pago Tigo Money exitoso', async () => {
      const amount = 50;
      const phone = '70012345';
      const reference = 'REF123';
      
      const result = await PaymentService.validateTigoMoney(amount, phone, reference);
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('provider', 'tigo_money');
      expect(result).toHaveProperty('amount', amount);
      expect(result).toHaveProperty('phone', phone);
      
      if (result.success) {
        expect(result).toHaveProperty('transactionId');
        expect(result).toHaveProperty('timestamp');
      }
    });

    test('debería manejar errores en validación Tigo Money', async () => {
      // Simular error de red
      jest.spyOn(PaymentService, 'mockTigoMoneyValidation').mockRejectedValue(new Error('Network error'));
      
      const result = await PaymentService.validateTigoMoney(50, '70012345', 'REF123');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(result.provider).toBe('tigo_money');
    });
  });

  describe('validateQRPayment', () => {
    test('debería validar pago QR exitoso', async () => {
      const amount = 30;
      const qrCode = 'QR_CODE_123';
      
      const result = await PaymentService.validateQRPayment(amount, qrCode);
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('provider', 'qr');
      
      if (result.success) {
        expect(result).toHaveProperty('amount', amount);
        expect(result).toHaveProperty('qrCode', qrCode);
        expect(result).toHaveProperty('transactionId');
        expect(result).toHaveProperty('timestamp');
      } else {
        expect(result).toHaveProperty('error');
      }
    });

    test('debería manejar errores en validación QR', async () => {
      jest.spyOn(PaymentService, 'mockQRValidation').mockRejectedValue(new Error('QR expired'));
      
      const result = await PaymentService.validateQRPayment(30, 'EXPIRED_QR');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('QR expired');
      expect(result.provider).toBe('qr');
    });
  });

  describe('validateCashPayment', () => {
    test('debería validar pago efectivo exitoso', async () => {
      const amount = 20;
      const location = 'Terminal Central';
      const operator = 'OP001';
      
      const result = await PaymentService.validateCashPayment(amount, location, operator);
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('provider', 'efectivo');
      expect(result).toHaveProperty('amount', amount);
      expect(result).toHaveProperty('location', location);
      expect(result).toHaveProperty('operator', operator);
      
      if (result.success) {
        expect(result).toHaveProperty('transactionId');
        expect(result).toHaveProperty('timestamp');
      }
    });

    test('debería manejar errores en validación efectivo', async () => {
      jest.spyOn(PaymentService, 'mockCashValidation').mockRejectedValue(new Error('Operator unavailable'));
      
      const result = await PaymentService.validateCashPayment(20, 'Location', 'OP001');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Operator unavailable');
      expect(result.provider).toBe('efectivo');
    });
  });

  describe('getPaymentStatus', () => {
    test('debería obtener estado de pago', async () => {
      const transactionId = 'TIGO_1234567890_abc123';
      const provider = 'tigo_money';
      
      const result = await PaymentService.getPaymentStatus(transactionId, provider);
      
      expect(result).toHaveProperty('transactionId', transactionId);
      expect(result).toHaveProperty('provider', provider);
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('details');
    });

    test('debería manejar errores al obtener estado', async () => {
      jest.spyOn(PaymentService, 'mockPaymentStatus').mockRejectedValue(new Error('API unavailable'));
      
      const result = await PaymentService.getPaymentStatus('TEST_ID', 'test_provider');
      
      expect(result).toHaveProperty('transactionId', 'TEST_ID');
      expect(result).toHaveProperty('provider', 'test_provider');
      expect(result).toHaveProperty('status', 'UNKNOWN');
      expect(result).toHaveProperty('error', 'API unavailable');
    });
  });

  describe('mockValidations', () => {
    test('mockTigoMoneyValidation debería simular validación exitosa', async () => {
      const result = await PaymentService.mockTigoMoneyValidation(50, '70012345', 'REF123');
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('transactionId');
      expect(result).toHaveProperty('timestamp');
      
      if (result.success) {
        expect(result.transactionId).toMatch(/^TIGO_\d+_[a-z0-9]+$/);
      } else {
        expect(result).toHaveProperty('error');
      }
    });

    test('mockQRValidation debería simular validación exitosa', async () => {
      const result = await PaymentService.mockQRValidation(30, 'QR_CODE_123');
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('transactionId');
      expect(result).toHaveProperty('timestamp');
      
      if (result.success) {
        expect(result.transactionId).toMatch(/^QR_\d+_[a-z0-9]+$/);
      } else {
        expect(result).toHaveProperty('error');
      }
    });

    test('mockCashValidation debería simular validación exitosa', async () => {
      const result = await PaymentService.mockCashValidation(20, 'Location', 'OP001');
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('transactionId');
      expect(result).toHaveProperty('timestamp');
      
      if (result.success) {
        expect(result.transactionId).toMatch(/^CASH_\d+_[a-z0-9]+$/);
      } else {
        expect(result).toHaveProperty('error');
      }
    });

    test('mockPaymentStatus debería retornar estado válido', async () => {
      const result = await PaymentService.mockPaymentStatus('TEST_ID', 'test_provider');
      
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('details');
      expect(['SUCCESS', 'FAILED', 'PENDING']).toContain(result.status);
      expect(result.details).toHaveProperty('provider', 'test_provider');
      expect(result.details).toHaveProperty('transactionId', 'TEST_ID');
    });
  });
}); 