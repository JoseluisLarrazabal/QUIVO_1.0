import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import * as AuthContext from '../../src/context/AuthContext';
import CardsScreen from '../../src/screens/CardsScreen';
import { Provider as PaperProvider } from 'react-native-paper';

const TestWrapper = ({ children }) => (
  <PaperProvider>
    {children}
  </PaperProvider>
);

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
// Amplía el mock de navegación para cubrir todos los métodos posibles usados en React Navigation
const mockNavigation = {
  navigate: jest.fn(),
  replace: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
  push: jest.fn(),
  pop: jest.fn(),
  popToTop: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  addListener: jest.fn(),
  removeListener: jest.fn(),
};

describe('CardsScreen (integración)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AuthContext, 'useAuth').mockImplementation(() => ({
      user: baseUser,
      loading: false,
      refreshUserCards: jest.fn(),
      selectCard: jest.fn(),
      // agrega aquí cualquier otra función esperada por el componente
    }));
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renderiza correctamente con tarjetas', async () => {
    try {
      const { findByText, findAllByText } = render(
        <CardsScreen navigation={mockNavigation} />, { wrapper: TestWrapper }
      );
      expect(await findByText('Mis Tarjetas')).toBeTruthy();
      expect(await findByText('Secundaria')).toBeTruthy();
      const principals = await findAllByText('Principal');
      expect(principals.length).toBe(2); // Aparece en activa y en lista
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('ERROR EN TEST:', e);
      throw e;
    }
  });

  it('muestra estado vacío si no hay tarjetas', async () => {
    require('../../src/services/apiService').apiService.getUserCards.mockResolvedValueOnce({ ok: true, data: [] });
    jest.spyOn(AuthContext, 'useAuth').mockImplementation(() => ({
      ...baseAuth,
      user: { ...baseUser, cards: [] },
      refreshUserCards: jest.fn(),
      selectCard: jest.fn(),
    }));
    const { findByText } = render(
      <CardsScreen navigation={mockNavigation} />, { wrapper: TestWrapper }
    );
    expect(await findByText('No tienes tarjetas')).toBeTruthy();
    expect(await findByText('Registra tu primera tarjeta para comenzar')).toBeTruthy();
  });

  it('navega a registrar tarjeta desde estado vacío', async () => {
    require('../../src/services/apiService').apiService.getUserCards.mockResolvedValueOnce({ ok: true, data: [] });
    jest.spyOn(AuthContext, 'useAuth').mockImplementation(() => ({
      ...baseAuth,
      user: { ...baseUser, cards: [] },
      refreshUserCards: jest.fn(),
      selectCard: jest.fn(),
    }));
    const { findByText } = render(
      <CardsScreen navigation={mockNavigation} />, { wrapper: TestWrapper }
    );
    fireEvent.press(await findByText('Registrar Nueva Tarjeta'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('RegisterCard');
  });

  it('permite seleccionar una tarjeta', async () => {
    const selectCardMock = jest.fn();
    jest.spyOn(AuthContext, 'useAuth').mockImplementation(() => ({
      ...baseAuth,
      selectCard: selectCardMock,
    }));
    const { findByText } = render(
      <CardsScreen navigation={mockNavigation} />, { wrapper: TestWrapper }
    );
    const seleccionarBtn = await findByText('Seleccionar');
    fireEvent.press(seleccionarBtn);
    expect(selectCardMock).toHaveBeenCalledWith('CARD2');
  });

  it('muestra loader si loading', () => {
    jest.spyOn(AuthContext, 'useAuth').mockImplementation(() => ({
      user: null,
      loading: true,
      refreshUserCards: jest.fn(),
      selectCard: jest.fn(),
    }));
    const { getByTestId } = render(
      <CardsScreen navigation={mockNavigation} />,
      { wrapper: TestWrapper }
    );
    expect(getByTestId('centered-loader')).toBeTruthy();
  });
});

// SUGERENCIA: Para evitar problemas de animaciones en tests, puedes agregar en CardsScreen.js:
// const isTestMode = process.env.NODE_ENV === 'test';
// y en useEffect de animaciones: if (isTestMode) return; // Salta animaciones en test 
