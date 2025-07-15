import { renderHook, act } from '@testing-library/react-hooks';
import { useAuthState } from '../../src/hooks/useAuthState';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('useAuthState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debería iniciar con usuario null y loading true', () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    const { result } = renderHook(() => useAuthState());
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  test('debería actualizar usuario y loading en login/logout', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    const { result } = renderHook(() => useAuthState());
    
    await act(async () => {
      await result.current.setUser({ username: 'testuser' });
    });
    
    expect(result.current.user).toEqual({ username: 'testuser' });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify({ username: 'testuser' }));
    
    await act(async () => {
      await result.current.setUser(null);
    });
    
    expect(result.current.user).toBeNull();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
  });
}); 