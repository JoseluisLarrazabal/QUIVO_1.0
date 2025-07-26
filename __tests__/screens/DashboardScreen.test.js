import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import * as AuthContext from '../../src/context/AuthContext';
import DashboardScreen from '../../src/screens/DashboardScreen';
import { Provider as PaperProvider } from 'react-native-paper';

const TestWrapper = ({ children }) => (
  <PaperProvider>
    {children}
  </PaperProvider>
);

jest.mock('../../src/services/apiService', () => ({
  apiService: {
    getUserCards: jest.fn(() => Promise.resolve({ ok: true, data: [
      { uid: 'CARD1', saldo_actual: 20, alias: 'Mi Tarjeta' },
    ] })),
    getTransactionHistory: jest.fn(() => Promise.resolve({ ok: true, success: true, data: [] })),
  }
}));

const mockNavigation = { navigate: jest.fn() };

const baseUser = {
  id: '123',
  nombre: 'Test User',
  email: 'test@example.com',
  tipo_tarjeta: 'adulto',
  authMode: 'credentials',
  selectedCard: 'CARD1',
  isMultiCard: true,
  cards: [
    { uid: 'CARD1', saldo_actual: 20, alias: 'Mi Tarjeta' },
  ],
};

describe('DashboardScreen (integración)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AuthContext, 'useAuth').mockImplementation(() => ({
      user: baseUser,
      loading: false,
      logout: jest.fn(),
      refreshUserCards: jest.fn(),
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renderiza correctamente con tarjeta activa', async () => {
    const { getByText } = render(<DashboardScreen navigation={mockNavigation} />, { wrapper: TestWrapper });
    expect(getByText('Saldo Actual')).toBeTruthy();
    expect(getByText('Recargar')).toBeTruthy();
    expect(getByText('Historial')).toBeTruthy();
    expect(getByText('Tarjetas')).toBeTruthy();
  });

  it('ejecuta acción rápida de recarga', async () => {
    const { getByTestId } = render(<DashboardScreen navigation={mockNavigation} />, { wrapper: TestWrapper });
    fireEvent.press(getByTestId('quick-action-recharge'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Recharge', expect.anything());
  });

  it('ejecuta acción rápida de historial', async () => {
    const { getByTestId } = render(<DashboardScreen navigation={mockNavigation} />, { wrapper: TestWrapper });
    fireEvent.press(getByTestId('quick-action-history'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('History', expect.anything());
  });

  it('ejecuta acción rápida de tarjetas', async () => {
    const { getByTestId } = render(<DashboardScreen navigation={mockNavigation} />, { wrapper: TestWrapper });
    fireEvent.press(getByTestId('quick-action-cards'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Cards');
  });

  it('muestra loader si loading', () => {
    jest.spyOn(AuthContext, 'useAuth').mockImplementation(() => ({
      user: null,
      loading: true,
      logout: jest.fn(),
      refreshUserCards: jest.fn(),
    }));
    const { getByTestId } = render(<DashboardScreen navigation={mockNavigation} />, { wrapper: TestWrapper });
    expect(getByTestId('centered-loader')).toBeTruthy();
  });
}); 