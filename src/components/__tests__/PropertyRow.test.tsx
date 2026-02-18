import React from 'react';
import { render } from '@testing-library/react-native';
import { PropertyRow } from '../PropertyRow';

describe('PropertyRow', () => {
  it('renders correctly with label and value', () => {
    const { getByText } = render(
      <PropertyRow label="Molecular Weight" value="180.16 g/mol" />
    );

    expect(getByText('Molecular Weight')).toBeTruthy();
    expect(getByText('180.16 g/mol')).toBeTruthy();
  });

  it('returns null when value is undefined', () => {
    const { queryByText } = render(
      <PropertyRow label="Molecular Weight" value={undefined} />
    );

    expect(queryByText('Molecular Weight')).toBeNull();
  });

  it('returns null when value is "N/A"', () => {
    const { queryByText } = render(
      <PropertyRow label="Molecular Weight" value="N/A" />
    );

    expect(queryByText('Molecular Weight')).toBeNull();
  });
});
