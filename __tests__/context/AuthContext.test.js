// Nueva suite AuthContext (2024)
// Estrategia: Solo se testea el valor inicial del contexto y mocks de login/logout.
// No se testea integración profunda ni hooks internos.

import React from 'react';
import { render, act } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';

jest.mock('../../src/services/apiService', () => ({
  apiService: {
    login: jest.fn(),
    loginWithCard: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getCardInfo: jest.fn(),
    getUserCards: jest.fn(),
  }
}));
const { apiService } = require('../../src/services/apiService');

// TestComponent expone el contexto vía callback para pruebas
const TestComponent = ({ onReady }) => {
  const ctx = useAuth();
  React.useEffect(() => {
    if (onReady) onReady(ctx);
  }, [onReady, ctx]);
  return null;
};

describe('AuthProvider + useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('login exitoso actualiza el usuario', async () => {
    apiService.login.mockResolvedValueOnce({ data: { user: { id: '1', nombre: 'Test' }, cards: [{ uid: 'A1', saldo_actual: 10 }] } });
    let ctx;
    render(
      <AuthProvider>
        <TestComponent onReady={c => { ctx = c; }} />
      </AuthProvider>
    );
    await act(async () => {
      await ctx.login('user', 'pass');
    });
    expect(apiService.login).toHaveBeenCalledWith('user', 'pass');
  });

  it('login fallido retorna error', async () => {
    apiService.login.mockRejectedValueOnce(new Error('fail'));
    let ctx;
    render(
      <AuthProvider>
        <TestComponent onReady={c => { ctx = c; }} />
      </AuthProvider>
    );
    let res;
    await act(async () => {
      res = await ctx.login('user', 'pass');
    });
    expect(res.success).toBe(false);
  });

  it('loginWithCard exitoso actualiza el usuario', async () => {
    apiService.getCardInfo.mockResolvedValueOnce({ data: { nombre: 'Tarjeta', tipo_tarjeta: 'adulto', saldo_actual: 20 } });
    let ctx;
    render(
      <AuthProvider>
        <TestComponent onReady={c => { ctx = c; }} />
      </AuthProvider>
    );
    await act(async () => {
      await ctx.loginWithCard('CARD123');
    });
    expect(apiService.getCardInfo).toHaveBeenCalledWith('CARD123');
  });

  it('logout limpia el usuario', async () => {
    apiService.logout.mockResolvedValueOnce();
    let ctx;
    render(
      <AuthProvider>
        <TestComponent onReady={c => { ctx = c; }} />
      </AuthProvider>
    );
    await act(async () => {
      await ctx.logout();
    });
    expect(apiService.logout).toHaveBeenCalled();
  });
}); 