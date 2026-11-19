import React, { createContext, useContext, useMemo, RefObject } from "react";
import {
  MoleculeInfo,
  MeasurementMode,
  PickedAtom,
  MeasurementData,
} from "../types";
import { MoleculeViewerRef } from "../components/MoleculeViewer";
import {
  useMeasurement,
  EMPTY_MEASURE_PANEL_SIZE,
} from "../hooks/useMeasurement";

export interface MeasurementStatusContextValue {
  isMeasuring: boolean;
  measurementMode: MeasurementMode;
  measurePanelSize: {
    width: number;
    height: number;
    isLandscape: boolean;
  };
  handleToggleMeasure: () => void;
  handleCloseMeasure: () => void;
  handleAtomPicked: (atom: PickedAtom) => void;
  handleMeasurePanelLayout: (size: { width: number; height: number }) => void;
  resetMeasurement: () => void;
}

export interface MeasurementDetailsContextValue {
  mode: MeasurementMode;
  pickedAtoms: PickedAtom[];
  measurementData: MeasurementData | null;
  onSelectMode: (mode: MeasurementMode) => void;
  onRemoveAtom: (index: number) => void;
  onClear: () => void;
  onClose: () => void;
  onPanelLayout: (size: { width: number; height: number }) => void;
}

const defaultStatusValue: MeasurementStatusContextValue = {
  isMeasuring: false,
  measurementMode: "distance",
  measurePanelSize: EMPTY_MEASURE_PANEL_SIZE,
  handleToggleMeasure: () => {},
  handleCloseMeasure: () => {},
  handleAtomPicked: () => {},
  handleMeasurePanelLayout: () => {},
  resetMeasurement: () => {},
};

const defaultDetailsValue: MeasurementDetailsContextValue = {
  mode: "distance",
  pickedAtoms: [],
  measurementData: null,
  onSelectMode: () => {},
  onRemoveAtom: () => {},
  onClear: () => {},
  onClose: () => {},
  onPanelLayout: () => {},
};

export const MeasurementStatusContext =
  createContext<MeasurementStatusContextValue>(defaultStatusValue);

export const MeasurementDetailsContext =
  createContext<MeasurementDetailsContextValue>(defaultDetailsValue);

export interface MeasurementProviderProps {
  moleculeViewerRef: RefObject<MoleculeViewerRef | null>;
  moleculeData: MoleculeInfo | null;
  structureFormat: "3d" | "2d";
  setStructureFormat: (format: "3d" | "2d") => void;
  isLandscape: boolean;
  onStartMeasuring?: () => void;
  children: React.ReactNode;
}

export const MeasurementProvider: React.FC<MeasurementProviderProps> = ({
  moleculeViewerRef,
  moleculeData,
  structureFormat,
  setStructureFormat,
  isLandscape,
  onStartMeasuring,
  children,
}) => {
  const measurement = useMeasurement({
    moleculeViewerRef,
    moleculeData,
    structureFormat,
    setStructureFormat,
    isLandscape,
    onStartMeasuring,
  });

  const statusValue = useMemo<MeasurementStatusContextValue>(
    () => ({
      isMeasuring: measurement.isMeasuring,
      measurementMode: measurement.measurementMode,
      measurePanelSize: measurement.measurePanelSize,
      handleToggleMeasure: measurement.handleToggleMeasure,
      handleCloseMeasure: measurement.handleCloseMeasure,
      handleAtomPicked: measurement.handleAtomPicked,
      handleMeasurePanelLayout: measurement.handleMeasurePanelLayout,
      resetMeasurement: measurement.resetMeasurement,
    }),
    [
      measurement.isMeasuring,
      measurement.measurementMode,
      measurement.measurePanelSize,
      measurement.handleToggleMeasure,
      measurement.handleCloseMeasure,
      measurement.handleAtomPicked,
      measurement.handleMeasurePanelLayout,
      measurement.resetMeasurement,
    ],
  );

  const detailsValue = useMemo<MeasurementDetailsContextValue>(
    () => ({
      mode: measurement.measurementMode,
      pickedAtoms: measurement.pickedAtoms,
      measurementData: measurement.measurementData,
      onSelectMode: measurement.handleSelectMeasurementMode,
      onRemoveAtom: measurement.handleRemoveAtom,
      onClear: measurement.handleClearMeasurements,
      onClose: measurement.handleCloseMeasure,
      onPanelLayout: measurement.handleMeasurePanelLayout,
    }),
    [
      measurement.measurementMode,
      measurement.pickedAtoms,
      measurement.measurementData,
      measurement.handleSelectMeasurementMode,
      measurement.handleRemoveAtom,
      measurement.handleClearMeasurements,
      measurement.handleCloseMeasure,
      measurement.handleMeasurePanelLayout,
    ],
  );

  return (
    <MeasurementStatusContext.Provider value={statusValue}>
      <MeasurementDetailsContext.Provider value={detailsValue}>
        {children}
      </MeasurementDetailsContext.Provider>
    </MeasurementStatusContext.Provider>
  );
};

export function useMeasurementStatus(): MeasurementStatusContextValue {
  return useContext(MeasurementStatusContext);
}

export function useMeasurementDetails(): MeasurementDetailsContextValue {
  return useContext(MeasurementDetailsContext);
}
