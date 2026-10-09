import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { MoleculeInfoSheet } from "../MoleculeInfoSheet";
import { getMoleculeInfoSheetStyles } from "../MoleculeInfoSheet.styles";
import { getScaleMetrics } from "../../utils/scaling";
import { MoleculeInfo } from "../../types";

jest.mock("@expo/vector-icons", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  return {
    Ionicons: (props: any) => React.createElement(View, props),
  };
});

const mockTriggerImpactLight = jest.fn();

jest.mock("../../utils/haptics", () => ({
  triggerImpactLight: () => mockTriggerImpactLight(),
  triggerSelectionHaptic: jest.fn(),
}));

const mockMoleculeData: MoleculeInfo = {
  name: "Caffeine",
  formula: "C8H10N4O2",
  molecularWeight: "194.19",
  cid: "2519",
  useCif: false,
  description: "Caffeine is a central nervous system stimulant.",
  sdf2d: "sdf2d-data",
  sdf3d: "sdf3d-data",
  properties: {
    iupacName: "1,3,7-trimethylpurine-2,6-dione",
  },
  safety: {
    signal: ["Warning"],
    hazardStatements: ["Harmful if swallowed."],
  },
  synonyms: ["1,3,7-Trimethylxanthine", "Guaranine"],
};

describe("MoleculeInfoSheet Component", () => {
  const insets = { top: 44, right: 0, bottom: 34, left: 0 };
  const metrics = getScaleMetrics(390, 844, insets);
  const styles = getMoleculeInfoSheetStyles(metrics);

  it("renders molecule name, quick stats, and handles close", () => {
    const handleClose = jest.fn();
    const handleOpenShare = jest.fn();

    const { getByText, getByLabelText, getByTestId } = render(
      <MoleculeInfoSheet
        moleculeData={mockMoleculeData}
        showInfo={true}
        isLandscape={false}
        width={390}
        height={844}
        insets={insets}
        styles={styles}
        onClose={handleClose}
        onOpenShare={handleOpenShare}
      />,
    );

    expect(getByText("CAFFEINE")).toBeTruthy();
    expect(getByText("Formula")).toBeTruthy();

    const closeBtn = getByLabelText("Close info panel");
    fireEvent.press(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(mockTriggerImpactLight).toHaveBeenCalled();

    const shareBtn = getByTestId("sheet-share-button");
    fireEvent.press(shareBtn);
    expect(handleOpenShare).toHaveBeenCalledTimes(1);
  });
});
