// Nueva suite useAuthState (2024)
// Estrategia: Solo se testea el valor inicial y un cambio de estado simulado.
// No se testea integración profunda ni dependencias de AsyncStorage.

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAuthState } from '../../src/hooks/useAuthState';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));
const AsyncStorage = require('@react-native-async-storage/async-storage');

describe('useAuthState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devuelve el estado inicial y permite cambiar loading', () => {
    const { result } = renderHook(() => useAuthState());
    expect(result.current.loading).toBe(true);
    expect(typeof result.current.loading).toBe('boolean');
  });

  it('carga usuario válido desde AsyncStorage', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({ id: '1', nombre: 'Test' }));
    const { result } = renderHook(() => useAuthState());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toEqual({ id: '1', nombre: 'Test' });
  });

  it('borra usuario inválido de AsyncStorage', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({ foo: 'bar' }));
    const { result } = renderHook(() => useAuthState());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
    expect(result.current.user).toBe(null);
  });

  it('setUser guarda y borra usuario', async () => {
    const { result } = renderHook(() => useAuthState());
    await act(async () => {
      await result.current.setUser({ id: '2', nombre: 'Nuevo' });
    });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify({ id: '2', nombre: 'Nuevo' }));
    await act(async () => {
      await result.current.setUser(null);
    });
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
  });

  it('maneja error en AsyncStorage.getItem', async () => {
    AsyncStorage.getItem.mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => useAuthState());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBe(null);
  });
}); 