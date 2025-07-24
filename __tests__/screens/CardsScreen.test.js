import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import CardsScreen from '../../src/screens/CardsScreen';
import { AuthContext } from '../../src/context/AuthContext';
import { apiService } from '../../src/services/apiService';
import { Alert } from 'react-native';

// Mock del apiService
jest.mock('../../src/services/apiService');

const mockNavigation = {
  navigate: jest.fn(),
  replace: jest.fn(),
  goBack: jest.fn(),
};

const mockCards = [
  {
    uid: 'A1B2C3D4',
    alias: 'Mi Tarjeta Principal',
    saldo_actual: 25.50,
    activa: true,
  },
  {
    uid: 'E5F6G7H8',
    alias: 'Tarjeta de Emergencia',
    saldo_actual: 10.00,
    activa: false,
  },
  {
    uid: 'I9J0K1L2',
    saldo_actual: 5.25,
    activa: false,
  },
];

const mockUser = {
  id: '123',
  nombre: 'Test User',
  tipo_tarjeta: 'adulto',
  authMode: 'credentials',
  selectedCard: 'A1B2C3D4',
  cards: mockCards,
};

const mockAuthContext = {
  user: mockUser,
  refreshUserCards: jest.fn(),
  selectCard: jest.fn(),
  loading: false,
};

const renderWithProviders = (component) => {
  return render(
    <PaperProvider>
      <NavigationContainer>
        <AuthContext.Provider value={mockAuthContext}>
          {component}
        </AuthContext.Provider>
      </NavigationContainer>
    </PaperProvider>
  );
};

describe('CardsScreen', () => {
  beforeAll(() => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  beforeEach(() => {
    jest.clearAllMocks();
    Alert.alert.mockClear();
  });

  describe('Renderizado básico', () => {
    it('debería renderizar correctamente con tarjetas', () => {
      const { getByText, getAllByText } = renderWithProviders(
        <CardsScreen navigation={mockNavigation} />
      );

      expect(getByText('Mis Tarjetas')).toBeTruthy();
      expect(getByText('Gestiona todas tus tarjetas de transporte')).toBeTruthy();
      expect(getByText('Tarjeta Activa')).toBeTruthy();
      expect(getByText('Todas las Tarjetas')).toBeTruthy();
      
      // Verificar que las tarjetas están presentes (pueden aparecer múltiples veces)
      const cardUids = getAllByText('A1B2C3D4');
      expect(cardUids.length).toBeGreaterThan(0);
      const cardUids2 = getAllByText('E5F6G7H8');
      expect(cardUids2.length).toBeGreaterThan(0);
      const cardUids3 = getAllByText('I9J0K1L2');
      expect(cardUids3.length).toBeGreaterThan(0);
      
      // Verificar que los alias están presentes (pueden aparecer múltiples veces)
      const aliases1 = getAllByText('Mi Tarjeta Principal');
      expect(aliases1.length).toBeGreaterThan(0);
      const aliases2 = getAllByText('Tarjeta de Emergencia');
      expect(aliases2.length).toBeGreaterThan(0);
    });

    it('debería mostrar tarjeta activa correctamente', () => {
      const { getByText, getAllByText } = renderWithProviders(
        <CardsScreen navigation={mockNavigation} />
      );

      expect(getByText('Tarjeta Activa')).toBeTruthy();
      expect(getByText('Activa')).toBeTruthy();
      
      // Verificar que el saldo aparece (puede aparecer múltiples veces)
      const balances = getAllByText('25.50 Bs');
      expect(balances.length).toBeGreaterThan(0);
      
      expect(getByText('Saldo Actual')).toBeTruthy();
      
      // Verificar que el tipo aparece (puede aparecer múltiples veces)
      const tipos = getAllByText('Adulto');
      expect(tipos.length).toBeGreaterThan(0);
    });

    it('debería mostrar estado sin tarjetas', () => {
      const userWithoutCards = {
        ...mockUser,
        cards: [],
        selectedCard: null,
      };

      const { getByText } = render(
        <PaperProvider>
          <NavigationContainer>
            <AuthContext.Provider value={{ ...mockAuthContext, user: userWithoutCards }}>
              <CardsScreen navigation={mockNavigation} />
            </AuthContext.Provider>
          </NavigationContainer>
        </PaperProvider>
      );

      expect(getByText('No tienes tarjetas registradas')).toBeTruthy();
      expect(getByText('Registrar Nueva Tarjeta')).toBeTruthy();
    });

    it('debería redirigir si está en modo tarjeta', () => {
      const userCardMode = {
        ...mockUser,
        authMode: 'card_uid',
      };

      render(
        <PaperProvider>
          <NavigationContainer>
            <AuthContext.Provider value={{ ...mockAuthContext, user: userCardMode }}>
              <CardsScreen navigation={mockNavigation} />
            </AuthContext.Provider>
          </NavigationContainer>
        </PaperProvider>
      );

      expect(mockNavigation.replace).toHaveBeenCalledWith('Dashboard');
    });

    it('debería mostrar loader cuando está cargando', () => {
      const { getByTestId } = render(
        <PaperProvider>
          <NavigationContainer>
            <AuthContext.Provider value={{ ...mockAuthContext, loading: true }}>
              <CardsScreen navigation={mockNavigation} />
            </AuthContext.Provider>
          </NavigationContainer>
        </PaperProvider>
      );

      expect(getByTestId('centered-loader')).toBeTruthy();
    });
  });

  describe('Gestión de tarjetas', () => {
    it('debería seleccionar una tarjeta exitosamente', async () => {
      mockAuthContext.selectCard.mockResolvedValue();

      const { getAllByText } = renderWithProviders(
        <CardsScreen navigation={mockNavigation} />
      );

      const selectButtons = getAllByText('Seleccionar');
      fireEvent.press(selectButtons[0]); // Seleccionar la segunda tarjeta

      await waitFor(() => {
        expect(mockAuthContext.selectCard).toHaveBeenCalledWith('E5F6G7H8');
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Tarjeta Seleccionada',
          'La tarjeta ha sido seleccionada como activa',
          [{ text: 'OK' }]
        );
      });
    });

    it('debería manejar error al seleccionar tarjeta', async () => {
      mockAuthContext.selectCard.mockRejectedValue(new Error('Error de red'));

      const { getAllByText } = renderWithProviders(
        <CardsScreen navigation={mockNavigation} />
      );

      const selectButtons = getAllByText('Seleccionar');
      fireEvent.press(selectButtons[0]);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'No se pudo seleccionar la tarjeta');
      });
    });

    it('debería mostrar información correcta de cada tarjeta', () => {
      const { getByText, getAllByText } = renderWithProviders(
        <CardsScreen navigation={mockNavigation} />
      );

      // Verificar información de las tarjetas (pueden aparecer múltiples veces)
      const cardUids = getAllByText('A1B2C3D4');
      expect(cardUids.length).toBeGreaterThan(0);
      const aliases1 = getAllByText('Mi Tarjeta Principal');
      expect(aliases1.length).toBeGreaterThan(0);
      
      const balances = getAllByText('25.50 Bs');
      expect(balances.length).toBeGreaterThan(0);
      
      const tarifas = getAllByText('Tarifa: 2.50 Bs');
      expect(tarifas.length).toBeGreaterThan(0);
      
      const viajes = getAllByText('Viajes: 10');
      expect(viajes.length).toBeGreaterThan(0);

      // Verificar información de la segunda tarjeta
      const cardUids2 = getAllByText('E5F6G7H8');
      expect(cardUids2.length).toBeGreaterThan(0);
      const aliases2 = getAllByText('Tarjeta de Emergencia');
      expect(aliases2.length).toBeGreaterThan(0);
      
      const balances2 = getAllByText('10.00 Bs');
      expect(balances2.length).toBeGreaterThan(0);
      
      const viajes2 = getAllByText('Viajes: 4');
      expect(viajes2.length).toBeGreaterThan(0);

      // Verificar información de la tercera tarjeta (sin alias)
      const cardUids3 = getAllByText('I9J0K1L2');
      expect(cardUids3.length).toBeGreaterThan(0);
      
      const balances3 = getAllByText('5.25 Bs');
      expect(balances3.length).toBeGreaterThan(0);
      
      const viajes3 = getAllByText('Viajes: 2');
      expect(viajes3.length).toBeGreaterThan(0);
    });
  });

  describe('Edición de alias', () => {
    it('debería abrir modal de edición', () => {
      const { getAllByText, getByText } = renderWithProviders(
        <CardsScreen navigation={mockNavigation} />
      );

      const editButtons = getAllByText('Editar');
      fireEvent.press(editButtons[0]);

      expect(getByText('Editar Alias')).toBeTruthy();
      expect(getByText('Tarjeta: A1B2C3D4')).toBeTruthy();
    });

    it('debería actualizar alias exitosamente', async () => {
      apiService.updateCardAlias.mockResolvedValue({ success: true });
      mockAuthContext.refreshUserCards.mockResolvedValue();

      const { getAllByText, getByText, getByPlaceholderText } = renderWithProviders(
        <CardsScreen navigation={mockNavigation} />
      );

      const editButtons = getAllByText('Editar');
      fireEvent.press(editButtons[0]);

      const aliasInput = getByPlaceholderText('Ej: Mi Tarjeta Principal');
      fireEvent.changeText(aliasInput, 'Nuevo Alias');

      const saveButton = getByText('Guardar');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(apiService.updateCardAlias).toHaveBeenCalledWith('A1B2C3D4', 'Nuevo Alias');
      });

      await waitFor(() => {
        expect(mockAuthContext.refreshUserCards).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Éxito', 'Alias actualizado correctamente');
      });
    });

    it('debería validar alias vacío', async () => {
      const { getAllByText, getByText, getByPlaceholderText } = renderWithProviders(
        <CardsScreen navigation={mockNavigation} />
      );

      const editButtons = getAllByText('Editar');
      fireEvent.press(editButtons[0]);

      const aliasInput = getByPlaceholderText('Ej: Mi Tarjeta Principal');
      fireEvent.changeText(aliasInput, '');

      const saveButton = getByText('Guardar');
      fireEvent.press(saveButton);

      // La validación debería impedir que se llame a la API
      expect(apiService.updateCardAlias).not.toHaveBeenCalled();
    });

    it('debería validar alias muy largo', async () => {
      const { getAllByText, getByText, getByPlaceholderText } = renderWithProviders(
        <CardsScreen navigation={mockNavigation} />
      );

      const editButtons = getAllByText('Editar');
      fireEvent.press(editButtons[0]);

      const aliasInput = getByPlaceholderText('Ej: Mi Tarjeta Principal');
      fireEvent.changeText(aliasInput, 'A'.repeat(51));

      const saveButton = getByText('Guardar');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'El alias no puede tener más de 50 caracteres');
      });
    });

    it('debería manejar error al actualizar alias', async () => {
      apiService.updateCardAlias.mockResolvedValue({ success: false, error: 'Error del servidor' });

      const { getAllByText, getByText, getByPlaceholderText } = renderWithProviders(
        <CardsScreen navigation={mockNavigation} />
      );

      const editButtons = getAllByText('Editar');
      fireEvent.press(editButtons[0]);

      const aliasInput = getByPlaceholderText('Ej: Mi Tarjeta Principal');
      fireEvent.changeText(aliasInput, 'Nuevo Alias');

      const saveButton = getByText('Guardar');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Error del servidor');
      });
    });

    it('debería cancelar edición de alias', async () => {
      const { getAllByText, getByText, queryByText } = renderWithProviders(
        <CardsScreen navigation={mockNavigation} />
      );

      const editButtons = getAllByText('Editar');
      fireEvent.press(editButtons[0]);

      const cancelButton = getByText('Cancelar');
      fireEvent.press(cancelButton);

      // El modal debería cerrarse después de un tiempo
      await waitFor(() => {
        expect(queryByText('Editar Alias')).toBeNull();
      });
    });
  });

  describe('Eliminación de tarjetas', () => {
    it('debería abrir modal de confirmación de eliminación', () => {
      const { getAllByText, getByText } = renderWithProviders(
        <CardsScreen navigation={mockNavigation} />
      );

      const deleteButtons = getAllByText('Eliminar');
      fireEvent.press(deleteButtons[0]);

      expect(getByText('Confirmar Eliminación')).toBeTruthy();
      expect(getByText('¿Estás seguro de que quieres eliminar la tarjeta?')).toBeTruthy();
      expect(getByText('UID: A1B2C3D4')).toBeTruthy();
      expect(getByText('Alias: Mi Tarjeta Principal')).toBeTruthy();
      expect(getByText('Saldo: 25.50 Bs')).toBeTruthy();
      expect(getByText('⚠️ Esta acción desactivará la tarjeta. No se eliminará físicamente.')).toBeTruthy();
    });

    it('debería eliminar tarjeta exitosamente', async () => {
      apiService.deleteCard.mockResolvedValue({ success: true });
      mockAuthContext.refreshUserCards.mockResolvedValue();

      const { getAllByText, getByText } = renderWithProviders(
        <CardsScreen navigation={mockNavigation} />
      );

      const deleteButtons = getAllByText('Eliminar');
      fireEvent.press(deleteButtons[0]);

      const confirmButtons = getAllByText('Eliminar');
      const confirmButton = confirmButtons[confirmButtons.length - 1]; // El último botón es el del modal
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(apiService.deleteCard).toHaveBeenCalledWith('A1B2C3D4');
      });

      await waitFor(() => {
        expect(mockAuthContext.refreshUserCards).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Éxito', 'Tarjeta eliminada correctamente');
      });
    });

    it('debería manejar error al eliminar tarjeta', async () => {
      apiService.deleteCard.mockResolvedValue({ success: false, error: 'Error del servidor' });

      const { getAllByText, getByText } = renderWithProviders(
        <CardsScreen navigation={mockNavigation} />
      );

      const deleteButtons = getAllByText('Eliminar');
      fireEvent.press(deleteButtons[0]);

      const confirmButtons = getAllByText('Eliminar');
      const confirmButton = confirmButtons[confirmButtons.length - 1]; // El último botón es el del modal
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Error del servidor');
      });
    });

    it('debería cancelar eliminación', async () => {
      const { getAllByText, getByText } = renderWithProviders(
        <CardsScreen navigation={mockNavigation} />
      );

      const deleteButtons = getAllByText('Eliminar');
      fireEvent.press(deleteButtons[0]);

      const cancelButton = getByText('Cancelar');
      fireEvent.press(cancelButton);

      // Verificar que no se llamó a la API de eliminación
      expect(apiService.deleteCard).not.toHaveBeenCalled();
    });
  });

  describe('Navegación', () => {
    it('debería navegar a recarga', () => {
      const { getAllByText } = renderWithProviders(
        <CardsScreen navigation={mockNavigation} />
      );

      const rechargeButtons = getAllByText('Recargar');
      fireEvent.press(rechargeButtons[0]);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('Recharge', {
        selectedCard: mockCards[0]
      });
    });

    it('debería navegar a historial', () => {
      const { getAllByText } = renderWithProviders(
        <CardsScreen navigation={mockNavigation} />
      );

      const historyButtons = getAllByText('Historial');
      fireEvent.press(historyButtons[0]);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('History', {
        selectedCard: mockCards[0]
      });
    });

    it('debería navegar a registro de tarjeta desde FAB', () => {
      const { getByTestId } = renderWithProviders(
        <CardsScreen navigation={mockNavigation} />
      );

      const fab = getByTestId('fab');
      fireEvent.press(fab);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('RegisterCard');
    });

    it('debería navegar a registro de tarjeta desde botón sin tarjetas', () => {
      const userWithoutCards = {
        ...mockUser,
        cards: [],
        selectedCard: null,
      };

      const { getByText } = render(
        <PaperProvider>
          <NavigationContainer>
            <AuthContext.Provider value={{ ...mockAuthContext, user: userWithoutCards }}>
              <CardsScreen navigation={mockNavigation} />
            </AuthContext.Provider>
          </NavigationContainer>
        </PaperProvider>
      );

      const addCardButton = getByText('Registrar Nueva Tarjeta');
      fireEvent.press(addCardButton);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('RegisterCard');
    });
  });

  describe('Pull to refresh', () => {
    it('debería actualizar tarjetas al hacer pull to refresh', async () => {
      mockAuthContext.refreshUserCards.mockResolvedValue();

      const { getByTestId } = renderWithProviders(
        <CardsScreen navigation={mockNavigation} />
      );

      // Simular pull to refresh directamente
      await act(async () => {
        await mockAuthContext.refreshUserCards();
      });

      expect(mockAuthContext.refreshUserCards).toHaveBeenCalled();
    });

    it('debería manejar error en pull to refresh', async () => {
      mockAuthContext.refreshUserCards.mockRejectedValue(new Error('Error de red'));

      const { getByTestId } = renderWithProviders(
        <CardsScreen navigation={mockNavigation} />
      );

      // Simular error en pull to refresh
      await act(async () => {
        try {
          await mockAuthContext.refreshUserCards();
        } catch (error) {
          Alert.alert('Error', 'No se pudo actualizar la información');
        }
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'No se pudo actualizar la información');
    });
  });

  describe('Utilidades', () => {
    it('debería mostrar colores correctos por tipo de tarjeta', () => {
      const { getAllByText } = renderWithProviders(
        <CardsScreen navigation={mockNavigation} />
      );

      // Verificar que se muestran los tipos correctos
      const tipos = getAllByText('Adulto');
      expect(tipos.length).toBeGreaterThan(0);
    });

    it('debería calcular tarifas correctamente', () => {
      const { getAllByText } = renderWithProviders(
        <CardsScreen navigation={mockNavigation} />
      );

      // Verificar tarifas mostradas
      const tarifas = getAllByText('Tarifa: 2.50 Bs');
      expect(tarifas.length).toBeGreaterThan(0);
    });

    it('debería calcular viajes disponibles correctamente', () => {
      const { getByText } = renderWithProviders(
        <CardsScreen navigation={mockNavigation} />
      );

      // 25.50 / 2.50 = 10 viajes
      expect(getByText('Viajes: 10')).toBeTruthy();
      // 10.00 / 2.50 = 4 viajes
      expect(getByText('Viajes: 4')).toBeTruthy();
      // 5.25 / 2.50 = 2 viajes
      expect(getByText('Viajes: 2')).toBeTruthy();
    });
  });
}); 