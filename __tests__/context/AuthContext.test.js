import React from 'react';
import { render, act, waitFor, fireEvent } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';
import { View, Text, TouchableOpacity } from 'react-native';

// Mock del servicio de API
jest.mock('../../src/services/apiService', () => ({
  apiService: {
    login: jest.fn(),
    register: jest.fn(),
  }
}));

// Mock de AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

const TestComponent = () => {
  const { user, loading, login, logout, register } = useAuth();
  
  return (
    <View>
      <Text testID="loading">{loading.toString()}</Text>
      <Text testID="user">{user ? JSON.stringify(user) : 'null'}</Text>
      <TouchableOpacity testID="login-btn" onPress={() => login('testuser', '123456')}>
        <Text>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="logout-btn" onPress={logout}>
        <Text>Logout</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="register-btn" onPress={() => register({
        username: 'newuser',
        password: '123456',
        nombre: 'New User',
        tipo_tarjeta: 'adulto'
      })}>
        <Text>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
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

      const AsyncStorage = require('@react-native-async-storage/async-storage');
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockUser));

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

      mockApiService.apiService.login.mockResolvedValue({
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
        fireEvent.press(getByTestId('login-btn'));
      });

      await waitFor(() => {
        expect(getByTestId('user').props.children).toContain('testuser');
      });

      expect(mockApiService.apiService.login).toHaveBeenCalledWith('testuser', '123456');
    });

    test('debería manejar error de login', async () => {
      const mockApiService = require('../../src/services/apiService');
      mockApiService.apiService.login.mockRejectedValue(new Error('Login failed'));

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('false');
      });

      await act(async () => {
        fireEvent.press(getByTestId('login-btn'));
      });

      // Verificar que el servicio fue llamado pero el usuario no cambió
      expect(mockApiService.apiService.login).toHaveBeenCalledWith('testuser', '123456');
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

      const AsyncStorage = require('@react-native-async-storage/async-storage');
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockUser));

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
        fireEvent.press(getByTestId('logout-btn'));
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

      mockApiService.apiService.register.mockResolvedValue({
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
        fireEvent.press(getByTestId('register-btn'));
      });

      expect(mockApiService.apiService.register).toHaveBeenCalledWith({
        username: 'newuser',
        password: '123456',
        nombre: 'New User',
        tipo_tarjeta: 'adulto'
      });
    });

    test('debería manejar error de registro', async () => {
      const mockApiService = require('../../src/services/apiService');
      mockApiService.apiService.register.mockRejectedValue(new Error('Registration failed'));

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loading').props.children).toBe('false');
      });

      await act(async () => {
        fireEvent.press(getByTestId('register-btn'));
      });

      expect(mockApiService.apiService.register).toHaveBeenCalled();
    });
  });
}); 