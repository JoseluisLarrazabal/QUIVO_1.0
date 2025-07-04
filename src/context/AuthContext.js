import React, { createContext, useContext } from 'react';
import { apiService } from '../services/apiService';
import { useAuthState } from '../hooks/useAuthState';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const { user, loading, setUser, checkAuthState } = useAuthState();

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

      await setUser(userData);
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
      await setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const updateUserCards = async (updatedCards) => {
    if (user && Array.isArray(updatedCards)) {
      const updatedUser = { ...user, cards: updatedCards };
      await setUser(updatedUser);
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