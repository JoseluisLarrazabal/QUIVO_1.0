import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService } from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        // Validar que los datos del usuario sean válidos
        if (parsedUser && parsedUser.id && parsedUser.nombre) {
          setUser(parsedUser);
        } else {
          // Si los datos no son válidos, limpiar el storage
          await AsyncStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      // En caso de error, limpiar el storage
      try {
        await AsyncStorage.removeItem('user');
      } catch (clearError) {
        console.error('Error clearing storage:', clearError);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      if (!username || !password) {
        return { success: false, error: 'Usuario y contraseña son requeridos' };
      }

      const response = await apiService.login(username, password);
      
      if (!response || !response.data) {
        return { success: false, error: 'No se pudo autenticar al usuario' };
      }

      const userData = {
        ...response.data.user,
        cards: response.data.cards
      };

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Error al iniciar sesión. Verifica tus credenciales.' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiService.register(userData);
      
      if (!response || !response.data) {
        return { success: false, error: 'No se pudo registrar al usuario' };
      }

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Register error:', error);
      return { 
        success: false, 
        error: error.message || 'Error al registrar usuario.' 
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
      // Forzar limpieza del estado incluso si hay error
      setUser(null);
    }
  };

  const updateUserCards = (updatedCards) => {
    if (user && Array.isArray(updatedCards)) {
      const updatedUser = { ...user, cards: updatedCards };
      setUser(updatedUser);
      AsyncStorage.setItem('user', JSON.stringify(updatedUser)).catch(error => {
        console.error('Error updating user cards in storage:', error);
      });
    }
  };

  const refreshUserCards = async () => {
    if (user && user.id) {
      try {
        const response = await apiService.getUserCards(user.id);
        if (response && response.data) {
          updateUserCards(response.data);
        }
      } catch (error) {
        console.error('Error refreshing user cards:', error);
      }
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUserCards,
    refreshUserCards,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};