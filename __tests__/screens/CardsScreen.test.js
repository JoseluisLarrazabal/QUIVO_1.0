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
    getCardInfo: jest.fn(() => Promise.resolve({ ok: true, data: { uid: 'CARD1', saldo_actual: 20, alias: 'Principal' } })),
    updateCardAlias: jest.fn(() => Promise.resolve({ ok: true, success: true })),
    deleteCard: jest.fn(() => Promise.resolve({ ok: true, success: true })),
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

describe('CardsScreen (integración)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AuthContext, 'useAuth').mockImplementation(() => ({ ...baseAuth }));
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renderiza correctamente con tarjetas', async () => {
    const { findByText, queryByText } = render(
      <CardsScreen navigation={mockNavigation} />
    );
    await waitFor(() => expect(queryByText('Cargando...')).not.toBeTruthy());
    expect(await findByText('Mis Tarjetas')).toBeTruthy();
    expect(await findByText('Principal')).toBeTruthy();
    expect(await findByText('Secundaria')).toBeTruthy();
  });

  it('muestra estado vacío si no hay tarjetas', async () => {
    require('../../src/services/apiService').apiService.getUserCards.mockResolvedValueOnce({ ok: true, data: [] });
    jest.spyOn(AuthContext, 'useAuth').mockImplementation(() => ({
      ...baseAuth,
      user: { ...baseUser, cards: [] },
    }));
    const { findByText, queryByText } = render(
      <CardsScreen navigation={mockNavigation} />
    );
    await waitFor(() => expect(queryByText('Cargando...')).not.toBeTruthy());
    expect(await findByText('No tienes tarjetas registradas')).toBeTruthy();
  });

  it('navega a registrar tarjeta desde estado vacío', async () => {
    require('../../src/services/apiService').apiService.getUserCards.mockResolvedValueOnce({ ok: true, data: [] });
    jest.spyOn(AuthContext, 'useAuth').mockImplementation(() => ({
      ...baseAuth,
      user: { ...baseUser, cards: [] },
    }));
    const { findByText } = render(
      <CardsScreen navigation={mockNavigation} />
    );
    fireEvent.press(await findByText('Registrar Tarjeta'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('RegisterCard');
  });

  it('permite seleccionar una tarjeta', async () => {
    const { findAllByText } = render(
      <CardsScreen navigation={mockNavigation} />
    );
    const cards = await findAllByText('Principal');
    fireEvent.press(cards[0]);
    expect(baseAuth.selectCard).toHaveBeenCalledWith('CARD1');
  });

  it('muestra loader si loading', () => {
    jest.spyOn(AuthContext, 'useAuth').mockImplementation(() => ({
      user: null,
      loading: true,
      refreshUserCards: jest.fn(),
      selectCard: jest.fn(),
    }));
    const { getByTestId } = render(
      <CardsScreen navigation={mockNavigation} />
    );
    expect(getByTestId('centered-loader')).toBeTruthy();
  });
});

// SUGERENCIA: Para evitar problemas de animaciones en tests, puedes agregar en CardsScreen.js:
// const isTestMode = process.env.NODE_ENV === 'test';
// y en useEffect de animaciones: if (isTestMode) return; // Salta animaciones en test 
}); 