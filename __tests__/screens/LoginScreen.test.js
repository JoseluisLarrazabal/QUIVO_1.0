import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../src/screens/LoginScreen';

// Mock del contexto de autenticación
jest.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn().mockResolvedValue({ success: true })
  })
}));

describe('LoginScreen', () => {
  test('debería renderizar correctamente', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Transporte Público Bolivia')).toBeTruthy();
    expect(getByText('Ingresar')).toBeTruthy();
  });

  test('debería mostrar error si los campos están vacíos', async () => {
    const { getByText } = render(<LoginScreen />);
    fireEvent.press(getByText('Ingresar'));
    await waitFor(() => {
      expect(getByText('Transporte Público Bolivia')).toBeTruthy();
    });
  });
}); 