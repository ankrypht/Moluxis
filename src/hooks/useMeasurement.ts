import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  RefObject,
} from "react";
import {
  MoleculeInfo,
  MeasurementMode,
  PickedAtom,
  MeasurementData,
} from "../types";
import {
  calculateDistance,
  calculateAngle,
  calculateDihedral,
  formatMeasurement,
  getRequiredAtomCount,
} from "../utils/geometry";
import { triggerMeasurementHaptic } from "../utils/haptics";
import { has3dStructure } from "../utils/structure";
import { MoleculeViewerRef } from "../components/MoleculeViewer";

export const EMPTY_MEASURE_PANEL_SIZE = {
  width: 0,
  height: 0,
  isLandscape: false,
};

interface UseMeasurementOptions {
  moleculeViewerRef: RefObject<MoleculeViewerRef | null>;
  moleculeData: MoleculeInfo | null;
  structureFormat: "3d" | "2d";
  setStructureFormat: (format: "3d" | "2d") => void;
  isLandscape: boolean;
  onStartMeasuring?: () => void;
}

export function useMeasurement({
  moleculeViewerRef,
  moleculeData,
  structureFormat,
  setStructureFormat,
  isLandscape,
  onStartMeasuring,
}: UseMeasurementOptions) {
  const currentMoleculeKey = moleculeData?.cid || moleculeData?.name || null;
  const [measuringMoleculeKey, setMeasuringMoleculeKey] = useState<
    string | null
  >(null);

  const [isMeasuringState, setIsMeasuringState] = useState(false);
  const [measurementMode, setMeasurementMode] =
    useState<MeasurementMode>("distance");
  const [pickedAtomsState, setPickedAtomsState] = useState<PickedAtom[]>([]);
  const [measurePanelSizeState, setMeasurePanelSizeState] = useState<{
    width: number;
    height: number;
    isLandscape: boolean;
  }>(EMPTY_MEASURE_PANEL_SIZE);

  const lastAtomPickTimeRef = useRef<number>(0);
  const ATOM_PICK_COOLDOWN_MS = 100;

  // Scoped to the active molecule: immediately resolves to false/empty when molecule changes
  const isCurrentMolecule =
    currentMoleculeKey !== null && measuringMoleculeKey === currentMoleculeKey;
  const isMeasuring = isCurrentMolecule ? isMeasuringState : false;
  const pickedAtoms = useMemo(
    () => (isCurrentMolecule ? pickedAtomsState : []),
    [isCurrentMolecule, pickedAtomsState],
  );
  const measurePanelSize = isCurrentMolecule
    ? measurePanelSizeState
    : EMPTY_MEASURE_PANEL_SIZE;

  const handleMeasurePanelLayout = useCallback(
    (size: { width: number; height: number }) => {
      setMeasurePanelSizeState((prev) => {
        if (
          prev.width === size.width &&
          prev.height === size.height &&
          prev.isLandscape === isLandscape
        ) {
          return prev;
        }
        return { ...size, isLandscape };
      });
    },
    [isLandscape],
  );

  const handleCloseMeasure = useCallback(() => {
    lastAtomPickTimeRef.current = 0;
    setMeasuringMoleculeKey(null);
    setIsMeasuringState(false);
    setPickedAtomsState([]);
    setMeasurePanelSizeState(EMPTY_MEASURE_PANEL_SIZE);
  }, []);

  const measurementData = useMemo<MeasurementData | null>(() => {
    const count = getRequiredAtomCount(measurementMode);
    if (pickedAtoms.length < count) return null;

    let val = 0;
    if (measurementMode === "distance" && pickedAtoms.length >= 2) {
      val = calculateDistance(pickedAtoms[0], pickedAtoms[1]);
    } else if (measurementMode === "angle" && pickedAtoms.length >= 3) {
      val = calculateAngle(pickedAtoms[0], pickedAtoms[1], pickedAtoms[2]);
    } else if (measurementMode === "dihedral" && pickedAtoms.length >= 4) {
      val = calculateDihedral(
        pickedAtoms[0],
        pickedAtoms[1],
        pickedAtoms[2],
        pickedAtoms[3],
      );
    }

    const formatted = formatMeasurement(val, measurementMode, pickedAtoms);
    return {
      mode: measurementMode,
      value: val,
      displayValue: formatted.displayValue,
      designation: formatted.designation,
      atoms: pickedAtoms,
    };
  }, [measurementMode, pickedAtoms]);

  useEffect(() => {
    if (!isMeasuring) {
      moleculeViewerRef.current?.clearMeasurements();
      return;
    }

    if (pickedAtoms.length > 0) {
      moleculeViewerRef.current?.drawMeasurements(
        measurementMode,
        pickedAtoms,
        measurementData ? measurementData.displayValue : undefined,
      );
    } else {
      moleculeViewerRef.current?.clearMeasurements();
    }
  }, [
    isMeasuring,
    measurementMode,
    pickedAtoms,
    measurementData,
    moleculeViewerRef,
  ]);

  const onStartMeasuringRef = useRef(onStartMeasuring);
  useEffect(() => {
    onStartMeasuringRef.current = onStartMeasuring;
  });

  const handleToggleMeasure = useCallback(() => {
    if (isMeasuring) {
      handleCloseMeasure();
    } else {
      if (structureFormat === "2d" && has3dStructure(moleculeData)) {
        setStructureFormat("3d");
      }
      setMeasuringMoleculeKey(currentMoleculeKey);
      setIsMeasuringState(true);
      onStartMeasuringRef.current?.();
    }
  }, [
    isMeasuring,
    structureFormat,
    moleculeData,
    handleCloseMeasure,
    setStructureFormat,
    currentMoleculeKey,
  ]);

  const handleSelectMeasurementMode = useCallback((mode: MeasurementMode) => {
    setMeasurementMode(mode);
    setPickedAtomsState([]);
  }, []);

  const handleRemoveAtom = useCallback((index: number) => {
    setPickedAtomsState((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleClearMeasurements = useCallback(() => {
    setPickedAtomsState([]);
  }, []);

  const handleAtomPicked = useCallback(
    (atom: PickedAtom) => {
      if (!isMeasuring) return;
      const now = Date.now();
      if (now - lastAtomPickTimeRef.current < ATOM_PICK_COOLDOWN_MS) {
        return;
      }
      lastAtomPickTimeRef.current = now;
      triggerMeasurementHaptic();
      setMeasuringMoleculeKey(currentMoleculeKey);

      setPickedAtomsState((prev) => {
        const existingIndex = prev.findIndex((a) =>
          a.index !== undefined && atom.index !== undefined
            ? a.index === atom.index
            : a.serial !== undefined && a.serial === atom.serial,
        );
        if (existingIndex !== -1) {
          return prev.filter((_, i) => i !== existingIndex);
        }

        const maxCount = getRequiredAtomCount(measurementMode);
        if (prev.length >= maxCount) {
          return [atom];
        }
        return [...prev, atom];
      });
    },
    [isMeasuring, measurementMode, currentMoleculeKey],
  );

  const resetMeasurement = useCallback(() => {
    lastAtomPickTimeRef.current = 0;
    setMeasuringMoleculeKey(null);
    setIsMeasuringState(false);
    setPickedAtomsState([]);
    setMeasurePanelSizeState(EMPTY_MEASURE_PANEL_SIZE);
  }, []);

  return {
    isMeasuring,
    measurementMode,
    pickedAtoms,
    measurementData,
    measurePanelSize,
    handleMeasurePanelLayout,
    handleCloseMeasure,
    handleToggleMeasure,
    handleSelectMeasurementMode,
    handleRemoveAtom,
    handleClearMeasurements,
    handleAtomPicked,
    resetMeasurement,
  };
}
