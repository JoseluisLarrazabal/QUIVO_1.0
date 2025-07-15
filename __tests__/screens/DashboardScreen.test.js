import React from 'react';
import { render } from '@testing-library/react-native';
import DashboardScreen from '../../src/screens/DashboardScreen';
import { AuthProvider } from '../../src/context/AuthContext';

// Mock del contexto de autenticación
jest.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      nombre: 'Test User',
      tipo_tarjeta: 'adulto',
      email: 'test@example.com',
      cards: [
        { uid: 'A1B2C3D4', saldo_actual: 25.00 }
      ]
    },
    logout: jest.fn(),
    refreshUserCards: jest.fn(),
    loading: false
  }),
  AuthProvider: ({ children }) => children
}));

// Mock del servicio de API
jest.mock('../../src/services/apiService', () => ({
  apiService: {
    getTransactionHistory: jest.fn().mockResolvedValue({
      data: [
        {
          id: 1,
          tarjeta_uid: 'A1B2C3D4',
          monto: -2.50,
          tipo: 'viaje',
          ubicacion: 'Línea A - Centro',
          resultado: 'exitoso',
          fecha_hora: '2024-01-15T10:30:00Z'
        }
      ]
    })
  }
}));

describe('DashboardScreen', () => {
  test('debería renderizar correctamente con usuario', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('¡Hola, Test User!')).toBeTruthy();
    expect(getByText('Mis Tarjetas')).toBeTruthy();
  });
}); 