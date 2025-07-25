import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import * as AuthContext from '../../src/context/AuthContext';
import RechargeScreen from '../../src/screens/RechargeScreen';

jest.mock('../../src/services/apiService', () => ({
  apiService: {
    rechargeCard: jest.fn(() => Promise.resolve({ ok: true, success: true })),
    getUserCards: jest.fn(() => Promise.resolve({ ok: true, data: [
      { uid: 'CARD1', saldo_actual: 20, alias: 'Principal' },
    ] })),
  }
}));

const mockNavigation = { navigate: jest.fn(), goBack: jest.fn() };

const baseUser = {
  nombre: 'Test User',
  email: 'test@example.com',
  tipo_tarjeta: 'adulto',
  authMode: 'credentials',
  selectedCard: 'CARD1',
  isMultiCard: true,
  cards: [
    { uid: 'CARD1', saldo_actual: 20, alias: 'Principal' },
  ],
};

beforeEach(() => {
  jest.spyOn(AuthContext, 'useAuth').mockImplementation(() => ({
    user: baseUser,
    loading: false,
    refreshUserCards: jest.fn(),
    selectCard: jest.fn(),
  }));
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('RechargeScreen', () => {
  const baseUser = {
    nombre: 'Test User',
    email: 'test@example.com',
    tipo_tarjeta: 'adulto',
    authMode: 'credentials',
    selectedCard: 'CARD1',
    isMultiCard: true,
    cards: [
      { uid: 'CARD1', saldo_actual: 20, alias: 'Principal' },
    ],
  };
  beforeEach(() => {
    jest.spyOn(AuthContext, 'useAuth').mockImplementation(() => ({
      user: baseUser,
      loading: false,
      refreshUserCards: jest.fn(),
      selectCard: jest.fn(),
    }));
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renderiza campos de recarga', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<RechargeScreen navigation={mockNavigation} route={{ params: {} }} />);
    await waitFor(() => expect(queryByText('Cargando...')).not.toBeTruthy());
    expect(getByPlaceholderText('0.00')).toBeTruthy();
    expect(getByText('Efectivo')).toBeTruthy();
    expect(getByText('QR Bancario')).toBeTruthy();
    expect(getByText('Tigo Money')).toBeTruthy();
  });

  // Puedes agregar más tests aquí para validaciones y confirmaciones.
}); 