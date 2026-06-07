import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { LayoutAnimation, Text } from "react-native";
import { CollapsibleSection } from "../CollapsibleSection";

// Mock @expo/vector-icons
jest.mock("@expo/vector-icons", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  return {
    Ionicons: (props: any) => React.createElement(View, props),
  };
});

describe("CollapsibleSection Component", () => {
  let layoutAnimationSpy: jest.SpyInstance;

  beforeEach(() => {
    // Spy on LayoutAnimation.configureNext
    layoutAnimationSpy = jest
      .spyOn(LayoutAnimation, "configureNext")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders correctly with default expanded state (false)", async () => {
    const { getByText, queryByTestId } = render(
      <CollapsibleSection title="Test Section" icon="information-circle">
        <Text testID="child-text">Child Content</Text>
      </CollapsibleSection>,
    );

    // Wait for vector icons to finish loading to avoid unhandled act() warnings.
    await waitFor(() => {
      // Title should be visible
      expect(getByText("Test Section")).toBeTruthy();
      // The children should not be present initially
      expect(queryByTestId("child-text")).toBeNull();
    });
  });

  it("renders correctly when defaultExpanded is true", async () => {
    const { getByText, getByTestId } = render(
      <CollapsibleSection
        title="Test Section"
        icon="information-circle"
        defaultExpanded={true}
      >
        <Text testID="child-text">Child Content</Text>
      </CollapsibleSection>,
    );

    await waitFor(() => {
      expect(getByText("Test Section")).toBeTruthy();
      expect(getByTestId("child-text")).toBeTruthy();
    });
  });

  it("toggles expanded state and triggers animation on header press", async () => {
    const { getByText, queryByText } = render(
      <CollapsibleSection title="Test Section" icon="information-circle">
        <Text>Child Content</Text>
      </CollapsibleSection>,
    );

    await waitFor(() => {
      expect(getByText("Test Section")).toBeTruthy();
      expect(queryByText("Child Content")).toBeNull();
    });

    // Press the header to expand
    fireEvent.press(getByText("Test Section"));

    // Check if LayoutAnimation was called
    expect(layoutAnimationSpy).toHaveBeenCalledWith(
      LayoutAnimation.Presets.easeInEaseOut,
    );

    // The content should now be visible
    expect(queryByText("Child Content")).toBeTruthy();

    // Press again to collapse
    fireEvent.press(getByText("Test Section"));

    // Check if LayoutAnimation was called again
    expect(layoutAnimationSpy).toHaveBeenCalledTimes(2);

    // The content should now be hidden
    expect(queryByText("Child Content")).toBeNull();
  });
});
