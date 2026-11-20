import { renderHook, act } from "@testing-library/react-native";
import { useMeasurement } from "../useMeasurement";
import { MoleculeInfo, PickedAtom } from "../../types";
import { MoleculeViewerRef } from "../../components/MoleculeViewer";

jest.mock("../../utils/haptics", () => ({
  triggerMeasurementHaptic: jest.fn(),
}));

const sampleMolecule: MoleculeInfo = {
  name: "Water",
  formula: "H2O",
  molecularWeight: "18.015",
  cid: "962",
  sdf2d: "sdf2d-data",
  sdf3d: "sdf3d-data",
  cif: "",
  codId: null,
  useCif: false,
  synonyms: ["water"],
  description: "Water description",
  properties: {},
  safety: {},
};

const atomO: PickedAtom = {
  serial: 1,
  index: 0,
  elem: "O",
  x: 0,
  y: 0,
  z: 0,
};

const atomH1: PickedAtom = {
  serial: 2,
  index: 1,
  elem: "H",
  x: 0.96,
  y: 0,
  z: 0,
};

const atomH2: PickedAtom = {
  serial: 3,
  index: 2,
  elem: "H",
  x: -0.24,
  y: 0.93,
  z: 0,
};

const atomC: PickedAtom = {
  serial: 4,
  index: 3,
  elem: "C",
  x: 0,
  y: 0,
  z: 1.5,
};

describe("useMeasurement", () => {
  let mockViewerRef: { current: MoleculeViewerRef | null };
  let mockSetStructureFormat: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockViewerRef = {
      current: {
        captureSnapshot: jest.fn(),
        captureSnapshotAsync: jest.fn().mockResolvedValue(null),
        drawMeasurements: jest.fn(),
        clearMeasurements: jest.fn(),
        setMeasurementMode: jest.fn(),
      },
    };
    mockSetStructureFormat = jest.fn();
  });

  it("initializes with measurement mode inactive and empty picked atoms", () => {
    const { result } = renderHook(() =>
      useMeasurement({
        moleculeViewerRef: mockViewerRef,
        moleculeData: sampleMolecule,
        structureFormat: "3d",
        setStructureFormat: mockSetStructureFormat,
        isLandscape: false,
      }),
    );

    expect(result.current.isMeasuring).toBe(false);
    expect(result.current.measurementMode).toBe("distance");
    expect(result.current.pickedAtoms).toEqual([]);
    expect(result.current.measurementData).toBeNull();
  });

  it("toggles measurement mode on and off via handleToggleMeasure", () => {
    const { result } = renderHook(() =>
      useMeasurement({
        moleculeViewerRef: mockViewerRef,
        moleculeData: sampleMolecule,
        structureFormat: "3d",
        setStructureFormat: mockSetStructureFormat,
        isLandscape: false,
      }),
    );

    act(() => {
      result.current.handleToggleMeasure();
    });
    expect(result.current.isMeasuring).toBe(true);

    act(() => {
      result.current.handleToggleMeasure();
    });
    expect(result.current.isMeasuring).toBe(false);
  });

  it("throttles rapid atom picking within 100ms and allows picks after cooldown", () => {
    const { result } = renderHook(() =>
      useMeasurement({
        moleculeViewerRef: mockViewerRef,
        moleculeData: sampleMolecule,
        structureFormat: "3d",
        setStructureFormat: mockSetStructureFormat,
        isLandscape: false,
      }),
    );

    act(() => {
      result.current.handleToggleMeasure();
    });
    expect(result.current.isMeasuring).toBe(true);

    const realDateNow = Date.now;
    let mockTime = 1000;
    jest.spyOn(Date, "now").mockImplementation(() => mockTime);

    try {
      // First tap at t = 1000ms -> should succeed
      act(() => {
        result.current.handleAtomPicked(atomO);
      });
      expect(result.current.pickedAtoms).toHaveLength(1);
      expect(result.current.pickedAtoms[0].elem).toBe("O");

      // Rapid tap at t = 1050ms (diff = 50ms < 100ms) -> should be throttled/ignored
      mockTime = 1050;
      act(() => {
        result.current.handleAtomPicked(atomH1);
      });
      expect(result.current.pickedAtoms).toHaveLength(1);

      // Tap after cooldown at t = 1150ms (diff = 150ms >= 100ms) -> should succeed
      mockTime = 1150;
      act(() => {
        result.current.handleAtomPicked(atomH1);
      });
      expect(result.current.pickedAtoms).toHaveLength(2);
      expect(result.current.pickedAtoms[1].elem).toBe("H");
    } finally {
      Date.now = realDateNow;
    }
  });

  it("calculates distance correctly when 2 atoms are picked", () => {
    const { result } = renderHook(() =>
      useMeasurement({
        moleculeViewerRef: mockViewerRef,
        moleculeData: sampleMolecule,
        structureFormat: "3d",
        setStructureFormat: mockSetStructureFormat,
        isLandscape: false,
      }),
    );

    act(() => {
      result.current.handleToggleMeasure();
    });

    const realDateNow = Date.now;
    let mockTime = 1000;
    jest.spyOn(Date, "now").mockImplementation(() => mockTime);

    try {
      act(() => {
        result.current.handleAtomPicked(atomO);
      });
      mockTime += 150;
      act(() => {
        result.current.handleAtomPicked(atomH1);
      });

      expect(result.current.measurementData).not.toBeNull();
      expect(result.current.measurementData?.mode).toBe("distance");
      expect(result.current.measurementData?.displayValue).toBe("0.960 Å");
      expect(result.current.measurementData?.designation).toBe("d(O1 — H2)");
    } finally {
      Date.now = realDateNow;
    }
  });

  it("calculates angle correctly in angle mode when 3 atoms are picked", () => {
    const { result } = renderHook(() =>
      useMeasurement({
        moleculeViewerRef: mockViewerRef,
        moleculeData: sampleMolecule,
        structureFormat: "3d",
        setStructureFormat: mockSetStructureFormat,
        isLandscape: false,
      }),
    );

    act(() => {
      result.current.handleToggleMeasure();
      result.current.handleSelectMeasurementMode("angle");
    });

    const realDateNow = Date.now;
    let mockTime = 1000;
    jest.spyOn(Date, "now").mockImplementation(() => mockTime);

    try {
      act(() => {
        result.current.handleAtomPicked(atomH1);
      });
      mockTime += 150;
      act(() => {
        result.current.handleAtomPicked(atomO);
      });
      mockTime += 150;
      act(() => {
        result.current.handleAtomPicked(atomH2);
      });

      expect(result.current.measurementData).not.toBeNull();
      expect(result.current.measurementData?.mode).toBe("angle");
      expect(result.current.measurementData?.designation).toBe(
        "∠(H2 — O1 — H3)",
      );
    } finally {
      Date.now = realDateNow;
    }
  });

  it("calculates dihedral correctly in dihedral mode when 4 atoms are picked", () => {
    const { result } = renderHook(() =>
      useMeasurement({
        moleculeViewerRef: mockViewerRef,
        moleculeData: sampleMolecule,
        structureFormat: "3d",
        setStructureFormat: mockSetStructureFormat,
        isLandscape: false,
      }),
    );

    act(() => {
      result.current.handleToggleMeasure();
      result.current.handleSelectMeasurementMode("dihedral");
    });

    const realDateNow = Date.now;
    let mockTime = 1000;
    jest.spyOn(Date, "now").mockImplementation(() => mockTime);

    try {
      act(() => {
        result.current.handleAtomPicked(atomH1);
      });
      mockTime += 150;
      act(() => {
        result.current.handleAtomPicked(atomO);
      });
      mockTime += 150;
      act(() => {
        result.current.handleAtomPicked(atomH2);
      });
      mockTime += 150;
      act(() => {
        result.current.handleAtomPicked(atomC);
      });

      expect(result.current.measurementData).not.toBeNull();
      expect(result.current.measurementData?.mode).toBe("dihedral");
      expect(result.current.measurementData?.designation).toContain("τ(");
    } finally {
      Date.now = realDateNow;
    }
  });

  it("removes individual atom and clears all measurements", () => {
    const { result } = renderHook(() =>
      useMeasurement({
        moleculeViewerRef: mockViewerRef,
        moleculeData: sampleMolecule,
        structureFormat: "3d",
        setStructureFormat: mockSetStructureFormat,
        isLandscape: false,
      }),
    );

    act(() => {
      result.current.handleToggleMeasure();
    });

    const realDateNow = Date.now;
    let mockTime = 1000;
    jest.spyOn(Date, "now").mockImplementation(() => mockTime);

    try {
      act(() => {
        result.current.handleAtomPicked(atomO);
      });
      mockTime += 150;
      act(() => {
        result.current.handleAtomPicked(atomH1);
      });
      expect(result.current.pickedAtoms).toHaveLength(2);

      act(() => {
        result.current.handleRemoveAtom(0);
      });
      expect(result.current.pickedAtoms).toHaveLength(1);
      expect(result.current.pickedAtoms[0].elem).toBe("H");

      act(() => {
        result.current.handleClearMeasurements();
      });
      expect(result.current.pickedAtoms).toHaveLength(0);
    } finally {
      Date.now = realDateNow;
    }
  });
});
