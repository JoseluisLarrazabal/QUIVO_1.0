import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { AuthContext } from '../../src/context/AuthContext';
import LoginScreen from '../../src/screens/LoginScreen';

const mockLogin = jest.fn();
const mockLoginWithCard = jest.fn();

const renderWithAuth = (props = {}) => {
  return render(
    <AuthContext.Provider value={{
      login: mockLogin,
      loginWithCard: mockLoginWithCard,
      ...props
    }}>
      <LoginScreen />
    </AuthContext.Provider>
  );
};

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza campos de usuario y contraseña por defecto', () => {
    const { getByPlaceholderText, getByText } = renderWithAuth();
    expect(getByPlaceholderText('Ej: juan.perez')).toBeTruthy();
    expect(getByPlaceholderText('Ingresa tu contraseña')).toBeTruthy();
    expect(getByText('Ingresar')).toBeTruthy();
    expect(getByText('Credenciales')).toBeTruthy();
    expect(getByText('Tarjeta NFC')).toBeTruthy();
  });

  it('cambia a modo tarjeta y limpia campos', () => {
    const { getByText, getByPlaceholderText, queryByPlaceholderText } = renderWithAuth();
    fireEvent.press(getByText('Tarjeta NFC'));
    expect(getByPlaceholderText('Ej: A1B2C3D4')).toBeTruthy();
    expect(queryByPlaceholderText('Ej: juan.perez')).toBeNull();
    expect(queryByPlaceholderText('Ingresa tu contraseña')).toBeNull();
  });

  it('cambia a modo credenciales y limpia campos', () => {
    const { getByText, getByPlaceholderText, queryByPlaceholderText } = renderWithAuth();
    fireEvent.press(getByText('Tarjeta NFC'));
    fireEvent.press(getByText('Credenciales'));
    expect(getByPlaceholderText('Ej: juan.perez')).toBeTruthy();
    expect(getByPlaceholderText('Ingresa tu contraseña')).toBeTruthy();
    expect(queryByPlaceholderText('Ej: A1B2C3D4')).toBeNull();
  });

  it('valida campos vacíos en modo credenciales', async () => {
    jest.spyOn(Alert, 'alert');
    const { getByText } = renderWithAuth();
    fireEvent.press(getByText('Ingresar'));
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Por favor ingresa tu usuario y contraseña');
  });

  it('valida campo vacío en modo tarjeta', async () => {
    jest.spyOn(Alert, 'alert');
    const { getByText } = renderWithAuth();
    fireEvent.press(getByText('Tarjeta NFC'));
    fireEvent.press(getByText('Ingresar'));
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Por favor ingresa el UID de tu tarjeta');
  });

  it('llama login con usuario y contraseña', async () => {
    mockLogin.mockResolvedValue({ success: true });
    const { getByPlaceholderText, getByText } = renderWithAuth();
    fireEvent.changeText(getByPlaceholderText('Ej: juan.perez'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Ingresa tu contraseña'), '1234');
    await act(async () => {
      fireEvent.press(getByText('Ingresar'));
    });
    expect(mockLogin).toHaveBeenCalledWith('testuser', '1234');
  });

  it('llama loginWithCard con UID', async () => {
    mockLoginWithCard.mockResolvedValue({ success: true });
    const { getByText, getByPlaceholderText } = renderWithAuth();
    fireEvent.press(getByText('Tarjeta NFC'));
    fireEvent.changeText(getByPlaceholderText('Ej: A1B2C3D4'), 'A1B2C3D4');
    await act(async () => {
      fireEvent.press(getByText('Ingresar'));
    });
    expect(mockLoginWithCard).toHaveBeenCalledWith('A1B2C3D4');
  });

  it('muestra Alert si login falla', async () => {
    jest.spyOn(Alert, 'alert');
    mockLogin.mockResolvedValue({ success: false, error: 'Credenciales incorrectas' });
    const { getByPlaceholderText, getByText } = renderWithAuth();
    fireEvent.changeText(getByPlaceholderText('Ej: juan.perez'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Ingresa tu contraseña'), 'wrong');
    await act(async () => {
      fireEvent.press(getByText('Ingresar'));
    });
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Credenciales incorrectas');
  });

  it('muestra estado de carga en el botón', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));
    const { getByPlaceholderText, getByText } = renderWithAuth();
    fireEvent.changeText(getByPlaceholderText('Ej: juan.perez'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Ingresa tu contraseña'), '1234');
    await act(async () => {
      fireEvent.press(getByText('Ingresar'));
    });
    expect(getByText('Verificando...')).toBeTruthy();
  });

  it('muestra el texto de ayuda correcto según el modo', () => {
    const { getByText } = renderWithAuth();
    expect(getByText('¿No tienes cuenta? Contacta al administrador del sistema.')).toBeTruthy();
    fireEvent.press(getByText('Tarjeta NFC'));
    expect(getByText('Coloca tu tarjeta cerca del dispositivo para leer el UID automáticamente.')).toBeTruthy();
  });
}); 