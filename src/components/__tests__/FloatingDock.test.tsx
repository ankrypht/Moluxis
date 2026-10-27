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

const mockTriggerStylePressHaptic = jest.fn();
const mockTriggerZenModeHaptic = jest.fn();
const mockTriggerImpactLight = jest.fn();
const mockTriggerSelectionHaptic = jest.fn();

jest.mock("../../utils/haptics", () => ({
  triggerStylePressHaptic: () => mockTriggerStylePressHaptic(),
  triggerZenModeHaptic: () => mockTriggerZenModeHaptic(),
  triggerImpactLight: () => mockTriggerImpactLight(),
  triggerSelectionHaptic: () => mockTriggerSelectionHaptic(),
}));

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
    showDisplayOptions: false,
    styles,
    onSelectStyle: jest.fn(),
    onToggleDisplayOptions: jest.fn(),
    onToggleInfo: jest.fn(),
    onToggleLabels: jest.fn(),
    onEnterZenMode: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders 4 main dock chips and triggers callbacks and haptics on press", () => {
    const onEnterZenMode = jest.fn();
    const onToggleInfo = jest.fn();
    const onToggleMeasure = jest.fn();
    const onToggleDisplayOptions = jest.fn();

    const { getByLabelText } = render(
      <FloatingDock
        {...defaultProps}
        onEnterZenMode={onEnterZenMode}
        onToggleInfo={onToggleInfo}
        onToggleMeasure={onToggleMeasure}
        onToggleDisplayOptions={onToggleDisplayOptions}
      />,
    );

    const zenButton = getByLabelText("Enter Zen full screen mode");
    const infoButton = getByLabelText("Toggle molecule information");
    const measureButton = getByLabelText("Toggle measurement mode");
    const displayButton = getByLabelText("Toggle display and style options");

    fireEvent.press(zenButton);
    expect(onEnterZenMode).toHaveBeenCalledTimes(1);
    expect(mockTriggerZenModeHaptic).toHaveBeenCalledTimes(1);

    fireEvent.press(infoButton);
    expect(onToggleInfo).toHaveBeenCalledTimes(1);
    expect(mockTriggerImpactLight).toHaveBeenCalledTimes(1);

    fireEvent.press(measureButton);
    expect(onToggleMeasure).toHaveBeenCalledTimes(1);
    expect(mockTriggerSelectionHaptic).toHaveBeenCalledTimes(1);

    fireEvent.press(displayButton);
    expect(onToggleDisplayOptions).toHaveBeenCalledTimes(1);
    expect(mockTriggerStylePressHaptic).toHaveBeenCalledTimes(1);
  });

  it("reflects active state accessibility values", () => {
    const { getByLabelText } = render(
      <FloatingDock
        {...defaultProps}
        showInfo={true}
        showDisplayOptions={true}
        isMeasuring={true}
      />,
    );

    const infoButton = getByLabelText("Toggle molecule information");
    const measureButton = getByLabelText("Toggle measurement mode");
    const displayButton = getByLabelText("Toggle display and style options");

    expect(infoButton.props.accessibilityState).toEqual({ selected: true });
    expect(measureButton.props.accessibilityState).toEqual({ selected: true });
    expect(displayButton.props.accessibilityState).toEqual({ expanded: true });
  });

  it("renders display options menu when showDisplayOptions is true and allows label toggle and style selection", () => {
    const onSelectStyle = jest.fn();
    const onToggleLabels = jest.fn();

    const { getByLabelText, getByText } = render(
      <FloatingDock
        {...defaultProps}
        showDisplayOptions={true}
        showLabels={false}
        onSelectStyle={onSelectStyle}
        onToggleLabels={onToggleLabels}
      />,
    );

    expect(getByText("Display Options")).toBeTruthy();
    expect(getByText("Render Style")).toBeTruthy();

    const labelsToggle = getByLabelText("Toggle atom labels");
    expect(labelsToggle).toBeTruthy();
    expect(labelsToggle.props.accessibilityState).toEqual({ selected: false });

    fireEvent.press(labelsToggle);
    expect(onToggleLabels).toHaveBeenCalledTimes(1);
    expect(mockTriggerSelectionHaptic).toHaveBeenCalledTimes(1);

    const sticksOption = getByLabelText("Sticks style");
    expect(sticksOption).toBeTruthy();
    expect(sticksOption.props.accessibilityState).toEqual({ selected: false });

    fireEvent.press(sticksOption);
    expect(onSelectStyle).toHaveBeenCalledWith("stick");
    expect(mockTriggerStylePressHaptic).toHaveBeenCalledTimes(1);

    const backdrop = getByLabelText("Close display options");
    expect(backdrop).toBeTruthy();
    fireEvent.press(backdrop);
    expect(defaultProps.onToggleDisplayOptions).toHaveBeenCalledTimes(1);
  });

  it("renders properly in compact landscape mode", () => {
    const { getByLabelText } = render(
      <FloatingDock {...defaultProps} isLandscape={true} showInfo={true} />,
    );

    const infoButton = getByLabelText("Toggle molecule information");
    expect(infoButton).toBeTruthy();
  });
});
