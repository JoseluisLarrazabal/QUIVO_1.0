import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthState = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isInitialized = useRef(false);

  const checkAuthState = useCallback(async () => {
    if (isInitialized.current) return;
    
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser && parsedUser.id && parsedUser.nombre) {
          setUser(parsedUser);
        } else {
          await AsyncStorage.removeItem('user');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      try {
        await AsyncStorage.removeItem('user');
      } catch (clearError) {
        console.error('Error clearing storage:', clearError);
      }
      setUser(null);
    } finally {
      setLoading(false);
      isInitialized.current = true;
    }
  }, []);

  const setUserAndStorage = useCallback(async (userData) => {
    try {
      if (userData) {
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      } else {
        await AsyncStorage.removeItem('user');
      }
      setUser(userData);
    } catch (error) {
      console.error('Error updating user state:', error);
      setUser(userData); // Actualizar estado incluso si falla el storage
    }
  }, []);

  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  return {
    user,
    loading,
    setUser: setUserAndStorage,
    checkAuthState
  };
}; 