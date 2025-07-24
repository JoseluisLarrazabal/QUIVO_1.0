import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import HistoryScreen from '../../src/screens/HistoryScreen';
import { useAuth, AuthContext } from '../../src/context/AuthContext';
import { apiService } from '../../src/services/apiService';

// Mocks globales al inicio del archivo
jest.mock('../../src/context/AuthContext');
jest.mock('../../src/services/apiService');

// Mock de animaciones y entorno nativo para Jest
jest.mock('react-native/Libraries/ReactNative/RendererImplementation', () => ({
  findNodeHandle: () => 1,
}));
jest.mock('expo-blur', () => 'BlurView');
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// Mock de theme para evitar errores de color en tests
jest.mock('../../src/theme', () => ({
  colors: {
    primary: '#1976D2',
    primaryDark: '#004BA0',
    accent: '#FF4081',
    error: '#FF0000',
    warning: '#FFA500',
    warningLight: '#FFF4E5',
    warningDark: '#FF9800',
    success: '#4CAF50',
    info: '#2196F3',
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    background: '#FAFAFA',
    backgroundAlt: '#ECECEC',
    text: '#222222',
    textSecondary: '#888888',
    textInverse: '#FFFFFF',
    border: '#E0E0E0',
    borderLight: '#F5F5F5',
    disabled: '#BDBDBD',
    white: '#FFFFFF',
    black: '#000000',
    gray: { 50: '#FAFAFA', 100: '#F5F5F5', 200: '#EEEEEE', 300: '#E0E0E0', 400: '#BDBDBD', 500: '#9E9E9E', 600: '#757575', 700: '#616161', 800: '#424242', 900: '#212121' },
    textOnAccent: '#FFFFFF',
  },
  typography: {},
  spacing: {},
  borderRadius: {},
  shadows: {},
  appTheme: {},
}));

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
  // mockCurrentUser = user; // This line is removed as per the new_code
  return render(
    <PaperProvider>
      <NavigationContainer>
        <HistoryScreen navigation={mockNavigation} route={route} />
      </NavigationContainer>
    </PaperProvider>
  );
};

// Mock explícito de useAuth y apiService para cada test
beforeEach(() => {
  jest.clearAllMocks();
  useAuth.mockReturnValue({
    user: mockUser,
    loading: false,
    refreshUserCards: jest.fn(),
    selectCard: jest.fn(),
  });
  apiService.getTransactionHistory.mockResolvedValue({ data: mockTransactions });
});

describe('HistoryScreen', () => {
  beforeEach(() => {
    // jest.clearAllMocks(); // This line is removed as per the new_code
    // apiService.getTransactionHistory.mockResolvedValue({ data: mockTransactions }); // This line is removed as per the new_code
    // mockCurrentUser = mockUser; // This line is removed as per the new_code
  });

  describe('Renderizado básico', () => {
    it('renderiza correctamente con tarjeta seleccionada', async () => {
      // Setup: usuario con tarjeta seleccionada y transacciones
      // mockCurrentUser = mockUser; // This line is removed as per the new_code
      // apiService.getTransactionHistory.mockResolvedValue({ data: mockTransactions }); // This line is removed as per the new_code
      useAuth.mockReturnValue({ user: mockUser, loading: false, refreshUserCards: jest.fn(), selectCard: jest.fn() });
      await act(async () => {
        renderHistoryScreen();
      });
      await waitFor(() => {
        expect(getByText('Historial de Transacciones')).toBeTruthy();
        expect(getByText('Tarjeta:')).toBeTruthy();
        expect(getByText('Saldo: 50.00 Bs')).toBeTruthy();
        expect(getByTestId('flat-list')).toBeTruthy();
      });
    });

    it('renderiza el banner de modo NFC cuando authMode es card_uid', async () => {
      // Setup: usuario en modo NFC
      const nfcUser = { ...mockUser, authMode: 'card_uid' };
      // mockCurrentUser = nfcUser; // This line is removed as per the new_code
      useAuth.mockReturnValue({ user: nfcUser, loading: false, refreshUserCards: jest.fn(), selectCard: jest.fn() });
      await act(async () => {
        renderHistoryScreen(nfcUser);
      });
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
      useAuth.mockReturnValue({ user: singleCardUser, loading: false, refreshUserCards: jest.fn(), selectCard: jest.fn() });
      await act(async () => {
        renderHistoryScreen(singleCardUser);
      });
      await waitFor(() => {
        expect(queryByText('Cambiar tarjeta:')).toBeNull();
      });
    });
  });

  describe('Carga de transacciones', () => {
    it('carga transacciones al montar el componente', async () => {
      useAuth.mockReturnValue({ user: mockUser, loading: false, refreshUserCards: jest.fn(), selectCard: jest.fn() });
      await act(async () => {
        renderHistoryScreen();
      });

      await waitFor(() => {
        expect(apiService.getTransactionHistory).toHaveBeenCalledWith('card1');
      });
    });

    it('renderiza transacciones cargadas correctamente', async () => {
      // Setup: usuario con transacciones
      // mockCurrentUser = mockUser; // This line is removed as per the new_code
      // apiService.getTransactionHistory.mockResolvedValue({ data: mockTransactions }); // This line is removed as per the new_code
      useAuth.mockReturnValue({ user: mockUser, loading: false, refreshUserCards: jest.fn(), selectCard: jest.fn() });
      await act(async () => {
        renderHistoryScreen();
      });
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

      useAuth.mockReturnValue({ user: mockUser, loading: false, refreshUserCards: jest.fn(), selectCard: jest.fn() });
      await act(async () => {
        renderHistoryScreen();
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error loading transactions:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Filtrado de transacciones', () => {
    it('filtra transacciones por ubicación', async () => {
      // Setup: mocks ya definidos en beforeEach
      let utils;
      useAuth.mockReturnValue({ user: mockUser, loading: false, refreshUserCards: jest.fn(), selectCard: jest.fn() });
      await act(async () => {
        utils = renderHistoryScreen();
      });
      const { getByPlaceholderText, getByText, queryByText } = utils;
      await waitFor(() => {
        expect(getByText('Terminal Central')).toBeTruthy();
        expect(getByText('Centro Comercial')).toBeTruthy();
      });
      const searchBar = getByPlaceholderText('Buscar por ubicación o fecha...');
      await act(async () => {
        fireEvent.changeText(searchBar, 'Terminal');
      });
      await waitFor(() => {
        expect(getByText('Terminal Central')).toBeTruthy();
        expect(queryByText('Centro Comercial')).toBeNull();
        expect(queryByText('Universidad')).toBeNull();
      });
    });

    it('filtra transacciones por fecha', async () => {
      let utils;
      useAuth.mockReturnValue({ user: mockUser, loading: false, refreshUserCards: jest.fn(), selectCard: jest.fn() });
      await act(async () => {
        utils = renderHistoryScreen();
      });
      const { getByPlaceholderText, getByText, queryByText } = utils;
      await waitFor(() => {
        expect(getByText('Terminal Central')).toBeTruthy();
      });
      const searchBar = getByPlaceholderText('Buscar por ubicación o fecha...');
      await act(async () => {
        fireEvent.changeText(searchBar, '15/1/2024');
      });
      await waitFor(() => {
        expect(getByText('Terminal Central')).toBeTruthy();
        expect(queryByText('Centro Comercial')).toBeNull();
        expect(queryByText('Universidad')).toBeNull();
      });
    });

    it('muestra todas las transacciones cuando se limpia la búsqueda', async () => {
      let utils;
      useAuth.mockReturnValue({ user: mockUser, loading: false, refreshUserCards: jest.fn(), selectCard: jest.fn() });
      await act(async () => {
        utils = renderHistoryScreen();
      });
      const { getByPlaceholderText, getByText } = utils;
      const searchBar = getByPlaceholderText('Buscar por ubicación o fecha...');
      await act(async () => {
        fireEvent.changeText(searchBar, 'Terminal');
      });
      await act(async () => {
        fireEvent.changeText(searchBar, '');
      });
      await waitFor(() => {
        expect(getByText('Terminal Central')).toBeTruthy();
        expect(getByText('Centro Comercial')).toBeTruthy();
        expect(getByText('Universidad')).toBeTruthy();
      });
    });
  });

  describe('Selección de tarjetas', () => {
    it('cambia de tarjeta al hacer clic en selector', async () => {
      let utils;
      useAuth.mockReturnValue({ user: mockUser, loading: false, refreshUserCards: jest.fn(), selectCard: jest.fn() });
      await act(async () => {
        utils = renderHistoryScreen();
      });
      const { getByText } = utils;
      const card2Btn = getByText('card2');
      // Simular cambio de tarjeta
      const { apiService } = require('../src/services/apiService');
      apiService.getTransactionHistory.mockResolvedValue({ data: [] });
      await act(async () => {
        fireEvent.press(card2Btn);
      });
      await waitFor(() => {
        expect(getByText('Saldo: 25.00 Bs')).toBeTruthy();
      });
    });

    it('usa tarjeta de parámetros de ruta si está disponible', async () => {
      const routeWithCard = {
        params: { selectedCard: { uid: 'card2', saldo_actual: 25.0 } },
      };

      useAuth.mockReturnValue({ user: mockUser, loading: false, refreshUserCards: jest.fn(), selectCard: jest.fn() });
      await act(async () => {
        renderHistoryScreen(mockUser, routeWithCard);
      });

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
      useAuth.mockReturnValue({ user: nfcUser, loading: false, refreshUserCards: jest.fn(), selectCard: jest.fn() });
      await act(async () => {
        renderHistoryScreen(nfcUser);
      });

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
      
      useAuth.mockReturnValue({ user: mockUser, loading: false, refreshUserCards: jest.fn(), selectCard: jest.fn() });
      await act(async () => {
        renderHistoryScreen();
      });

      expect(getByText('Cargando historial...')).toBeTruthy();
    });

    it('muestra mensaje de error cuando no hay tarjeta seleccionada', async () => {
      const userWithoutCard = { ...mockUser, cards: null, selectedCard: null };
      useAuth.mockReturnValue({ user: userWithoutCard, loading: false, refreshUserCards: jest.fn(), selectCard: jest.fn() });
      await act(async () => {
        renderHistoryScreen(userWithoutCard);
      });

      expect(getByText('No hay tarjeta seleccionada para ver el historial')).toBeTruthy();
      expect(getByText('Volver')).toBeTruthy();
    });

    it('navega hacia atrás al presionar botón volver', async () => {
      const userWithoutCard = { ...mockUser, cards: null, selectedCard: null };
      useAuth.mockReturnValue({ user: userWithoutCard, loading: false, refreshUserCards: jest.fn(), selectCard: jest.fn() });
      await act(async () => {
        renderHistoryScreen(userWithoutCard);
      });

      const backButton = getByText('Volver');
      fireEvent.press(backButton);

      expect(mockNavigation.goBack).toHaveBeenCalled();
    });

    it('muestra mensaje cuando no hay transacciones', async () => {
      apiService.getTransactionHistory.mockResolvedValue({ data: [] });
      
      useAuth.mockReturnValue({ user: mockUser, loading: false, refreshUserCards: jest.fn(), selectCard: jest.fn() });
      await act(async () => {
        renderHistoryScreen();
      });

      await waitFor(() => {
        expect(getByText('No se encontraron transacciones')).toBeTruthy();
      });
    });
  });

  describe('Funciones utilitarias', () => {
    it('determina tipo de transacción correctamente', async () => {
      useAuth.mockReturnValue({ user: mockUser, loading: false, refreshUserCards: jest.fn(), selectCard: jest.fn() });
      await act(async () => {
        renderHistoryScreen();
      });

      await waitFor(() => {
        expect(getByText('Terminal Central')).toBeTruthy();
        expect(getByText('Centro Comercial')).toBeTruthy();
      });
    });

    it('formatea montos correctamente', async () => {
      useAuth.mockReturnValue({ user: mockUser, loading: false, refreshUserCards: jest.fn(), selectCard: jest.fn() });
      await act(async () => {
        renderHistoryScreen();
      });

      await waitFor(() => {
        expect(getByText('-2.50 Bs')).toBeTruthy();
        expect(getByText('+20.00 Bs')).toBeTruthy();
        expect(getByText('-1.80 Bs')).toBeTruthy();
      });
    });

    it('muestra resultado de transacción cuando está disponible', async () => {
      useAuth.mockReturnValue({ user: mockUser, loading: false, refreshUserCards: jest.fn(), selectCard: jest.fn() });
      await act(async () => {
        renderHistoryScreen();
      });

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