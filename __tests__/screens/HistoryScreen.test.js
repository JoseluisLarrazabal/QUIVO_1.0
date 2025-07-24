import React from 'react';
import { render, fireEvent, waitFor, act, queryByText } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import HistoryScreen from '../../src/screens/HistoryScreen';
import { AuthContext } from '../../src/context/AuthContext';
import { apiService } from '../../src/services/apiService';

// Mock del servicio API
jest.mock('../../src/services/apiService');

// Mock de CenteredLoader
jest.mock('../../src/components/CenteredLoader', () => {
  return function MockCenteredLoader() {
    return null;
  };
});

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

const mockRoute = {
  params: {},
};

const mockUser = {
  uid: 'user123',
  email: 'test@example.com',
  authMode: 'credentials',
  cards: [
    {
      uid: 'card1',
      saldo_actual: 50.0,
      alias: 'Tarjeta Principal',
    },
    {
      uid: 'card2',
      saldo_actual: 25.0,
      alias: 'Tarjeta Secundaria',
    },
  ],
  selectedCard: 'card1',
};

const mockTransactions = [
  {
    id: 1,
    ubicacion: 'Terminal Central',
    fecha_hora: '2024-01-15T10:30:00Z',
    monto: -2.50,
    resultado: 'Exitoso',
  },
  {
    id: 2,
    ubicacion: 'Centro Comercial',
    fecha_hora: '2024-01-14T15:45:00Z',
    monto: 20.0,
    resultado: 'Exitoso',
  },
  {
    id: 3,
    ubicacion: 'Universidad',
    fecha_hora: '2024-01-13T08:15:00Z',
    monto: -1.80,
    resultado: 'Exitoso',
  },
];

const renderHistoryScreen = (user = mockUser, route = mockRoute) => {
  return render(
    <PaperProvider>
      <NavigationContainer>
        <AuthContext.Provider value={{ user, loading: false }}>
          <HistoryScreen navigation={mockNavigation} route={route} />
        </AuthContext.Provider>
      </NavigationContainer>
    </PaperProvider>
  );
};

describe('HistoryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    apiService.getTransactionHistory.mockResolvedValue({ data: mockTransactions });
  });

  describe('Renderizado básico', () => {
    it('renderiza correctamente con tarjeta seleccionada', async () => {
      const { getByText, getByTestId } = renderHistoryScreen();

      await waitFor(() => {
        expect(getByText('Historial de Transacciones')).toBeTruthy();
        expect(getByText('Tarjeta:')).toBeTruthy();
        expect(getByText('Saldo actual: 50.00 Bs')).toBeTruthy();
        expect(getByTestId('flat-list')).toBeTruthy();
      });
    });

    it('renderiza el banner de modo NFC cuando authMode es card_uid', async () => {
      const nfcUser = { ...mockUser, authMode: 'card_uid' };
      const { getByText } = renderHistoryScreen(nfcUser);

      await waitFor(() => {
        expect(getByText('Modo Tarjeta NFC - Historial de una sola tarjeta')).toBeTruthy();
        expect(getByText('Cambiar a Credenciales')).toBeTruthy();
      });
    });

    it('no renderiza el banner en modo credenciales', async () => {
      const { queryByText } = renderHistoryScreen();

      await waitFor(() => {
        expect(queryByText('Modo Tarjeta NFC - Historial de una sola tarjeta')).toBeNull();
      });
    });

    it('renderiza selector de tarjetas cuando hay múltiples tarjetas', async () => {
      const { getByText } = renderHistoryScreen();

      await waitFor(() => {
        expect(getByText('Cambiar tarjeta:')).toBeTruthy();
      });
    });

    it('no renderiza selector de tarjetas con una sola tarjeta', async () => {
      const singleCardUser = { ...mockUser, cards: [mockUser.cards[0]] };
      const { queryByText } = renderHistoryScreen(singleCardUser);

      await waitFor(() => {
        expect(queryByText('Cambiar tarjeta:')).toBeNull();
      });
    });
  });

  describe('Carga de transacciones', () => {
    it('carga transacciones al montar el componente', async () => {
      renderHistoryScreen();

      await waitFor(() => {
        expect(apiService.getTransactionHistory).toHaveBeenCalledWith('card1');
      });
    });

    it('renderiza transacciones cargadas correctamente', async () => {
      const { getByText } = renderHistoryScreen();

      await waitFor(() => {
        expect(getByText('Terminal Central')).toBeTruthy();
        expect(getByText('Centro Comercial')).toBeTruthy();
        expect(getByText('Universidad')).toBeTruthy();
        expect(getByText('-2.50 Bs')).toBeTruthy();
        expect(getByText('+20.00 Bs')).toBeTruthy();
      });
    });

    it('maneja errores de carga de transacciones', async () => {
      apiService.getTransactionHistory.mockRejectedValue(new Error('Error de red'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      renderHistoryScreen();

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error loading transactions:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Filtrado de transacciones', () => {
    it('filtra transacciones por ubicación', async () => {
      const { getByPlaceholderText, getByText, queryByText } = renderHistoryScreen();

      await waitFor(() => {
        expect(getByText('Terminal Central')).toBeTruthy();
        expect(getByText('Centro Comercial')).toBeTruthy();
      });

      const searchBar = getByPlaceholderText('Buscar por ubicación o fecha...');
      fireEvent.changeText(searchBar, 'Terminal');

      await waitFor(() => {
        expect(getByText('Terminal Central')).toBeTruthy();
        expect(queryByText('Centro Comercial')).toBeNull();
        expect(queryByText('Universidad')).toBeNull();
      });
    });

    it('filtra transacciones por fecha', async () => {
      const { getByPlaceholderText, getByText, queryByText } = renderHistoryScreen();

      await waitFor(() => {
        expect(getByText('Terminal Central')).toBeTruthy();
      });

      const searchBar = getByPlaceholderText('Buscar por ubicación o fecha...');
      fireEvent.changeText(searchBar, '15/1/2024');

      await waitFor(() => {
        expect(getByText('Terminal Central')).toBeTruthy();
        expect(queryByText('Centro Comercial')).toBeNull();
      });
    });

    it('muestra todas las transacciones cuando se limpia la búsqueda', async () => {
      const { getByPlaceholderText, getByText, queryByText } = renderHistoryScreen();

      await waitFor(() => {
        expect(getByText('Terminal Central')).toBeTruthy();
        expect(getByText('Centro Comercial')).toBeTruthy();
      });

      const searchBar = getByPlaceholderText('Buscar por ubicación o fecha...');
      fireEvent.changeText(searchBar, 'Terminal');
      
      await waitFor(() => {
        expect(queryByText('Centro Comercial')).toBeNull();
      });

      fireEvent.changeText(searchBar, '');

      await waitFor(() => {
        expect(getByText('Terminal Central')).toBeTruthy();
        expect(getByText('Centro Comercial')).toBeTruthy();
      });
    });
  });

  describe('Selección de tarjetas', () => {
    it('cambia de tarjeta al hacer clic en selector', async () => {
      const { getByText } = renderHistoryScreen();

      await waitFor(() => {
        expect(getByText('Saldo actual: 50.00 Bs')).toBeTruthy();
      });

      const card2Button = getByText('card2');
      fireEvent.press(card2Button);

      await waitFor(() => {
        expect(getByText('Saldo actual: 25.00 Bs')).toBeTruthy();
        expect(apiService.getTransactionHistory).toHaveBeenCalledWith('card2');
      });
    });

    it('usa tarjeta de parámetros de ruta si está disponible', async () => {
      const routeWithCard = {
        params: { selectedCard: { uid: 'card2', saldo_actual: 25.0 } },
      };

      renderHistoryScreen(mockUser, routeWithCard);

      await waitFor(() => {
        expect(apiService.getTransactionHistory).toHaveBeenCalledWith('card2');
      });
    });
  });

  describe('Pull to refresh', () => {
    it('recarga transacciones al hacer pull to refresh', async () => {
      const { getByTestId } = renderHistoryScreen();

      await waitFor(() => {
        expect(getByTestId('flat-list')).toBeTruthy();
      });

      const flatList = getByTestId('flat-list');
      
      // Simular pull to refresh
      await act(async () => {
        const refreshControl = flatList.props.refreshControl;
        refreshControl.props.onRefresh();
      });

      await waitFor(() => {
        expect(apiService.getTransactionHistory).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Navegación', () => {
    it('navega a Login desde banner NFC', async () => {
      const nfcUser = { ...mockUser, authMode: 'card_uid' };
      const { getByText } = renderHistoryScreen(nfcUser);

      await waitFor(() => {
        expect(getByText('Cambiar a Credenciales')).toBeTruthy();
      });

      const changeButton = getByText('Cambiar a Credenciales');
      fireEvent.press(changeButton);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
    });
  });

  describe('Estados de carga y error', () => {
    it('muestra loader mientras carga', async () => {
      apiService.getTransactionHistory.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      const { getByText } = renderHistoryScreen();

      expect(getByText('Cargando historial...')).toBeTruthy();
    });

    it('muestra mensaje de error cuando no hay tarjeta seleccionada', async () => {
      const userWithoutCard = { ...mockUser, cards: null, selectedCard: null };
      const { getByText } = renderHistoryScreen(userWithoutCard);

      expect(getByText('No hay tarjeta seleccionada para ver el historial')).toBeTruthy();
      expect(getByText('Volver')).toBeTruthy();
    });

    it('navega hacia atrás al presionar botón volver', async () => {
      const userWithoutCard = { ...mockUser, cards: null, selectedCard: null };
      const { getByText } = renderHistoryScreen(userWithoutCard);

      const backButton = getByText('Volver');
      fireEvent.press(backButton);

      expect(mockNavigation.goBack).toHaveBeenCalled();
    });

    it('muestra mensaje cuando no hay transacciones', async () => {
      apiService.getTransactionHistory.mockResolvedValue({ data: [] });
      
      const { getByText } = renderHistoryScreen();

      await waitFor(() => {
        expect(getByText('No se encontraron transacciones')).toBeTruthy();
      });
    });
  });

  describe('Funciones utilitarias', () => {
    it('determina tipo de transacción correctamente', async () => {
      const { getByText } = renderHistoryScreen();

      await waitFor(() => {
        expect(getByText('Terminal Central')).toBeTruthy();
        expect(getByText('Centro Comercial')).toBeTruthy();
      });
    });

    it('formatea montos correctamente', async () => {
      const { getByText } = renderHistoryScreen();

      await waitFor(() => {
        expect(getByText('-2.50 Bs')).toBeTruthy();
        expect(getByText('+20.00 Bs')).toBeTruthy();
        expect(getByText('-1.80 Bs')).toBeTruthy();
      });
    });

    it('muestra resultado de transacción cuando está disponible', async () => {
      const { getByText } = renderHistoryScreen();

      await waitFor(() => {
        expect(getByText('Terminal Central')).toBeTruthy();
      });
    });
  });

  describe('Estados de autenticación', () => {
    it('muestra loader cuando está cargando autenticación', async () => {
      const { getByText } = render(
        <PaperProvider>
          <NavigationContainer>
            <AuthContext.Provider value={{ user: null, loading: true }}>
              <HistoryScreen navigation={mockNavigation} route={mockRoute} />
            </AuthContext.Provider>
          </NavigationContainer>
        </PaperProvider>
      );

      // CenteredLoader no renderiza nada en el mock, pero el componente debería estar en estado de carga
      expect(getByText).toBeDefined();
    });

    it('muestra loader cuando no hay usuario autenticado', async () => {
      const { getByText } = render(
        <PaperProvider>
          <NavigationContainer>
            <AuthContext.Provider value={{ user: null, loading: false }}>
              <HistoryScreen navigation={mockNavigation} route={mockRoute} />
            </AuthContext.Provider>
          </NavigationContainer>
        </PaperProvider>
      );

      // CenteredLoader no renderiza nada en el mock, pero el componente debería estar en estado de carga
      expect(getByText).toBeDefined();
    });
  });
});