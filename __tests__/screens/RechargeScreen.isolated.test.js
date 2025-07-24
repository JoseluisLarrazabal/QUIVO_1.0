// Mock de useAuth antes de cualquier import
const baseUser = {
  nombre: 'Juan Pérez',
  email: 'juan@example.com',
  tipo_tarjeta: 'adulto',
  authMode: 'credentials',
  selectedCard: 'A1B2C3D4',
  isMultiCard: true,
  cards: [
    {
      uid: 'A1B2C3D4',
      saldo_actual: 25.5,
    },
  ],
};
const mockRefreshUserCards = jest.fn();
jest.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({
    user: baseUser,
    loading: false,
    refreshUserCards: mockRefreshUserCards,
  }),
}));
jest.mock('../../src/services/apiService', () => ({
  apiService: {
    rechargeCard: jest.fn(() => Promise.resolve({ success: true, nuevo_saldo: 45.5 })),
  },
}));

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import RechargeScreen from '../../src/screens/RechargeScreen';

describe('RechargeScreen aislado', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('ejecuta handleRecharge y llama a Alert.alert', async () => {
    const utils = render(
      <RechargeScreen navigation={{ goBack: jest.fn() }} route={{ params: { selectedCard: baseUser.cards[0] } }} />
    );
    fireEvent.changeText(utils.getByPlaceholderText('0.00'), '20');
    const recargarBtn = await waitFor(() => {
      const btn = utils.getByTestId('recharge-btn');
      if (btn.props.accessibilityState && btn.props.accessibilityState.disabled) {
        throw new Error('Botón aún deshabilitado');
      }
      return btn;
    });
    await act(async () => {
      fireEvent.press(recargarBtn);
    });
    expect(console.log).toHaveBeenCalledWith('HANDLE RECHARGE', '20');
    expect(Alert.alert).toHaveBeenCalled();
  });
}); 