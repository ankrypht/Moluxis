import React from "react";
import { render } from "@testing-library/react-native";
import { ChemicalFormula } from "../ChemicalFormula";

describe("ChemicalFormula", () => {
  it("matches snapshot", () => {
    const { toJSON } = render(<ChemicalFormula formula="H2O" />);
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders a formula with numbers converted to Unicode subscripts", () => {
    const { getByText } = render(<ChemicalFormula formula="H2O" />);
    expect(getByText("H₂O")).toBeTruthy();
  });

  it("renders a formula without numbers", () => {
    const { getByText } = render(<ChemicalFormula formula="NaCl" />);
    expect(getByText("NaCl")).toBeTruthy();
  });

  it("handles empty formula string", () => {
    const { toJSON } = render(<ChemicalFormula formula="" />);
    expect(toJSON()).toMatchSnapshot();
  });

  it("handles null or undefined formula gracefully", () => {
    const { getByTestId } = render(
      <ChemicalFormula formula={null} testID="null-formula" />,
    );
    expect(getByTestId("null-formula").props.children).toBe("");

    const { getByTestId: getByTestIdUndef } = render(
      <ChemicalFormula testID="undef-formula" />,
    );
    expect(getByTestIdUndef("undef-formula").props.children).toBe("");
  });

  it("renders a formula with only numbers converted to subscripts", () => {
    const { getByText } = render(<ChemicalFormula formula="123" />);
    expect(getByText("₁₂₃")).toBeTruthy();
  });

  it("renders complex and long formulas correctly", () => {
    const formula = "C20H24N2O2";
    const { getByText } = render(<ChemicalFormula formula={formula} />);
    expect(getByText("C₂₀H₂₄N₂O₂")).toBeTruthy();
  });

  it("supports custom style override", () => {
    const { getByTestId } = render(
      <ChemicalFormula
        formula="CO2"
        testID="custom-formula"
        style={{ color: "red" }}
      />,
    );
    const element = getByTestId("custom-formula");
    expect(element).toBeTruthy();
    expect(element.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: "red" })]),
    );
  });
});
