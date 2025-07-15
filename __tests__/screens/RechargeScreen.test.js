import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import RechargeScreen from '../../src/screens/RechargeScreen';

// Mock del contexto de autenticación
jest.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      nombre: 'Test User',
      tipo_tarjeta: 'adulto',
      email: 'test@example.com',
      cards: [
        { uid: 'A1B2C3D4', saldo_actual: 25.00 }
      ],
      selectedCard: 'A1B2C3D4', // <-- Añadido para simular selección
    },
    refreshUserCards: jest.fn(),
    loading: false
  })
}));

// Mock del servicio de API
jest.mock('../../src/services/apiService', () => ({
  apiService: {
    rechargeCard: jest.fn().mockResolvedValue({
      success: true,
      message: 'Recarga exitosa'
    })
  }
}));

describe('RechargeScreen', () => {
  test('debería renderizar correctamente', () => {
    // Simular props de navegación y route
    const navigation = { goBack: jest.fn() };
    const route = { params: {} };
    const { getAllByText } = render(<RechargeScreen navigation={navigation} route={route} />);
    expect(getAllByText('Recargar Tarjeta')[0]).toBeTruthy();
  });
}); 