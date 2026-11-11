import React from "react";
import { StyleSheet } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import { MeasurementPanel } from "../MeasurementPanel";
import { PickedAtom, MeasurementData } from "../../types";
import { ATOM_MESH_COLORS, addOpacity } from "../../constants/colors";

const mockStyles: any = {
  measurementPanelWrapper: {},
  measurementPanelContainer: {},
  measurementTopSection: {},
  measurementTopScroll: {},
  measurementLandscapeHeader: {},
  measurementLandscapeTitleRow: {},
  measurementLandscapeTitle: {},
  measurementHeader: {},
  measurementModeTabs: {},
  measurementModeTab: {},
  measurementModeTabActive: {},
  measurementModeTabText: {},
  measurementModeTabTextActive: {},
  measurementCloseButton: {},
  measurementStatusPrompt: {},
  measurementAtomSlotsRow: {},
  measurementAtomPill: {},
  measurementAtomPillEmpty: {},
  measurementAtomIndexBadge: {},
  measurementAtomIndexText: {},
  measurementAtomElemText: {},
  measurementAtomRemoveIcon: {},
  measurementEmptySlotText: {},
  measurementResultCard: {},
  measurementResultLeft: {},
  measurementResultDesignation: {},
  measurementResultValue: {},
  measurementResultBadge: {},
  measurementResultBadgeText: {},
  measurementFooterActions: {},
  measurementClearButton: {},
  measurementClearButtonText: {},
  measurementDoneButton: {},
  measurementDoneButtonText: {},
};

const sampleAtoms: PickedAtom[] = [
  { serial: 1, index: 0, elem: "C", x: 0, y: 0, z: 0 },
  { serial: 2, index: 1, elem: "O", x: 1.43, y: 0, z: 0 },
];

const sampleMeasurement: MeasurementData = {
  mode: "distance",
  value: 1.43,
  displayValue: "1.430 Å",
  designation: "d(C1 — O2)",
  atoms: sampleAtoms,
};

describe("MeasurementPanel", () => {
  it("renders mode tabs and status prompt for distance mode", () => {
    const { getByText } = render(
      <MeasurementPanel
        mode="distance"
        pickedAtoms={[]}
        measurementData={null}
        onSelectMode={jest.fn()}
        onRemoveAtom={jest.fn()}
        onClear={jest.fn()}
        onClose={jest.fn()}
        styles={mockStyles}
      />,
    );

    expect(getByText("Length (2)")).toBeTruthy();
    expect(getByText("Angle (3)")).toBeTruthy();
    expect(getByText("Dihedral (4)")).toBeTruthy();
    expect(getByText("Tap 2 atoms to measure bond distance")).toBeTruthy();
  });

  it("handles mode switching", () => {
    const onSelectMode = jest.fn();
    const { getByText } = render(
      <MeasurementPanel
        mode="distance"
        pickedAtoms={[]}
        measurementData={null}
        onSelectMode={onSelectMode}
        onRemoveAtom={jest.fn()}
        onClear={jest.fn()}
        onClose={jest.fn()}
        styles={mockStyles}
      />,
    );

    fireEvent.press(getByText("Angle (3)"));
    expect(onSelectMode).toHaveBeenCalledWith("angle");
  });

  it("renders color-coded picked atom badges without #serial and allows removing an individual atom", () => {
    const onRemoveAtom = jest.fn();
    const { getByText, queryByText, getByLabelText } = render(
      <MeasurementPanel
        mode="distance"
        pickedAtoms={sampleAtoms}
        measurementData={sampleMeasurement}
        onSelectMode={jest.fn()}
        onRemoveAtom={onRemoveAtom}
        onClear={jest.fn()}
        onClose={jest.fn()}
        styles={mockStyles}
      />,
    );

    expect(getByText("C")).toBeTruthy();
    expect(getByText("O")).toBeTruthy();
    expect(queryByText("#1")).toBeNull();
    expect(queryByText("#2")).toBeNull();

    const firstAtomPill = getByLabelText("Remove atom 1: C 1");
    const secondAtomPill = getByLabelText("Remove atom 2: O 2");

    expect(StyleSheet.flatten(firstAtomPill.props.style)).toMatchObject({
      borderColor: addOpacity(ATOM_MESH_COLORS[0], 0.75),
      backgroundColor: addOpacity(ATOM_MESH_COLORS[0], 0.14),
    });
    expect(StyleSheet.flatten(secondAtomPill.props.style)).toMatchObject({
      borderColor: addOpacity(ATOM_MESH_COLORS[1], 0.75),
      backgroundColor: addOpacity(ATOM_MESH_COLORS[1], 0.14),
    });

    fireEvent.press(firstAtomPill);
    expect(onRemoveAtom).toHaveBeenCalledWith(0);
  });

  it("displays live calculation result when measurement is complete", () => {
    const { getByText } = render(
      <MeasurementPanel
        mode="distance"
        pickedAtoms={sampleAtoms}
        measurementData={sampleMeasurement}
        onSelectMode={jest.fn()}
        onRemoveAtom={jest.fn()}
        onClear={jest.fn()}
        onClose={jest.fn()}
        styles={mockStyles}
      />,
    );

    expect(getByText("d(C1 — O2)")).toBeTruthy();
    expect(getByText("1.430 Å")).toBeTruthy();
    expect(getByText("Distance")).toBeTruthy();
  });

  it("calls onClear when clear button is pressed", () => {
    const onClear = jest.fn();
    const { getByText } = render(
      <MeasurementPanel
        mode="distance"
        pickedAtoms={sampleAtoms}
        measurementData={sampleMeasurement}
        onSelectMode={jest.fn()}
        onRemoveAtom={jest.fn()}
        onClear={onClear}
        onClose={jest.fn()}
        styles={mockStyles}
      />,
    );

    fireEvent.press(getByText("Clear"));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when close or done button is pressed", () => {
    const onClose = jest.fn();
    const { getByText, getByLabelText } = render(
      <MeasurementPanel
        mode="distance"
        pickedAtoms={[]}
        measurementData={null}
        onSelectMode={jest.fn()}
        onRemoveAtom={jest.fn()}
        onClear={jest.fn()}
        onClose={onClose}
        styles={mockStyles}
      />,
    );

    fireEvent.press(getByLabelText("Close measurement tool"));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.press(getByText("Done"));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("renders compact tab labels in landscape mode without atom counts", () => {
    const { getByText, queryByText } = render(
      <MeasurementPanel
        mode="distance"
        pickedAtoms={[]}
        measurementData={null}
        onSelectMode={jest.fn()}
        onRemoveAtom={jest.fn()}
        onClear={jest.fn()}
        onClose={jest.fn()}
        styles={mockStyles}
        isLandscape={true}
      />,
    );

    expect(getByText("Length")).toBeTruthy();
    expect(getByText("Angle")).toBeTruthy();
    expect(getByText("Dihedral")).toBeTruthy();
    expect(queryByText("Length (2)")).toBeNull();
  });
});
