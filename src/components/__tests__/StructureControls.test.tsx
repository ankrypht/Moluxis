import { Alert } from "../CustomAlert";
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

  describe("Landscape Rail Mode", () => {
    it("renders 3D, 2D, and Animate buttons in landscape rail and handles actions", () => {
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
          isLandscape={true}
        />,
      );

      const button3D = getByLabelText("3D Structure");
      const button2D = getByLabelText("2D Structure");
      const buttonAnimate = getByLabelText("Toggle rotation animation");

      expect(button3D.props.accessibilityState).toMatchObject({
        selected: true,
      });
      expect(button2D.props.accessibilityState).toMatchObject({
        selected: false,
      });
      expect(buttonAnimate.props.accessibilityState).toMatchObject({
        selected: false,
        checked: false,
      });

      fireEvent.press(button2D);
      expect(handleSelectFormat).toHaveBeenCalledWith("2d");
      expect(mockTriggerSelectionHaptic).toHaveBeenCalledTimes(1);

      fireEvent.press(buttonAnimate);
      expect(handleToggleAnimation).toHaveBeenCalledTimes(1);
    });

    it("shows alert when 2D is unavailable in landscape", () => {
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
          isLandscape={true}
        />,
      );

      const button2D = getByLabelText("2D Structure (Unavailable)");
      fireEvent.press(button2D);
      expect(alertSpy).toHaveBeenCalledWith(
        "2D Structure Unavailable",
        "No 2D structure data available for this compound.",
      );
      expect(handleSelectFormat).not.toHaveBeenCalled();

      alertSpy.mockRestore();
    });

    it("renders properly in compact landscape mode when showInfo is true", () => {
      const { getByLabelText } = render(
        <StructureControls
          moleculeData={mockMoleculeData}
          isAnimated={false}
          structureFormat="3d"
          onToggleAnimation={jest.fn()}
          onSelectFormat={jest.fn()}
          styles={styles}
          isLandscape={true}
          showInfo={true}
        />,
      );

      const button3D = getByLabelText("3D Structure");
      const button2D = getByLabelText("2D Structure");
      const buttonAnimate = getByLabelText("Toggle rotation animation");

      expect(button3D).toBeTruthy();
      expect(button2D).toBeTruthy();
      expect(buttonAnimate).toBeTruthy();

      expect(button3D.props.style).toMatchObject(styles.leftRailChipCompact);
      expect(button2D.props.style).toMatchObject(styles.leftRailChipCompact);
      expect(buttonAnimate.props.style).toMatchObject(
        styles.leftRailChipCompact,
      );
    });

    it("renders properly in compact landscape mode when isCompact is explicitly true", () => {
      const { getByLabelText } = render(
        <StructureControls
          moleculeData={mockMoleculeData}
          isAnimated={false}
          structureFormat="3d"
          onToggleAnimation={jest.fn()}
          onSelectFormat={jest.fn()}
          styles={styles}
          isLandscape={true}
          isCompact={true}
        />,
      );

      const button3D = getByLabelText("3D Structure");
      expect(button3D.props.style).toMatchObject(styles.leftRailChipCompact);
    });
  });

  describe("Tablet Portrait Structure Controls", () => {
    const tabletMetrics = getScaleMetrics(768, 1024, {
      top: 24,
      right: 0,
      bottom: 24,
      left: 0,
    });
    const tabletStyles = getStructureControlsStyles(tabletMetrics);

    it("renders tablet portrait controls without divider and with balanced touch targets", () => {
      const { getByTestId, getByLabelText } = render(
        <StructureControls
          moleculeData={mockMoleculeData}
          isAnimated={false}
          structureFormat="3d"
          onToggleAnimation={jest.fn()}
          onSelectFormat={jest.fn()}
          styles={tabletStyles}
        />,
      );

      const divider = getByTestId("structure-controls-divider", {
        includeHiddenElements: true,
      });
      expect(divider.props.style).toMatchObject({
        display: "none",
      });

      const toggle = getByTestId("structure-animate-toggle");
      expect(toggle.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            minHeight: expect.any(Number),
          }),
        ]),
      );

      const button2D = getByLabelText("2D Structure");
      const button3D = getByLabelText("3D Structure");
      expect(button2D).toBeTruthy();
      expect(button3D).toBeTruthy();
    });

    it("hides divider on phone portrait to preserve classic mobile layout", () => {
      const { getByTestId } = render(
        <StructureControls
          moleculeData={mockMoleculeData}
          isAnimated={false}
          structureFormat="3d"
          onToggleAnimation={jest.fn()}
          onSelectFormat={jest.fn()}
          styles={styles}
        />,
      );

      const divider = getByTestId("structure-controls-divider", {
        includeHiddenElements: true,
      });
      expect(divider.props.style).toMatchObject({
        display: "none",
      });
    });
  });
});
