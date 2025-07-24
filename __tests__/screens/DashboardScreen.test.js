import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { AuthContext } from '../../src/context/AuthContext';
import DashboardScreen from '../../src/screens/DashboardScreen';

const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockLogout = jest.fn();
const mockRefreshUserCards = jest.fn();

const mockNavigation = {
  navigate: mockNavigate,
  replace: mockReplace,
};

const baseUser = {
  nombre: 'Juan Pérez',
  email: 'juan@example.com',
  tipo_tarjeta: 'adulto',
  authMode: 'credentials',
  selectedCard: 'A1B2C3D4',
  isMultiCard: true,
  cards: [
    {
      uid: 'A1B2C3D4',
      saldo_actual: 25.5,
    },
    {
      uid: 'E5F6G7H8',
      saldo_actual: 10.0,
    },
  ],
};

const mockTransactions = [
  {
    id: 1,
    ubicacion: 'Terminal Central',
    fecha_hora: '2024-01-15T10:30:00Z',
    monto: -2.5,
  },
  {
    id: 2,
    ubicacion: 'Centro Comercial',
    fecha_hora: '2024-01-14T15:45:00Z',
    monto: 10.0,
  },
  {
    id: 3,
    ubicacion: 'Universidad',
    fecha_hora: '2024-01-13T08:15:00Z',
    monto: -1.8,
  },
];

jest.mock('../../src/services/apiService', () => ({
  apiService: {
    getTransactionHistory: jest.fn(() => Promise.resolve({ data: mockTransactions })),
  },
}));

const renderWithAuth = (user = baseUser, loading = false) => {
  return render(
    <AuthContext.Provider value={{
      user,
      loading,
      logout: mockLogout,
      refreshUserCards: mockRefreshUserCards,
    }}>
      <DashboardScreen navigation={mockNavigation} />
    </AuthContext.Provider>
  );
};

describe('DashboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza datos principales del usuario y tarjeta', async () => {
    const { getByText } = renderWithAuth();
    await waitFor(() => {
      expect(getByText('¡Hola, Juan Pérez!')).toBeTruthy();
      expect(getByText('juan@example.com')).toBeTruthy();
      expect(getByText('Adulto')).toBeTruthy();
      expect(getByText('Tarjeta Seleccionada')).toBeTruthy();
      expect(getByText('25.50 Bs')).toBeTruthy();
      expect(getByText('A1B2C3D4')).toBeTruthy();
      expect(getByText('Tarifa por viaje: 2.50 Bs')).toBeTruthy();
    });
  });

  it('renderiza acciones rápidas y botones de gestión', async () => {
    const { getByText } = renderWithAuth();
    await waitFor(() => {
      expect(getByText('Recargar')).toBeTruthy();
      expect(getByText('Ver Historial')).toBeTruthy();
      expect(getByText('Gestionar Todas las Tarjetas')).toBeTruthy();
    });
  });

  it('navega a Recharge al presionar Recargar', async () => {
    const { getByText } = renderWithAuth();
    await waitFor(() => {
      fireEvent.press(getByText('Recargar'));
      expect(mockNavigate).toHaveBeenCalledWith('Recharge', expect.anything());
    });
  });

  it('navega a History al presionar Ver Historial', async () => {
    const { getByText } = renderWithAuth();
    await waitFor(() => {
      fireEvent.press(getByText('Ver Historial'));
      expect(mockNavigate).toHaveBeenCalledWith('History', expect.anything());
    });
  });

  it('navega a Cards al presionar Gestionar Todas las Tarjetas', async () => {
    const { getByText } = renderWithAuth();
    await waitFor(() => {
      fireEvent.press(getByText('Gestionar Todas las Tarjetas'));
      expect(mockNavigate).toHaveBeenCalledWith('Cards');
    });
  });

  it('renderiza banner y acción en modo NFC', async () => {
    const nfcUser = { ...baseUser, authMode: 'card_uid', isMultiCard: false };
    const { getByText } = renderWithAuth(nfcUser);
    await waitFor(() => {
      expect(getByText('Modo Tarjeta NFC - Acceso limitado a una sola tarjeta')).toBeTruthy();
      expect(getByText('Cambiar a Credenciales')).toBeTruthy();
    });
    fireEvent.press(getByText('Cambiar a Credenciales'));
    expect(mockLogout).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('Login');
  });

  it('muestra loader si loading o no hay usuario', () => {
    const { getByTestId } = renderWithAuth(undefined, true);
    expect(getByTestId('centered-loader')).toBeTruthy();
  });

  it('muestra mensaje si no hay tarjeta seleccionada', () => {
    const userNoCard = { ...baseUser, selectedCard: null };
    const { queryByText } = renderWithAuth(userNoCard);
    expect(queryByText('Tarjeta Seleccionada')).toBeNull();
  });

  it('muestra mensaje si no hay transacciones recientes', async () => {
    const apiService = require('../../src/services/apiService').apiService;
    apiService.getTransactionHistory.mockResolvedValueOnce({ data: [] });
    const { getByText } = renderWithAuth();
    await waitFor(() => {
      expect(getByText('No hay transacciones recientes')).toBeTruthy();
    });
  });

  it('actualiza datos al hacer pull to refresh', async () => {
    const { getByTestId } = renderWithAuth();
    const scrollView = getByTestId('ScrollView');
    await act(async () => {
      scrollView.props.refreshControl.props.onRefresh();
    });
    expect(mockRefreshUserCards).toHaveBeenCalled();
  });
}); 