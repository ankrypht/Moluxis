import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Animated, View } from "react-native";
import { CollapsibleSection } from "../CollapsibleSection";
import { Text } from "react-native";

// Mock @expo/vector-icons
jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    Ionicons: (props: any) => React.createElement(View, props),
  };
});

describe("CollapsibleSection Component", () => {
  let springSpy: jest.SpyInstance;

  beforeEach(() => {
    // Spy on Animated.spring
    springSpy = jest.spyOn(Animated, "spring").mockImplementation(() => ({
      start: jest.fn(),
      stop: jest.fn(),
      reset: jest.fn(),
    }) as unknown as Animated.CompositeAnimation);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders correctly with default expanded state (false)", async () => {
    const { getByText, getByTestId } = render(
      <CollapsibleSection title="Test Section" icon="information-circle">
        <Text testID="child-text">Child Content</Text>
      </CollapsibleSection>
    );

    // Wait for vector icons to finish loading to avoid unhandled act() warnings.
    await waitFor(() => {
      // Title should be visible
      expect(getByText("Test Section")).toBeTruthy();
      // The children should be present
      expect(getByTestId("child-text")).toBeTruthy();
    });
  });

  it("renders correctly when defaultExpanded is true", async () => {
    const { getByText, getByTestId } = render(
      <CollapsibleSection title="Test Section" icon="information-circle" defaultExpanded={true}>
        <Text testID="child-text">Child Content</Text>
      </CollapsibleSection>
    );

    await waitFor(() => {
      expect(getByText("Test Section")).toBeTruthy();
      expect(getByTestId("child-text")).toBeTruthy();
    });
  });

  it("toggles expanded state and triggers animation on header press", async () => {
    const { getByText } = render(
      <CollapsibleSection title="Test Section" icon="information-circle">
        <Text>Child Content</Text>
      </CollapsibleSection>
    );

    await waitFor(() => {
      expect(getByText("Test Section")).toBeTruthy();
    });

    // Press the header
    fireEvent.press(getByText("Test Section"));

    // Check if Animated.spring was called with correct toValue (1)
    expect(springSpy).toHaveBeenCalledWith(
      expect.any(Object), // The Animated.Value instance
      expect.objectContaining({
        toValue: 1,
        useNativeDriver: false,
        tension: 50,
        friction: 8,
      })
    );

    // Press again to collapse
    fireEvent.press(getByText("Test Section"));

    // Check if Animated.spring was called with correct toValue (0)
    expect(springSpy).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        toValue: 0,
        useNativeDriver: false,
        tension: 50,
        friction: 8,
      })
    );
  });
});
