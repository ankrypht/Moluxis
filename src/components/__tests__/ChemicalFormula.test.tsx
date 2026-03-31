import React from "react";
import { render } from "@testing-library/react-native";
import { ChemicalFormula } from "../ChemicalFormula";

describe("ChemicalFormula", () => {
  it("matches snapshot", () => {
    const { toJSON } = render(<ChemicalFormula formula="H2O" />);
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders a formula with numbers using subscript style for numbers", () => {
    const { getByText } = render(<ChemicalFormula formula="H2O" />);
    expect(getByText("H")).toBeTruthy();
    expect(getByText("O")).toBeTruthy();

    const numberNode = getByText("2");
    expect(numberNode).toBeTruthy();

    // The number should have the subscript style
    expect(numberNode.props.style).toEqual(
      expect.objectContaining({
        fontSize: 12,
        lineHeight: 18,
        textAlignVertical: "bottom",
      }),
    );
  });

  it("renders a formula without numbers", () => {
    const { getByText } = render(<ChemicalFormula formula="NaCl" />);
    expect(getByText("N")).toBeTruthy();
    expect(getByText("a")).toBeTruthy();
    expect(getByText("C")).toBeTruthy();
    expect(getByText("l")).toBeTruthy();
  });

  it("handles empty formula string", () => {
    const { toJSON } = render(<ChemicalFormula formula="" />);
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders a formula with only numbers", () => {
    const { getByText } = render(<ChemicalFormula formula="123" />);
    ["1", "2", "3"].forEach((num) => {
      const node = getByText(num);
      expect(node).toBeTruthy();
      expect(node.props.style).toEqual(
        expect.objectContaining({ fontSize: 12 }),
      );
    });
  });

  it("renders a very long formula", () => {
    const formula = "C20H24N2O2";
    const { getByText, getAllByText } = render(
      <ChemicalFormula formula={formula} />,
    );
    expect(getByText("C")).toBeTruthy();
    expect(getByText("H")).toBeTruthy();
    expect(getByText("N")).toBeTruthy();
    expect(getByText("O")).toBeTruthy();
    expect(getAllByText("2").length).toBe(4);
    expect(getByText("0")).toBeTruthy();
    expect(getByText("4")).toBeTruthy();
  });
});
