import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { SuggestionItem } from "../SuggestionItem";

describe("SuggestionItem Component", () => {
  it("renders correctly with given item text", async () => {
    const mockOnSelect = jest.fn();
    const { getByText } = render(
      <SuggestionItem item="Aspirin" onSelect={mockOnSelect} />,
    );

    await waitFor(() => {
      expect(getByText("Aspirin")).toBeTruthy();
    });
  });

  it("calls onSelect with the correct item when pressed", async () => {
    const mockOnSelect = jest.fn();
    const { getByText } = render(
      <SuggestionItem item="Ibuprofen" onSelect={mockOnSelect} />,
    );

    await waitFor(() => {
      expect(getByText("Ibuprofen")).toBeTruthy();
    });

    fireEvent.press(getByText("Ibuprofen"));

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith("Ibuprofen");
  });
});
