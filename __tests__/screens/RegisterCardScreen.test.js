import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import RegisterCardScreen from '../../src/screens/RegisterCardScreen';
import { AuthContext } from '../../src/context/AuthContext';
import { apiService } from '../../src/services/apiService';
import { Alert } from 'react-native';

// Mock del apiService
jest.mock('../../src/services/apiService');

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

const mockUser = {
  id: '123',
  nombre: 'Test User',
  tipo_tarjeta: 'adulto',
  email: 'test@example.com',
};

const mockAuthContext = {
  user: mockUser,
  refreshUserCards: jest.fn(),
};

const renderWithProviders = (component) => {
  return render(
    <PaperProvider>
      <NavigationContainer>
        <AuthContext.Provider value={mockAuthContext}>
          {component}
        </AuthContext.Provider>
      </NavigationContainer>
    </PaperProvider>
  );
};

describe('RegisterCardScreen', () => {
  // Mockear Alert.alert globalmente y limpiar entre tests
  beforeAll(() => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería renderizar correctamente la pantalla de registro', () => {
    const { getByText } = renderWithProviders(<RegisterCardScreen navigation={mockNavigation} />);
    expect(getByText('Nueva Tarjeta')).toBeTruthy();
    expect(getByText('Registra tu tarjeta NFC')).toBeTruthy();
  });

  it('debería mostrar información del usuario', () => {
    const { getByText, getAllByText } = renderWithProviders(<RegisterCardScreen navigation={mockNavigation} />);
    expect(getByText('Test User')).toBeTruthy();
    // Buscar el Chip con '👤 Adulto'
    expect(getAllByText(/👤\s*Adulto/).length).toBeGreaterThan(0);
  });

  it('debería deshabilitar el botón de registro si el UID es menor a 4 caracteres', () => {
    const { getByPlaceholderText, getByTestId } = renderWithProviders(<RegisterCardScreen navigation={mockNavigation} />);
    const uidInput = getByPlaceholderText('Ej: A1B2C3D4');
    fireEvent.changeText(uidInput, 'A1');
    const registerButton = getByTestId('register-btn');
    expect(registerButton.props.accessibilityState.disabled).toBe(true);
  });

  it('debería registrar tarjeta exitosamente', async () => {
    apiService.addCardToUser.mockResolvedValue({
      success: true,
      data: { uid: 'A1B2C3D4', alias: 'Mi Tarjeta' }
    });

    const { getByText, getByPlaceholderText } = renderWithProviders(
      <RegisterCardScreen navigation={mockNavigation} />
    );

    const uidInput = getByPlaceholderText('Ej: A1B2C3D4');
    const aliasInput = getByPlaceholderText('Ej: Mi Tarjeta Principal');

    fireEvent.changeText(uidInput, 'A1B2C3D4');
    fireEvent.changeText(aliasInput, 'Mi Tarjeta Principal');

    const registerButton = getByText('Registrar Tarjeta');
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(apiService.addCardToUser).toHaveBeenCalledWith('123', {
        uid: 'A1B2C3D4',
        alias: 'Mi Tarjeta Principal',
        tipo_tarjeta: 'adulto',
        saldo_inicial: 0,
      });
    });

    await waitFor(() => {
      expect(mockAuthContext.refreshUserCards).toHaveBeenCalled();
    });
  });

  it('debería manejar error de registro', async () => {
    apiService.addCardToUser.mockResolvedValue({
      success: false,
      error: 'Tarjeta ya registrada'
    });

    const { getByText, getByPlaceholderText } = renderWithProviders(
      <RegisterCardScreen navigation={mockNavigation} />
    );

    const uidInput = getByPlaceholderText('Ej: A1B2C3D4');
    fireEvent.changeText(uidInput, 'A1B2C3D4');

    const registerButton = getByText('Registrar Tarjeta');
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Tarjeta ya registrada');
    });
  });

  it('debería mostrar resumen cuando se ingresa UID', () => {
    const { getByPlaceholderText, getByText, getAllByText } = renderWithProviders(<RegisterCardScreen navigation={mockNavigation} />);
    // Inicialmente no debe mostrar resumen
    expect(() => getByText('Resumen de Registro')).toThrow();
    const uidInput = getByPlaceholderText('Ej: A1B2C3D4');
    fireEvent.changeText(uidInput, 'A1B2C3D4');
    // Ahora debe mostrar resumen
    expect(getByText('Resumen de Registro')).toBeTruthy();
    expect(getAllByText('A1 B2 C3 D4').length).toBeGreaterThan(0);
    expect(getAllByText('Adulto').length).toBeGreaterThan(0);
    expect(getByText('0.00 Bs')).toBeTruthy();
  });

  it('debería cambiar tipo de tarjeta', () => {
    const { getByText } = renderWithProviders(
      <RegisterCardScreen navigation={mockNavigation} />
    );

    const estudianteButton = getByText('Estudiante');
    fireEvent.press(estudianteButton);

    expect(getByText('Estudiante')).toBeTruthy();
  });

  it('debería validar saldo inicial negativo', async () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <RegisterCardScreen navigation={mockNavigation} />
    );

    const uidInput = getByPlaceholderText('Ej: A1B2C3D4');
    const saldoInput = getByPlaceholderText('0.00');

    // Ingresar UID válido para habilitar el botón
    fireEvent.changeText(uidInput, 'A1B2C3D4');
    fireEvent.changeText(saldoInput, '-10');

    const registerButton = getByText('Registrar Tarjeta');
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'El saldo inicial no puede ser negativo');
    });
  });

  it('debería cancelar registro', () => {
    const { getByText } = renderWithProviders(
      <RegisterCardScreen navigation={mockNavigation} />
    );

    const cancelButton = getByText('Cancelar');
    fireEvent.press(cancelButton);

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
}); 