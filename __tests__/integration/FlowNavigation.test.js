// Nueva suite de integración de navegación (2024)
// Estrategia: Solo se testean los handlers de navegación de DashboardScreen con mocks y testID.
// No se simula el stack completo de React Navigation.

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { AuthContext } from '../../src/context/AuthContext';
import DashboardScreen from '../../src/screens/DashboardScreen';

const mockNavigate = jest.fn();
const navigation = { navigate: mockNavigate };

const baseUser = {
  nombre: 'Juan Pérez',
  email: 'juan@example.com',
  authMode: 'credentials',
  isMultiCard: true,
  selectedCard: 'A1B2C3D4',
  tipo_tarjeta: 'adulto',
  cards: [
    { uid: 'A1B2C3D4', saldo_actual: 25.5, alias: 'Principal' },
    { uid: 'B2C3D4E5', saldo_actual: 10.0, alias: 'Secundaria' },
  ],
};

describe('DashboardScreen navegación rápida', () => {
  beforeEach(() => jest.clearAllMocks());
  function renderDashboard() {
    return render(
      <AuthContext.Provider value={{ user: baseUser, loading: false }}>
        <DashboardScreen navigation={navigation} />
      </AuthContext.Provider>
    );
  }
  it('navega a Recargar', async () => {
    const { getByTestId } = renderDashboard();
    await act(async () => {
      fireEvent.press(getByTestId('quick-action-recharge'));
    });
    expect(mockNavigate).toHaveBeenCalledWith('Recharge', expect.anything());
  });
  it('navega a Historial', async () => {
    const { getByTestId } = renderDashboard();
    await act(async () => {
      fireEvent.press(getByTestId('quick-action-history'));
    });
    expect(mockNavigate).toHaveBeenCalledWith('History', expect.anything());
  });
  it('navega a Tarjetas', async () => {
    const { getByTestId } = renderDashboard();
    await act(async () => {
      fireEvent.press(getByTestId('quick-action-cards'));
    });
    expect(mockNavigate).toHaveBeenCalledWith('Cards');
  });
}); 