import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { FloatingDock } from "../FloatingDock";
import { getFloatingDockStyles } from "../FloatingDock.styles";
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

describe("FloatingDock Component", () => {
  const metrics = getScaleMetrics(390, 844, {
    top: 44,
    right: 0,
    bottom: 34,
    left: 0,
  });
  const styles = getFloatingDockStyles(metrics);

  const defaultProps = {
    vizStyle: "ballStick" as const,
    showLabels: false,
    showInfo: false,
    showStyleMenu: false,
    styles,
    onSelectStyle: jest.fn(),
    onToggleStyleMenu: jest.fn(),
    onToggleInfo: jest.fn(),
    onToggleLabels: jest.fn(),
    onEnterZenMode: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders main dock chips and triggers callbacks on press", () => {
    const onEnterZenMode = jest.fn();
    const onToggleInfo = jest.fn();
    const onToggleLabels = jest.fn();
    const onToggleStyleMenu = jest.fn();

    const { getByLabelText } = render(
      <FloatingDock
        {...defaultProps}
        onEnterZenMode={onEnterZenMode}
        onToggleInfo={onToggleInfo}
        onToggleLabels={onToggleLabels}
        onToggleStyleMenu={onToggleStyleMenu}
      />,
    );

    const zenButton = getByLabelText("Enter Zen full screen mode");
    const infoButton = getByLabelText("Toggle molecule information");
    const labelsButton = getByLabelText("Toggle atom labels");
    const styleButton = getByLabelText("Toggle rendering styles menu");

    fireEvent.press(zenButton);
    expect(onEnterZenMode).toHaveBeenCalledTimes(1);

    fireEvent.press(infoButton);
    expect(onToggleInfo).toHaveBeenCalledTimes(1);

    fireEvent.press(labelsButton);
    expect(onToggleLabels).toHaveBeenCalledTimes(1);

    fireEvent.press(styleButton);
    expect(onToggleStyleMenu).toHaveBeenCalledTimes(1);
  });

  it("reflects active state accessibility values", () => {
    const { getByLabelText } = render(
      <FloatingDock
        {...defaultProps}
        showInfo={true}
        showLabels={true}
        showStyleMenu={true}
      />,
    );

    const infoButton = getByLabelText("Toggle molecule information");
    const labelsButton = getByLabelText("Toggle atom labels");
    const styleButton = getByLabelText("Toggle rendering styles menu");

    expect(infoButton.props.accessibilityState).toEqual({ selected: true });
    expect(labelsButton.props.accessibilityState).toEqual({ selected: true });
    expect(styleButton.props.accessibilityState).toEqual({ expanded: true });
  });

  it("renders style menu when showStyleMenu is true and allows selection", () => {
    const onSelectStyle = jest.fn();

    const { getByLabelText, getByText } = render(
      <FloatingDock
        {...defaultProps}
        showStyleMenu={true}
        onSelectStyle={onSelectStyle}
      />,
    );

    expect(getByText("Render Style")).toBeTruthy();

    const sticksOption = getByLabelText("Sticks style");
    expect(sticksOption).toBeTruthy();
    expect(sticksOption.props.accessibilityState).toEqual({ selected: false });

    fireEvent.press(sticksOption);
    expect(onSelectStyle).toHaveBeenCalledWith("stick");
  });

  it("renders properly in compact landscape mode", () => {
    const { getByLabelText } = render(
      <FloatingDock {...defaultProps} isLandscape={true} showInfo={true} />,
    );

    const infoButton = getByLabelText("Toggle molecule information");
    expect(infoButton).toBeTruthy();
  });
});
