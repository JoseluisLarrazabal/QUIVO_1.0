import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';

// Mock del servicio de API
jest.mock('../../src/services/apiService', () => ({
  login: jest.fn(),
  register: jest.fn(),
}));

const TestComponent = () => {
  const { user, loading, login, logout, register } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <button data-testid="login-btn" onPress={() => login('testuser', '123456')}>
        Login
      </button>
      <button data-testid="logout-btn" onPress={logout}>
        Logout
      </button>
      <button data-testid="register-btn" onPress={() => register({
        username: 'newuser',
        password: '123456',
        nombre: 'New User',
        tipo_tarjeta: 'adulto'
      })}>
        Register
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    AsyncStorage.clear();
    jest.clearAllMocks();
  });

  describe('Estado inicial', () => {
    test('debería iniciar con usuario null y loading true', async () => {
      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(getByTestId('loading').props.children).toBe('true');
      expect(getByTestId('user').props.children).toBe('null');
    });

    test('debería cargar usuario desde AsyncStorage si existe', async () => {
      const mockUser = {
        id: '123',
        username: 'testuser',
        nombre: 'Test User',
        tipo_tarjeta: 'adulto'
      };

      await AsyncStorage.setItem('user', JSON.stringify(mockUser));

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('false');
      });

      expect(getByTestId('user').props.children).toContain('testuser');
    });
  });

  describe('Login', () => {
    test('debería hacer login exitosamente', async () => {
      const mockApiService = require('../../src/services/apiService');
      const mockUser = {
        id: '123',
        username: 'testuser',
        nombre: 'Test User',
        tipo_tarjeta: 'adulto',
        cards: [{ uid: 'A1B2C3D4', saldo_actual: 25.00 }]
      };

      mockApiService.login.mockResolvedValue({
        success: true,
        data: {
          user: mockUser,
          cards: mockUser.cards
        }
      });

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('false');
      });

      await act(async () => {
        getByTestId('login-btn').props.onPress();
      });

      await waitFor(() => {
        expect(getByTestId('user').props.children).toContain('testuser');
      });

      expect(mockApiService.login).toHaveBeenCalledWith('testuser', '123456');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
    });

    test('debería manejar error de login', async () => {
      const mockApiService = require('../../src/services/apiService');
      mockApiService.login.mockRejectedValue(new Error('Login failed'));

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('false');
      });

      await act(async () => {
        getByTestId('login-btn').props.onPress();
      });

      await waitFor(() => {
        expect(getByTestId('user').props.children).toBe('null');
      });
    });
  });

  describe('Logout', () => {
    test('debería hacer logout correctamente', async () => {
      const mockUser = {
        id: '123',
        username: 'testuser',
        nombre: 'Test User',
        tipo_tarjeta: 'adulto'
      };

      await AsyncStorage.setItem('user', JSON.stringify(mockUser));

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('false');
        expect(getByTestId('user').props.children).toContain('testuser');
      });

      await act(async () => {
        getByTestId('logout-btn').props.onPress();
      });

      await waitFor(() => {
        expect(getByTestId('user').props.children).toBe('null');
      });

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('Register', () => {
    test('debería registrar usuario exitosamente', async () => {
      const mockApiService = require('../../src/services/apiService');
      const mockUser = {
        id: '123',
        username: 'newuser',
        nombre: 'New User',
        tipo_tarjeta: 'adulto'
      };

      mockApiService.register.mockResolvedValue({
        success: true,
        data: {
          user: mockUser
        }
      });

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('false');
      });

      await act(async () => {
        getByTestId('register-btn').props.onPress();
      });

      expect(mockApiService.register).toHaveBeenCalledWith({
        username: 'newuser',
        password: '123456',
        nombre: 'New User',
        tipo_tarjeta: 'adulto'
      });
    });

    test('debería manejar error de registro', async () => {
      const mockApiService = require('../../src/services/apiService');
      mockApiService.register.mockRejectedValue(new Error('Registration failed'));

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('false');
      });

      await act(async () => {
        getByTestId('register-btn').props.onPress();
      });

      // No debería cambiar el estado del usuario
      expect(getByTestId('user').props.children).toBe('null');
    });
  });

  describe('Persistencia', () => {
    test('debería persistir usuario en AsyncStorage después del login', async () => {
      const mockApiService = require('../../src/services/apiService');
      const mockUser = {
        id: '123',
        username: 'testuser',
        nombre: 'Test User',
        tipo_tarjeta: 'adulto'
      };

      mockApiService.login.mockResolvedValue({
        success: true,
        data: {
          user: mockUser,
          cards: []
        }
      });

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('false');
      });

      await act(async () => {
        getByTestId('login-btn').props.onPress();
      });

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
      });
    });

    test('debería limpiar AsyncStorage después del logout', async () => {
      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('false');
      });

      await act(async () => {
        getByTestId('logout-btn').props.onPress();
      });

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });
}); 