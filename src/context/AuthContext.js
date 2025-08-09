import React, { createContext, useContext } from 'react';
import { apiService } from '../services/apiService';
import { useAuthState } from '../hooks/useAuthState';

export const AuthContext = createContext();

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
      console.log('🔐 Iniciando login con:', { username, password: '***' });
      
      if (!username || !password) {
        console.log('❌ Usuario o contraseña faltantes');
        return { success: false, error: 'Usuario y contraseña son requeridos' };
      }

      console.log('📡 Llamando apiService.login...');
      const response = await apiService.login(username, password);
      console.log('📡 Respuesta del login:', response ? 'OK' : 'NULL');
      
      if (!response || !response.data) {
        console.log('❌ Respuesta inválida del login');
        return { success: false, error: 'No se pudo autenticar al usuario' };
      }

      const userData = {
        ...response.data.user,
        cards: response.data.cards,
        authMode: 'credentials',
        isMultiCard: response.data.cards && response.data.cards.length > 1,
        selectedCard: response.data.cards && response.data.cards.length > 0 ? response.data.cards[0].uid : null
      };

      console.log('👤 Configurando usuario:', { 
        id: userData.id, 
        nombre: userData.nombre,
        cardsCount: userData.cards?.length || 0 
      });

      await setUser(userData);
      console.log('✅ Login exitoso');
      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Error al iniciar sesión. Verifica tus credenciales.' 
      };
    }
  };

  const loginWithCard = async (cardUid) => {
    try {
      if (!cardUid) {
        return { success: false, error: 'UID de tarjeta es requerido' };
      }

      // Obtener información de la tarjeta
      const cardResponse = await apiService.getCardInfo(cardUid);
      
      if (!cardResponse || !cardResponse.data) {
        return { success: false, error: 'Tarjeta no encontrada o inactiva' };
      }

      // Crear un usuario temporal para modo tarjeta
      const cardUser = {
        id: `card_${cardUid}`,
        nombre: cardResponse.data.nombre,
        tipo_tarjeta: cardResponse.data.tipo_tarjeta,
        email: null,
        telefono: null,
        cards: [{
          uid: cardUid,
          saldo_actual: cardResponse.data.saldo_actual,
          activa: true
        }],
        authMode: 'card_uid',
        isMultiCard: false,
        selectedCard: cardUid
      };

      await setUser(cardUser);
      return { success: true };
    } catch (error) {
      console.error('Card login error:', error);
      return { 
        success: false, 
        error: error.message || 'Error al autenticar con tarjeta. Verifica el UID.' 
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
      await apiService.logout(); // Limpia el token en memoria y AsyncStorage
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
    if (user && user.id && user.authMode === 'credentials') {
      try {
        const response = await apiService.getUserCards(user.id);
        if (response && response.data) {
          updateUserCards(response.data);
        }
      } catch (error) {
        console.error('Error refreshing user cards:', error);
      }
    } else if (user && user.authMode === 'card_uid' && user.selectedCard) {
      try {
        const cardResponse = await apiService.getCardInfo(user.selectedCard);
        if (cardResponse && cardResponse.data) {
          const updatedUser = {
            ...user,
            cards: [{
              uid: user.selectedCard,
              saldo_actual: cardResponse.data.saldo_actual,
              activa: true
            }]
          };
          await setUser(updatedUser);
        }
      } catch (error) {
        console.error('Error refreshing card:', error);
      }
    }
  };

  const selectCard = async (cardUid) => {
    if (user && user.cards) {
      const selectedCard = user.cards.find(card => card.uid === cardUid);
      if (selectedCard) {
        const updatedUser = { ...user, selectedCard: cardUid };
        await setUser(updatedUser);
      }
    }
  };

  const value = {
    user,
    login,
    loginWithCard,
    register,
    logout,
    updateUserCards,
    refreshUserCards,
    selectCard,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};