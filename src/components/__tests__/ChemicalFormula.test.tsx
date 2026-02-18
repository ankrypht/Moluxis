import React from 'react';
import { render } from '@testing-library/react-native';
import { ChemicalFormula } from '../ChemicalFormula';

describe('ChemicalFormula', () => {
  it('renders standard formula correctly (H2O)', () => {
    const { getByText } = render(<ChemicalFormula formula="H2O" />);

    // Check for H
    expect(getByText('H')).toBeTruthy();

    // Check for 2 (should be subscript)
    const subscript = getByText('2');
    expect(subscript).toBeTruthy();
    // Verify subscript style
    expect(subscript.props.style).toMatchObject({
      fontSize: 12,
      lineHeight: 18,
      textAlignVertical: 'bottom',
    });

    // Check for O
    expect(getByText('O')).toBeTruthy();
  });

  it('renders formula with multiple digits correctly (C6H12O6)', () => {
    const { getByText, getAllByText } = render(<ChemicalFormula formula="C6H12O6" />);

    expect(getByText('C')).toBeTruthy();
    expect(getByText('H')).toBeTruthy();
    expect(getByText('1')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
    expect(getByText('O')).toBeTruthy();

    // Verify the '6's are subscripts. There are two '6's.
    const sixes = getAllByText('6');
    expect(sixes.length).toBe(2);
    sixes.forEach(six => {
        expect(six.props.style).toMatchObject({
            fontSize: 12,
        });
    });
  });

  it('renders formula with no numbers correctly (NaCl)', () => {
    const { getByText } = render(<ChemicalFormula formula="NaCl" />);

    expect(getByText('N')).toBeTruthy();
    expect(getByText('a')).toBeTruthy();
    expect(getByText('C')).toBeTruthy();
    expect(getByText('l')).toBeTruthy();
  });

  it('renders formula with parentheses correctly (Ca(OH)2)', () => {
    const { getByText } = render(<ChemicalFormula formula="Ca(OH)2" />);

    expect(getByText('C')).toBeTruthy();
    expect(getByText('a')).toBeTruthy();
    expect(getByText('(')).toBeTruthy();
    expect(getByText('O')).toBeTruthy();
    expect(getByText('H')).toBeTruthy();
    expect(getByText(')')).toBeTruthy();

    const subscript = getByText('2');
    expect(subscript.props.style).toMatchObject({
      fontSize: 12,
    });
  });

  it('renders non-numeric strings correctly', () => {
     // This addresses the specific request "Test ChemicalFormula with non-numeric strings"
     const { getByText } = render(<ChemicalFormula formula="Water" />);
     expect(getByText('W')).toBeTruthy();
     expect(getByText('a')).toBeTruthy();
     expect(getByText('t')).toBeTruthy();
     expect(getByText('e')).toBeTruthy();
     expect(getByText('r')).toBeTruthy();
  });
});
