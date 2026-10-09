import React from "react";
import { Alert } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import { StructureControls } from "../StructureControls";
import { getStructureControlsStyles } from "../StructureControls.styles";
import { getScaleMetrics } from "../../utils/scaling";
import { MoleculeInfo } from "../../types";

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

const mockTriggerSelectionHaptic = jest.fn();
const mockTriggerWarningHaptic = jest.fn();

jest.mock("../../utils/haptics", () => ({
  triggerSelectionHaptic: () => mockTriggerSelectionHaptic(),
  triggerWarningHaptic: () => mockTriggerWarningHaptic(),
}));

describe("StructureControls Component", () => {
  const metrics = getScaleMetrics(390, 844, {
    top: 44,
    right: 0,
    bottom: 34,
    left: 0,
  });
  const styles = getStructureControlsStyles(metrics);

  const mockMoleculeData: MoleculeInfo = {
    name: "Caffeine",
    formula: "C8H10N4O2",
    cid: "2519",
    molecularWeight: "194.19",
    sdf2d: "M  END",
    sdf3d: "M  END",
    useCif: false,
    synonyms: ["caffeine"],
    description: "A central nervous system stimulant.",
    properties: {},
    safety: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders structure format buttons and handles format selection with haptics", () => {
    const handleSelectFormat = jest.fn();
    const handleToggleAnimation = jest.fn();

    const { getByLabelText } = render(
      <StructureControls
        moleculeData={mockMoleculeData}
        isAnimated={false}
        structureFormat="3d"
        onToggleAnimation={handleToggleAnimation}
        onSelectFormat={handleSelectFormat}
        styles={styles}
      />,
    );

    const button2D = getByLabelText("2D Structure");
    const button3D = getByLabelText("3D Structure");

    expect(button2D.props.accessibilityState).toMatchObject({
      selected: false,
    });
    expect(button3D.props.accessibilityState).toMatchObject({
      selected: true,
    });

    fireEvent.press(button2D);
    expect(handleSelectFormat).toHaveBeenCalledWith("2d");
    expect(mockTriggerSelectionHaptic).toHaveBeenCalledTimes(1);
  });

  it("shows an alert when 2D structure is unavailable and pressed", () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    const handleSelectFormat = jest.fn();

    const moleculeWithout2D: MoleculeInfo = {
      ...mockMoleculeData,
      sdf2d: "",
    };

    const { getByLabelText } = render(
      <StructureControls
        moleculeData={moleculeWithout2D}
        isAnimated={false}
        structureFormat="3d"
        onToggleAnimation={jest.fn()}
        onSelectFormat={handleSelectFormat}
        styles={styles}
      />,
    );

    const button2D = getByLabelText("2D Structure (Unavailable)");
    expect(button2D.props.accessibilityState).toEqual({
      selected: false,
    });

    fireEvent.press(button2D);
    expect(alertSpy).toHaveBeenCalledWith(
      "2D Structure Unavailable",
      "No 2D structure data available for this compound.",
    );
    expect(handleSelectFormat).not.toHaveBeenCalled();
    expect(mockTriggerWarningHaptic).toHaveBeenCalledTimes(1);

    alertSpy.mockRestore();
  });

  it("shows an alert when 3D structure is unavailable and pressed", () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    const handleSelectFormat = jest.fn();

    const moleculeWithout3D: MoleculeInfo = {
      ...mockMoleculeData,
      sdf3d: "",
      useCif: false,
    };

    const { getByLabelText } = render(
      <StructureControls
        moleculeData={moleculeWithout3D}
        isAnimated={false}
        structureFormat="2d"
        onToggleAnimation={jest.fn()}
        onSelectFormat={handleSelectFormat}
        styles={styles}
      />,
    );

    const button3D = getByLabelText("3D Structure (Unavailable)");
    expect(button3D.props.accessibilityState).toEqual({
      selected: false,
    });

    fireEvent.press(button3D);
    expect(alertSpy).toHaveBeenCalledWith(
      "3D Structure Unavailable",
      "No 3D structure data available for this compound.",
    );
    expect(handleSelectFormat).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it("toggles animation switch", () => {
    const handleToggleAnimation = jest.fn();

    const { getByRole } = render(
      <StructureControls
        moleculeData={mockMoleculeData}
        isAnimated={false}
        structureFormat="3d"
        onToggleAnimation={handleToggleAnimation}
        onSelectFormat={jest.fn()}
        styles={styles}
      />,
    );

    const switchComponent = getByRole("switch");
    expect(switchComponent.props.accessibilityState).toEqual({
      checked: false,
    });

    fireEvent(switchComponent, "valueChange", true);
    expect(handleToggleAnimation).toHaveBeenCalledTimes(1);
    expect(mockTriggerSelectionHaptic).toHaveBeenCalledTimes(1);
  });
});
