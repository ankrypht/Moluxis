import React from "react";
import { render, screen } from "@testing-library/react-native";
import { PropertyRow } from "../PropertyRow";

describe("PropertyRow", () => {
  it("renders correctly when label and value are provided", () => {
    render(<PropertyRow label="Molecular Weight" value="180.16" />);

    expect(screen.getByText("Molecular Weight")).toBeTruthy();
    expect(screen.getByText("180.16")).toBeTruthy();
  });

  it("returns null when value is undefined", () => {
    const { toJSON } = render(
      <PropertyRow label="Molecular Weight" value={undefined} />,
    );
    expect(toJSON()).toBeNull();
  });

  it("returns null when value is 'N/A'", () => {
    const { toJSON } = render(
      <PropertyRow label="Molecular Weight" value="N/A" />,
    );
    expect(toJSON()).toBeNull();
  });

  it("returns null when value is empty string", () => {
    const { toJSON } = render(
      <PropertyRow label="Molecular Weight" value="" />,
    );
    expect(toJSON()).toBeNull();
  });
});
