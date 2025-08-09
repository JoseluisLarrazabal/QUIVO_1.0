import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import * as AuthContext from '../../src/context/AuthContext';
import RegisterCardScreen from '../../src/screens/RegisterCardScreen';

jest.mock('../../src/services/apiService', () => ({
  apiService: {
    registerCard: jest.fn(() => Promise.resolve({ ok: true, success: true })),
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

describe('RegisterCardScreen', () => {
  const mockUser = {
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
      user: mockUser,
      loading: false,
      refreshUserCards: jest.fn(),
      selectCard: jest.fn(),
    }));
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renderiza campos de registro', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<RegisterCardScreen navigation={mockNavigation} route={{ params: {} }} />);
    await waitFor(() => expect(queryByText('Cargando...')).not.toBeTruthy());
    expect(getByPlaceholderText('Ej: A1B2C3D4')).toBeTruthy();
    expect(getByPlaceholderText('Ej: Mi Tarjeta Principal')).toBeTruthy();
    expect(getByPlaceholderText('0.00')).toBeTruthy();
  });

  // Puedes agregar más tests aquí para validaciones y navegación.
}); 