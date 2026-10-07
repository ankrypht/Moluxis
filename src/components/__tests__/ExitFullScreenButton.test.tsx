import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ExitFullScreenButton } from "../ExitFullScreenButton";
import { getOverlaysStyles } from "../Overlays.styles";
import { getScaleMetrics } from "../../utils/scaling";

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

describe("ExitFullScreenButton Component", () => {
  const metrics = getScaleMetrics(390, 844, {
    top: 44,
    right: 0,
    bottom: 34,
    left: 0,
  });
  const styles = getOverlaysStyles(metrics);

  it("renders correctly with accessibility attributes and handles onPress", () => {
    const handlePress = jest.fn();
    const { getByRole } = render(
      <ExitFullScreenButton onPress={handlePress} styles={styles} />,
    );

    const button = getByRole("button");
    expect(button).toBeTruthy();
    expect(button.props.accessibilityLabel).toBe("Exit Zen mode");

    fireEvent.press(button);
    expect(handlePress).toHaveBeenCalledTimes(1);
  });
});
