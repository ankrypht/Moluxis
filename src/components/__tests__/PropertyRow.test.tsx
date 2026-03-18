import React from "react";
import { render } from "@testing-library/react-native";
import { PropertyRow } from "../PropertyRow";

describe("PropertyRow Component", () => {
  it("renders correctly with valid string value", () => {
    const { getByText, queryByText } = render(
      <PropertyRow label="Molecular Weight" value="18.015 g/mol" />
    );

    expect(getByText("Molecular Weight")).toBeTruthy();
    expect(getByText("18.015 g/mol")).toBeTruthy();
  });

  it("returns null and does not render when value is undefined", () => {
    const { toJSON } = render(<PropertyRow label="Boiling Point" value={undefined} />);
    expect(toJSON()).toBeNull();
  });

  it("returns null and does not render when value is empty string", () => {
    const { toJSON } = render(<PropertyRow label="Melting Point" value="" />);
    expect(toJSON()).toBeNull();
  });

  it("returns null and does not render when value is 'N/A'", () => {
    const { toJSON } = render(<PropertyRow label="LogP" value="N/A" />);
    expect(toJSON()).toBeNull();
  });

  it("renders correctly with falsy-looking string like '0'", () => {
    const { getByText } = render(<PropertyRow label="Hydrogen Bond Donors" value="0" />);

    expect(getByText("Hydrogen Bond Donors")).toBeTruthy();
    expect(getByText("0")).toBeTruthy();
  });

  it("renders correctly with truthy string 'false'", () => {
      const { getByText } = render(<PropertyRow label="Isotope" value="false" />);

      expect(getByText("Isotope")).toBeTruthy();
      expect(getByText("false")).toBeTruthy();
  });
});
