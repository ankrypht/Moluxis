import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { ShareExportModal } from "../ShareExportModal";
import { getShareExportModalStyles } from "../ShareExportModal.styles";
import { getScaleMetrics } from "../../utils/scaling";
import { MoleculeInfo } from "../../types";
import * as shareService from "../../services/share/shareService";

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

const mockTriggerImpactLight = jest.fn();
const mockTriggerSuccessHaptic = jest.fn();
const mockTriggerSelectionHaptic = jest.fn();

jest.mock("../../utils/haptics", () => ({
  triggerImpactLight: () => mockTriggerImpactLight(),
  triggerSuccessHaptic: () => mockTriggerSuccessHaptic(),
  triggerSelectionHaptic: () => mockTriggerSelectionHaptic(),
}));

jest.mock("../../services/share/shareService", () => ({
  getCompoundPubChemUrl: jest.fn((cid) =>
    cid ? `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}` : null,
  ),
  shareCompoundDetails: jest.fn().mockResolvedValue(true),
  sharePubChemLink: jest.fn().mockResolvedValue(true),
  shareNameAndFormula: jest.fn().mockResolvedValue(true),
  shareSnapshotImage: jest.fn().mockResolvedValue(true),
}));

const sampleMolecule: MoleculeInfo = {
  name: "Caffeine",
  formula: "C8H10N4O2",
  molecularWeight: "194.19 g/mol",
  cid: "2519",
  sdf2d: "sdf2d-data",
  sdf3d: "sdf3d-data",
  cif: "",
  codId: null,
  useCif: false,
  synonyms: ["caffeine"],
  description: "Caffeine description",
  properties: {},
  safety: {},
};

describe("ShareExportModal", () => {
  const metrics = getScaleMetrics(390, 844, {
    top: 44,
    right: 0,
    bottom: 34,
    left: 0,
  });
  const styles = getShareExportModalStyles(metrics);

  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    moleculeData: sampleMolecule,
    snapshotUri: "data:image/png;base64,sample-img",
    isCapturingSnapshot: false,
    onRefreshSnapshot: jest.fn(),
    styles,
    isLandscape: false,
    height: 844,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("does not render when visible is false or moleculeData is null", () => {
    const { queryByTestId, rerender } = render(
      <ShareExportModal {...defaultProps} visible={false} />,
    );
    expect(queryByTestId("share-preview-card")).toBeNull();

    rerender(<ShareExportModal {...defaultProps} moleculeData={null} />);
    expect(queryByTestId("share-preview-card")).toBeNull();
  });

  it("renders preview card with molecule details and snapshot image", () => {
    const { getByText, getByTestId } = render(
      <ShareExportModal {...defaultProps} />,
    );

    expect(getByText("CAFFEINE")).toBeTruthy();
    expect(getByText("CID: 2519")).toBeTruthy();
    expect(getByText("194.19 g/mol")).toBeTruthy();
    expect(getByTestId("snapshot-preview-image")).toBeTruthy();
  });

  it("triggers onClose and haptics when close button or backdrop is pressed", () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <ShareExportModal {...defaultProps} onClose={onClose} />,
    );

    const closeBtn = getByTestId("close-share-modal");
    fireEvent.press(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(mockTriggerImpactLight).toHaveBeenCalledTimes(1);

    const backdrop = getByTestId("share-modal-backdrop");
    fireEvent.press(backdrop);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("auto-triggers onRefreshSnapshot when visible and no snapshot exists", () => {
    const onRefreshSnapshot = jest.fn();
    render(
      <ShareExportModal
        {...defaultProps}
        snapshotUri={null}
        onRefreshSnapshot={onRefreshSnapshot}
      />,
    );

    expect(onRefreshSnapshot).toHaveBeenCalledTimes(1);
  });

  it("shares 3D snapshot image when share button is tapped", async () => {
    const { getByTestId } = render(<ShareExportModal {...defaultProps} />);

    const shareSnapshotBtn = getByTestId("action-share-snapshot");
    await act(async () => {
      fireEvent.press(shareSnapshotBtn);
    });

    expect(shareService.shareSnapshotImage).toHaveBeenCalledWith(
      "data:image/png;base64,sample-img",
      "Caffeine",
    );
    expect(mockTriggerSuccessHaptic).toHaveBeenCalled();
  });

  it("queues and auto-shares snapshot when tapped while snapshot is pending", async () => {
    const onRefreshSnapshot = jest.fn();
    const { getByTestId, rerender } = render(
      <ShareExportModal
        {...defaultProps}
        snapshotUri={null}
        onRefreshSnapshot={onRefreshSnapshot}
      />,
    );

    onRefreshSnapshot.mockClear();

    const shareSnapshotBtn = getByTestId("action-share-snapshot");
    await act(async () => {
      fireEvent.press(shareSnapshotBtn);
    });

    expect(onRefreshSnapshot).toHaveBeenCalledTimes(1);
    expect(shareService.shareSnapshotImage).not.toHaveBeenCalled();

    // Snapshot arrives
    await act(async () => {
      rerender(
        <ShareExportModal
          {...defaultProps}
          snapshotUri="data:image/png;base64,arrived"
          onRefreshSnapshot={onRefreshSnapshot}
        />,
      );
    });

    expect(shareService.shareSnapshotImage).toHaveBeenCalledWith(
      "data:image/png;base64,arrived",
      "Caffeine",
    );
  });

  it("shares compound details when details button is tapped", async () => {
    const { getByTestId } = render(<ShareExportModal {...defaultProps} />);

    const shareDetailsBtn = getByTestId("action-share-details");
    await act(async () => {
      fireEvent.press(shareDetailsBtn);
    });

    expect(shareService.shareCompoundDetails).toHaveBeenCalledWith(
      sampleMolecule,
    );
    expect(mockTriggerSuccessHaptic).toHaveBeenCalled();
  });

  it("shares PubChem link directly", async () => {
    const { getByTestId } = render(<ShareExportModal {...defaultProps} />);

    const sharePubChemBtn = getByTestId("action-share-pubchem");
    await act(async () => {
      fireEvent.press(sharePubChemBtn);
    });

    expect(shareService.sharePubChemLink).toHaveBeenCalledWith(sampleMolecule);
  });

  it("shares name and formula directly", async () => {
    const { getByTestId } = render(<ShareExportModal {...defaultProps} />);

    const shareFormulaBtn = getByTestId("action-share-formula");
    await act(async () => {
      fireEvent.press(shareFormulaBtn);
    });

    expect(shareService.shareNameAndFormula).toHaveBeenCalledWith(
      sampleMolecule,
    );
  });

  it("renders clean snapshot preview without reload button when snapshot is available", () => {
    const { getByTestId, queryByTestId } = render(
      <ShareExportModal {...defaultProps} />,
    );

    expect(getByTestId("snapshot-preview-image")).toBeTruthy();
    expect(queryByTestId("retake-snapshot-button")).toBeNull();
  });

  it("allows capturing snapshot via placeholder button if no snapshot exists", () => {
    const onRefreshSnapshot = jest.fn();
    const { getByTestId } = render(
      <ShareExportModal
        {...defaultProps}
        snapshotUri={null}
        isCapturingSnapshot={false}
        onRefreshSnapshot={onRefreshSnapshot}
      />,
    );

    const captureBtn = getByTestId("capture-snapshot-button");
    fireEvent.press(captureBtn);

    expect(onRefreshSnapshot).toHaveBeenCalled();
    expect(mockTriggerSelectionHaptic).toHaveBeenCalled();
  });
});
