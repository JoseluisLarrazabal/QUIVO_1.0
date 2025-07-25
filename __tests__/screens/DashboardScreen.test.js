import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { AuthProvider } from '../../src/context/AuthContext';
import DashboardScreen from '../../src/screens/DashboardScreen';

jest.mock('../../src/services/apiService', () => ({
  apiService: {
    getUserCards: jest.fn(() => Promise.resolve({ ok: true, data: [
      { uid: 'CARD1', saldo_actual: 20, alias: 'Mi Tarjeta' },
    ] })),
    getTransactionHistory: jest.fn(() => Promise.resolve({ ok: true, success: true, data: [] })),
  }
}));

const mockNavigation = { navigate: jest.fn() };

const Wrapper = ({ children }) => (
  <AuthProvider>
    {children}
  </AuthProvider>
);

describe('DashboardScreen (integración)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renderiza correctamente con tarjeta activa', async () => {
    const { getByText, queryByText } = render(<DashboardScreen navigation={mockNavigation} />, { wrapper: Wrapper });
    await waitFor(() => expect(queryByText('Cargando...')).toBeNull());
    expect(getByText('Mi Tarjeta')).toBeTruthy();
    expect(getByText('Saldo Actual')).toBeTruthy();
    expect(getByText('Recargar')).toBeTruthy();
    expect(getByText('Historial')).toBeTruthy();
  });

  it('ejecuta acción rápida de recarga', async () => {
    const { getByTestId, queryByText } = render(<DashboardScreen navigation={mockNavigation} />, { wrapper: Wrapper });
    await waitFor(() => expect(queryByText('Cargando...')).toBeNull());
    fireEvent.press(getByTestId('quick-action-recharge'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Recharge', expect.anything());
  });

  it('ejecuta acción rápida de historial', async () => {
    const { getByTestId, queryByText } = render(<DashboardScreen navigation={mockNavigation} />, { wrapper: Wrapper });
    await waitFor(() => expect(queryByText('Cargando...')).toBeNull());
    fireEvent.press(getByTestId('quick-action-history'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('History', expect.anything());
  });

  it('ejecuta acción rápida de tarjetas', async () => {
    const { getByTestId, queryByText } = render(<DashboardScreen navigation={mockNavigation} />, { wrapper: Wrapper });
    await waitFor(() => expect(queryByText('Cargando...')).toBeNull());
    fireEvent.press(getByTestId('quick-action-cards'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Cards');
  });

  it('muestra loader si loading', () => {
    const { getByTestId } = render(<DashboardScreen navigation={mockNavigation} />, { wrapper: Wrapper });
    expect(getByTestId('centered-loader')).toBeTruthy();
  });
}); 