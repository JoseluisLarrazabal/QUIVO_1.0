import React from 'react';
import { render } from '@testing-library/react-native';
import CenteredLoader from '../../src/components/CenteredLoader';

describe('CenteredLoader', () => {
  test('debería renderizar correctamente', () => {
    const { getByTestId } = render(<CenteredLoader />);
    expect(getByTestId('centered-loader')).toBeTruthy();
  });
}); 