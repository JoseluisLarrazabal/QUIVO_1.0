// Mock del hook useAuth para todos los screens
jest.mock('../../src/context/AuthContext', () => {
  const originalModule = jest.requireActual('../../src/context/AuthContext');
  return {
    ...originalModule,
    useAuth: () => ({
      user: baseUser,
      loading: false,
      login: mockLogin,
      logout: mockLogout,
      refreshUserCards: mockRefreshUserCards,
    }),
  };
});

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { AuthContext } from '../../src/context/AuthContext';
import LoginScreen from '../../src/screens/LoginScreen';
import DashboardScreen from '../../src/screens/DashboardScreen';
import RechargeScreen from '../../src/screens/RechargeScreen';
import HistoryScreen from '../../src/screens/HistoryScreen';

// Mocks de navegación
const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockGoBack = jest.fn();

const navigation = {
  navigate: mockNavigate,
  replace: mockReplace,
  goBack: mockGoBack,
};

// Mocks de servicios y contexto
const mockLogin = jest.fn();
const mockLogout = jest.fn();
const mockRefreshUserCards = jest.fn();
const mockRecharge = jest.fn();

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
  ],
};

const mockTransactions = [
  {
    id: 1,
    ubicacion: 'Terminal Central',
    fecha_hora: '2024-01-15T10:30:00Z',
    monto: -2.5,
    resultado: 'Exitoso',
  },
  {
    id: 2,
    ubicacion: 'Centro Comercial',
    fecha_hora: '2024-01-14T15:45:00Z',
    monto: 10.0,
    resultado: 'Exitoso',
  },
];

jest.mock('../../src/services/apiService', () => ({
  apiService: {
    getTransactionHistory: jest.fn(() => Promise.resolve({ data: mockTransactions })),
    rechargeCard: jest.fn(() => Promise.resolve({ success: true, nuevo_saldo: 45.5 })),
  },
}));


describe('Flujo de integración: login → dashboard → recarga → historial → logout', () => {
  let alertCallCount;
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogin.mockResolvedValue({ success: true, user: baseUser });
    alertCallCount = 0;
    jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
      alertCallCount++;
      // Ejecutar el handler de confirmación solo en la primera llamada (confirmación)
      if (alertCallCount === 1) {
        const confirm = buttons && buttons.find(b => b.text === 'Confirmar');
        if (confirm && typeof confirm.onPress === 'function') {
          confirm.onPress();
        }
      }
    });
  });

  it('flujo completo de usuario (renders independientes)', async () => {
    // Paso 1: Login exitoso
    const loginUtils = render(
      <AuthContext.Provider value={{ login: mockLogin, user: null, loading: false }}>
        <LoginScreen />
      </AuthContext.Provider>
    );
    fireEvent.changeText(loginUtils.getByPlaceholderText('Ej: juan.perez'), 'juan');
    fireEvent.changeText(loginUtils.getByPlaceholderText('Ingresa tu contraseña'), '1234');
    await act(async () => {
      fireEvent.press(loginUtils.getByText('Ingresar'));
    });
    expect(mockLogin).toHaveBeenCalledWith('juan', '1234');

    // Paso 2: Dashboard
    const dashboardUtils = render(
      <AuthContext.Provider value={{
        user: baseUser,
        loading: false,
        logout: mockLogout,
        refreshUserCards: mockRefreshUserCards,
      }}>
        <DashboardScreen navigation={navigation} />
      </AuthContext.Provider>
    );
    await waitFor(() => {
      expect(dashboardUtils.getByText('¡Hola, Juan Pérez!')).toBeTruthy();
      expect(dashboardUtils.getByText('Recargar')).toBeTruthy();
    });
    fireEvent.press(dashboardUtils.getByText('Recargar'));
    expect(mockNavigate).toHaveBeenCalledWith('Recharge', expect.anything());

    // Paso 3: Recarga
    const rechargeUtils = render(
      <AuthContext.Provider value={{
        user: baseUser,
        loading: false,
        logout: mockLogout,
        refreshUserCards: mockRefreshUserCards,
      }}>
        <RechargeScreen navigation={navigation} route={{ params: { selectedCard: baseUser.cards[0] } }} />
      </AuthContext.Provider>
    );
    fireEvent.changeText(rechargeUtils.getByPlaceholderText('0.00'), '20');
    // Esperar a que el botón esté habilitado
    const recargarBtn = await waitFor(() => {
      const btn = rechargeUtils.getByTestId('recharge-btn');
      if (btn.props.accessibilityState && btn.props.accessibilityState.disabled) {
        throw new Error('Botón aún deshabilitado');
      }
      return btn;
    });
    await act(async () => {
      fireEvent.press(recargarBtn);
    });
    // Esperar a que haya dos llamadas a Alert.alert
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledTimes(2);
    });
    // Verificar la primera llamada (confirmación)
    const [confirmTitle, confirmMsg] = Alert.alert.mock.calls[0];
    expect(confirmTitle).toBe('Confirmar Recarga');
    expect(confirmMsg).toEqual(expect.stringContaining('20.00 Bs'));
    // Verificar la segunda llamada (éxito)
    const [successTitle, successMsg, successButtons] = Alert.alert.mock.calls[1];
    expect(successTitle).toBe('Recarga Exitosa');
    expect(successMsg).toEqual(expect.stringContaining('20'));
    // Simular presionar 'OK' en el Alert de éxito
    const okBtn = successButtons && successButtons.find(b => b.text === 'OK');
    expect(okBtn).toBeDefined();
    if (okBtn && typeof okBtn.onPress === 'function') {
      okBtn.onPress();
    }
    expect(navigation.goBack).toHaveBeenCalled();

    // Paso 4: Historial
    const historyUtils = render(
      <AuthContext.Provider value={{
        user: baseUser,
        loading: false,
        logout: mockLogout,
        refreshUserCards: mockRefreshUserCards,
      }}>
        <HistoryScreen navigation={navigation} route={{ params: { selectedCard: baseUser.cards[0] } }} />
      </AuthContext.Provider>
    );
    await waitFor(() => {
      expect(historyUtils.getByText('Historial de Transacciones')).toBeTruthy();
      expect(historyUtils.getByText('Terminal Central')).toBeTruthy();
      expect(historyUtils.getByText('Centro Comercial')).toBeTruthy();
    });

    // Paso 5: Logout
    const dashboardUtils2 = render(
      <AuthContext.Provider value={{
        user: baseUser,
        loading: false,
        logout: mockLogout,
        refreshUserCards: mockRefreshUserCards,
      }}>
        <DashboardScreen navigation={navigation} />
      </AuthContext.Provider>
    );
    fireEvent.press(dashboardUtils2.getByTestId('logout-btn'));
    expect(mockLogout).toHaveBeenCalled();
  });
}); 