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
        if (parsedUser && parsedUser.uid) {
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

  const login = async (uid) => {
    try {
      if (!uid || uid.trim().length === 0) {
        return { success: false, error: 'UID no puede estar vacío' };
      }

      const response = await apiService.getCardInfo(uid.trim());
      
      if (!response || !response.data) {
        return { success: false, error: 'No se pudo obtener información de la tarjeta' };
      }

      const userData = {
        uid: uid.trim(),
        ...response.data
      };

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Error al iniciar sesión. Verifica el UID de tu tarjeta.' 
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const updateUserBalance = (newBalance) => {
    if (user && typeof newBalance === 'number' && newBalance >= 0) {
      const updatedUser = { ...user, saldo_actual: newBalance };
      setUser(updatedUser);
      AsyncStorage.setItem('user', JSON.stringify(updatedUser)).catch(error => {
        console.error('Error updating user balance in storage:', error);
      });
    }
  };

  const value = {
    user,
    login,
    logout,
    updateUserBalance,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};