import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import * as AuthContext from '../../src/context/AuthContext';
import CardsScreen from '../../src/screens/CardsScreen';

jest.mock('../../src/services/apiService', () => ({
  apiService: {
    getUserCards: jest.fn(() => Promise.resolve({ ok: true, data: [
      { uid: 'CARD1', saldo_actual: 20, alias: 'Principal' },
      { uid: 'CARD2', saldo_actual: 10, alias: 'Secundaria' },
    ] })),
    getCardInfo: jest.fn(() => Promise.resolve({ data: { uid: 'CARD1', saldo_actual: 20, alias: 'Principal' } })),
    updateCardAlias: jest.fn(() => Promise.resolve({ success: true })),
    deleteCard: jest.fn(() => Promise.resolve({ success: true })),
  }
}));

const baseUser = {
  nombre: 'Test User',
  email: 'test@example.com',
  tipo_tarjeta: 'adulto',
  authMode: 'credentials',
  selectedCard: 'CARD1',
  isMultiCard: true,
  cards: [
    { uid: 'CARD1', saldo_actual: 20, alias: 'Principal' },
    { uid: 'CARD2', saldo_actual: 10, alias: 'Secundaria' },
  ],
};
const baseAuth = {
  user: baseUser,
  loading: false,
  refreshUserCards: jest.fn(),
  selectCard: jest.fn(),
};
const mockNavigation = { navigate: jest.fn(), replace: jest.fn() };

jest.mock('../../src/services/apiService', () => ({
  apiService: {
    getUserCards: jest.fn(() => Promise.resolve({ ok: true, data: baseUser.cards })),
  },
}));

describe('CardsScreen (integración)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AuthContext, 'useAuth').mockImplementation(() => ({ ...baseAuth }));
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renderiza correctamente con tarjetas', async () => {
    let utils;
    await act(async () => {
      utils = render(<CardsScreen navigation={mockNavigation} />);
    });
    const { getByText, queryByText } = utils;
    await waitFor(() => expect(queryByText('Cargando...')).not.toBeTruthy());
    expect(getByText('Mis Tarjetas')).toBeTruthy();
    expect(getByText('Principal')).toBeTruthy();
    expect(getByText('Secundaria')).toBeTruthy();
  });

  it('muestra estado vacío si no hay tarjetas', async () => {
    jest.spyOn(AuthContext, 'useAuth').mockImplementation(() => ({
      ...baseAuth,
      user: { ...baseUser, cards: [] },
    }));
    require('../../src/services/apiService').apiService.getUserCards.mockResolvedValueOnce({ ok: true, data: [] });
    let utils;
    await act(async () => {
      utils = render(<CardsScreen navigation={mockNavigation} />);
    });
    const { getByText, queryByText } = utils;
    await waitFor(() => expect(queryByText('Cargando...')).not.toBeTruthy());
    expect(getByText('No tienes tarjetas registradas')).toBeTruthy();
  });

  it('navega a registrar tarjeta desde estado vacío', async () => {
    jest.spyOn(AuthContext, 'useAuth').mockImplementation(() => ({
      ...baseAuth,
      user: { ...baseUser, cards: [] },
    }));
    require('../../src/services/apiService').apiService.getUserCards.mockResolvedValueOnce({ ok: true, data: [] });
    let utils;
    await act(async () => {
      utils = render(<CardsScreen navigation={mockNavigation} />);
    });
    const { getByText, queryByText } = utils;
    await waitFor(() => expect(queryByText('Cargando...')).not.toBeTruthy());
    fireEvent.press(getByText('Registrar Tarjeta'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('RegisterCard');
  });

  it('permite seleccionar una tarjeta', async () => {
    let utils;
    await act(async () => {
      utils = render(<CardsScreen navigation={mockNavigation} />);
    });
    const { getAllByText, queryByText } = utils;
    await waitFor(() => expect(queryByText('Cargando...')).not.toBeTruthy());
    fireEvent.press(getAllByText('Principal')[0]);
    expect(baseAuth.selectCard).toHaveBeenCalledWith('CARD1');
  });

  it('muestra loader si loading', async () => {
    jest.spyOn(AuthContext, 'useAuth').mockImplementation(() => ({
      user: null,
      loading: true,
      refreshUserCards: jest.fn(),
      selectCard: jest.fn(),
    }));
    let utils;
    await act(async () => {
      utils = render(<CardsScreen navigation={mockNavigation} />);
    });
    const { getByTestId } = utils;
    expect(getByTestId('centered-loader')).toBeTruthy();
  });
}); 