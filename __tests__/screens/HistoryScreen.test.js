import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import * as AuthContext from '../../src/context/AuthContext';
import HistoryScreen from '../../src/screens/HistoryScreen';

jest.mock('../../src/services/apiService', () => ({
  apiService: {
    getTransactionHistory: jest.fn(() => Promise.resolve({ ok: true, success: true, data: [] })),
    getUserCards: jest.fn(() => Promise.resolve({ ok: true, data: [
      { uid: 'CARD1', saldo_actual: 20, alias: 'Principal' },
    ] })),
  }
}));

const mockNavigation = { navigate: jest.fn() };

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

describe('HistoryScreen', () => {
  it('renderiza loader si loading', () => {
    jest.spyOn(AuthContext, 'useAuth').mockImplementation(() => ({
      user: null,
      loading: true,
      refreshUserCards: jest.fn(),
      selectCard: jest.fn(),
    }));
    const { getByTestId } = render(<HistoryScreen navigation={mockNavigation} route={{ params: {} }} />);
    expect(getByTestId('centered-loader')).toBeTruthy();
  });

  it('renderiza estado vacío si no hay transacciones', async () => {
    jest.spyOn(AuthContext, 'useAuth').mockImplementation(() => ({
      user: baseUser,
      loading: false,
      refreshUserCards: jest.fn(),
      selectCard: jest.fn(),
    }));
    const { getByText, queryByText } = render(<HistoryScreen navigation={mockNavigation} route={{ params: {} }} />);
    await waitFor(() => expect(queryByText('Cargando...')).not.toBeTruthy());
    expect(getByText('No hay transacciones registradas para esta tarjeta')).toBeTruthy();
  });

  // Puedes agregar más tests aquí para refresco, búsqueda, filtrado, etc.
}); 