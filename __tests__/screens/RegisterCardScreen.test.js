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
  beforeAll(() => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  beforeEach(() => {
    jest.clearAllMocks();
    Alert.alert.mockClear();
  });

  it('debería renderizar correctamente', () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <RegisterCardScreen navigation={mockNavigation} />
    );

    expect(getByText('Registrar Nueva Tarjeta')).toBeTruthy();
    expect(getByText('Agrega una nueva tarjeta NFC a tu cuenta')).toBeTruthy();
    expect(getByText('Tu Información')).toBeTruthy();
    expect(getByText('Test User')).toBeTruthy();
    expect(getByPlaceholderText('Ej: A1B2C3D4')).toBeTruthy();
    expect(getByPlaceholderText('Ej: Mi Tarjeta Principal')).toBeTruthy();
  });

  it('debería mostrar información del usuario', () => {
    const { getByText } = renderWithProviders(
      <RegisterCardScreen navigation={mockNavigation} />
    );

    expect(getByText('Test User')).toBeTruthy();
    expect(getByText('Tipo: Adulto')).toBeTruthy();
  });

  it('debería validar UID mínimo de 4 caracteres', async () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <RegisterCardScreen navigation={mockNavigation} />
    );

    const uidInput = getByPlaceholderText('Ej: A1B2C3D4');
    // Ingresar un UID de 3 caracteres para habilitar el botón y disparar la validación
    fireEvent.changeText(uidInput, 'ABC');

    const registerButton = getByText('Registrar Tarjeta');
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'El UID debe tener al menos 4 caracteres');
    });
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
    const { getByText, getByPlaceholderText, queryByText, getAllByText } = renderWithProviders(
      <RegisterCardScreen navigation={mockNavigation} />
    );

    // Inicialmente no debe mostrar resumen
    expect(queryByText('Resumen')).toBeNull();

    const uidInput = getByPlaceholderText('Ej: A1B2C3D4');
    fireEvent.changeText(uidInput, 'A1B2C3D4');

    // Ahora debe mostrar resumen
    expect(getByText('Resumen')).toBeTruthy();
    expect(getByText('A1B2C3D4')).toBeTruthy();
    expect(getAllByText('Adulto')).toHaveLength(2); // Aparece en la info del usuario y en el resumen
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