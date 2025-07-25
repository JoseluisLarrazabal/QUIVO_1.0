import React from 'react';
import { render } from '@testing-library/react-native';
import CenteredLoader from '../../src/components/CenteredLoader';

describe('CenteredLoader', () => {
  test('debería renderizar correctamente', () => {
    const { getByTestId } = render(<CenteredLoader />);
    expect(getByTestId('centered-loader')).toBeTruthy();
  });

  test('debería mostrar el mensaje personalizado', () => {
    const { getByText } = render(<CenteredLoader message="Cargando datos..." />);
    expect(getByText('Cargando datos...')).toBeTruthy();
  });
});
