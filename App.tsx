import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  type TextInputInstance,
  Keyboard,
  useWindowDimensions,
  ViewStyle,
  Platform,
  AppState,
  BackHandler,
} from "react-native";
import {
  useSafeAreaInsets,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { NavigationBar } from "expo-navigation-bar";
import * as SplashScreen from "expo-splash-screen";

import {
  MoleculeInfo,
  VisualizationType,
  MeasurementMode,
  PickedAtom,
  MeasurementData,
} from "./src/types";
import {
  calculateDistance,
  calculateAngle,
  calculateDihedral,
  formatMeasurement,
  getRequiredAtomCount,
} from "./src/utils/geometry";
import { triggerMeasurementHaptic } from "./src/utils/haptics";
import { useMoleculeSearch } from "./src/hooks/useMoleculeSearch";
import { useCompoundHistoryAndBookmarks } from "./src/hooks/useCompoundHistoryAndBookmarks";
import { getStyles } from "./App.styles";

import {
  MoleculeViewer,
  MoleculeViewerRef,
} from "./src/components/MoleculeViewer";
import { FloatingHeader } from "./src/components/FloatingHeader";
import { StructureControls } from "./src/components/StructureControls";
import { FloatingDock } from "./src/components/FloatingDock";
import { MeasurementPanel } from "./src/components/MeasurementPanel";
import { MoleculeInfoSheet } from "./src/components/MoleculeInfoSheet";
import { LandscapeNameOverlay } from "./src/components/LandscapeNameOverlay";
import { ExitFullScreenButton } from "./src/components/ExitFullScreenButton";
import { HistoryBookmarksModal } from "./src/components/HistoryBookmarksModal";
import { ShareExportModal } from "./src/components/ShareExportModal";
import { CustomAlertModal } from "./src/components/CustomAlert";

SplashScreen.preventAutoHideAsync().catch(() => {});

const has3dStructure = (data: MoleculeInfo | null | undefined): boolean =>
  Boolean(data?.sdf3d || data?.useCif);

const getDefaultStructureFormat = (
  data: MoleculeInfo | null | undefined,
): "3d" | "2d" => {
  if (data && !has3dStructure(data) && data.sdf2d) {
    return "2d";
  }
  return "3d";
};

export default function App() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <MoleculeExplorer />
    </SafeAreaProvider>
  );
}

function MoleculeExplorer() {
  const {
    searchText,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    isLoading,
    moleculeData,
    handleTextChange,
    searchMolecule,
    selectSuggestion,
    clearMolecule,
  } = useMoleculeSearch();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const {
    history,
    bookmarks,
    addHistory,
    removeHistory,
    clearHistory,
    toggleBookmark,
    removeBookmark,
    clearBookmarks,
    isBookmarked,
  } = useCompoundHistoryAndBookmarks();

  // Visualization State
  const searchInputRef = useRef<TextInputInstance>(null);
  const moleculeViewerRef = useRef<MoleculeViewerRef>(null);
  const [vizStyle, setVizStyle] = useState<VisualizationType>("ballStick");
  const [showLabels, setShowLabels] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [structureFormat, setStructureFormat] = useState<"3d" | "2d">(() =>
    getDefaultStructureFormat(moleculeData),
  );
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurementMode, setMeasurementMode] =
    useState<MeasurementMode>("distance");
  const [pickedAtoms, setPickedAtoms] = useState<PickedAtom[]>([]);
  const [prevMoleculeData, setPrevMoleculeData] = useState(moleculeData);
  const [showDisplayOptions, setShowDisplayOptions] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyModalTab, setHistoryModalTab] = useState<
    "history" | "bookmarks"
  >("history");
  const [showShareModal, setShowShareModal] = useState(false);
  const [snapshotUri, setSnapshotUri] = useState<string | null>(null);
  const [isCapturingSnapshot, setIsCapturingSnapshot] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const isInteracting = Boolean(
    isKeyboardVisible || showHistoryModal || showSuggestions || showShareModal,
  );

  // Automatically record inspected compounds in search history
  const lastRecordedNameRef = useRef<string | null>(null);
  useEffect(() => {
    if (!moleculeData) {
      lastRecordedNameRef.current = null;
      return;
    }
    if (
      moleculeData.name &&
      moleculeData.name !== lastRecordedNameRef.current
    ) {
      lastRecordedNameRef.current = moleculeData.name;
      addHistory({
        name: moleculeData.name,
        formula: moleculeData.formula,
        cid: moleculeData.cid,
        molecularWeight: moleculeData.molecularWeight,
      });
    }
  }, [moleculeData, addHistory]);

  const isCurrentBookmarked = Boolean(
    moleculeData?.name && isBookmarked(moleculeData.name),
  );

  const { top, bottom, left, right } = insets;
  const styles = useMemo(
    () => getStyles(width, height, { top, bottom, left, right }),
    [width, height, top, bottom, left, right],
  );

  const [measurePanelSize, setMeasurePanelSize] = useState<{
    width: number;
    height: number;
    isLandscape: boolean;
  }>({ width: 0, height: 0, isLandscape });

  const handleMeasurePanelLayout = useCallback(
    (size: { width: number; height: number }) => {
      setMeasurePanelSize((prev) => {
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

  useEffect(() => {
    if (!isMeasuring) {
      setMeasurePanelSize((prev) =>
        prev.width === 0 &&
        prev.height === 0 &&
        prev.isLandscape === isLandscape
          ? prev
          : { width: 0, height: 0, isLandscape },
      );
    }
  }, [isMeasuring, isLandscape]);

  const dynamicViewerContainerStyle = useMemo<ViewStyle>(() => {
    if (isMeasuring) {
      const hasMatchingSize = measurePanelSize.isLandscape === isLandscape;
      if (isLandscape) {
        const panelWidth =
          hasMatchingSize && measurePanelSize.width > 0
            ? measurePanelSize.width
            : "width" in styles.measurementPanelWrapper &&
                typeof styles.measurementPanelWrapper.width === "number"
              ? styles.measurementPanelWrapper.width
              : 360;
        return {
          right: panelWidth,
          bottom: 0,
        };
      }
      const panelHeight =
        hasMatchingSize && measurePanelSize.height > 0
          ? measurePanelSize.height
          : 210;
      return {
        bottom: panelHeight,
        right: 0,
      };
    }
    return {
      right: isLandscape && showInfo ? "45%" : 0,
      bottom: 0,
    };
  }, [
    isMeasuring,
    isLandscape,
    showInfo,
    measurePanelSize.width,
    measurePanelSize.height,
    measurePanelSize.isLandscape,
    styles.measurementPanelWrapper,
  ]);
  const dynamicHeaderContainerStyle = useMemo<ViewStyle>(
    () => ({
      right: isLandscape ? (showInfo ? "45%" : insets.right) : 0,
    }),
    [isLandscape, showInfo, insets.right],
  );
  const dynamicDockContainerStyle = useMemo<ViewStyle>(
    () => ({
      ...(isLandscape
        ? showInfo
          ? { right: "45%" }
          : showShareModal
            ? { right: "52%" }
            : {}
        : { right: 0 }),
      marginRight: isLandscape && (showInfo || showShareModal) ? 8 : 0,
      zIndex: showDisplayOptions ? 150 : 50,
    }),
    [isLandscape, showInfo, showShareModal, showDisplayOptions],
  );

  if (moleculeData !== prevMoleculeData) {
    setPrevMoleculeData(moleculeData);
    setSnapshotUri(null);
    setIsCapturingSnapshot(false);
    setIsAnimated(false);
    setIsMeasuring(false);
    setPickedAtoms([]);
    if (moleculeData) {
      setStructureFormat(getDefaultStructureFormat(moleculeData));
    }
  }

  useEffect(() => {
    // Hide navigation bar on Android only and re-apply on app resume
    if (Platform.OS === "android") {
      NavigationBar.setHidden(true);
      const subscription = AppState.addEventListener("change", (state) => {
        if (state === "active") {
          NavigationBar.setHidden(true);
        }
      });
      return () => subscription.remove();
    }
  }, []);

  const toggleAnimation = useCallback(() => {
    const next = !isAnimated;
    setIsAnimated(next);
    if (next) {
      setIsMeasuring(false);
      setPickedAtoms([]);
    }
  }, [isAnimated]);

  const handleSelectFormat = useCallback((format: "2d" | "3d") => {
    setStructureFormat(format);
    setIsMeasuring(false);
    setPickedAtoms([]);
  }, []);

  const handleSearch = useCallback(
    (query?: string) => {
      searchInputRef.current?.blur();
      Keyboard.dismiss();
      setIsAnimated(false);
      searchMolecule(query);
    },
    [searchMolecule],
  );

  const handleSelectSuggestion = useCallback(
    (item: string) => {
      searchInputRef.current?.blur();
      Keyboard.dismiss();
      setIsAnimated(false);
      selectSuggestion(item);
    },
    [selectSuggestion],
  );

  const handleClearToShowcase = useCallback(() => {
    searchInputRef.current?.blur();
    Keyboard.dismiss();
    setIsAnimated(false);
    setIsMeasuring(false);
    setPickedAtoms([]);
    setShowInfo(false);
    setShowDisplayOptions(false);
    setShowHistoryModal(false);
    setShowShareModal(false);
    clearMolecule();
  }, [clearMolecule]);

  const handleToggleCurrentBookmark = useCallback(() => {
    if (moleculeData?.name) {
      toggleBookmark({
        name: moleculeData.name,
        formula: moleculeData.formula,
        cid: moleculeData.cid,
        molecularWeight: moleculeData.molecularWeight,
      });
    }
  }, [moleculeData, toggleBookmark]);

  const handleOpenHistoryModal = useCallback(
    (initialTab: "history" | "bookmarks" = "history") => {
      searchInputRef.current?.blur();
      Keyboard.dismiss();
      setHistoryModalTab(initialTab);
      setShowHistoryModal(true);
      setShowInfo(false);
      setShowDisplayOptions(false);
    },
    [],
  );

  const handleCloseHistoryModal = useCallback(() => {
    setShowHistoryModal(false);
  }, []);

  const handleToggleInfo = useCallback(() => {
    searchInputRef.current?.blur();
    Keyboard.dismiss();
    setShowInfo((prev) => !prev);
    setShowDisplayOptions(false);
    setIsMeasuring(false);
    setPickedAtoms([]);
  }, []);

  const handleCloseInfo = useCallback(() => {
    setShowInfo(false);
  }, []);

  const handleSelectStyle = useCallback((style: VisualizationType) => {
    setVizStyle(style);
    setShowDisplayOptions(false);
  }, []);

  const handleToggleDisplayOptions = useCallback(() => {
    setShowDisplayOptions((prev) => !prev);
  }, []);

  const handleToggleLabels = useCallback(() => {
    setShowLabels((prev) => !prev);
  }, []);

  const snapshotTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (snapshotTimeoutRef.current) {
        clearTimeout(snapshotTimeoutRef.current);
      }
    };
  }, []);

  const handleCaptureSnapshot = useCallback(() => {
    if (snapshotTimeoutRef.current) {
      clearTimeout(snapshotTimeoutRef.current);
    }
    setIsCapturingSnapshot(true);
    setSnapshotUri(null);
    moleculeViewerRef.current?.captureSnapshot();

    snapshotTimeoutRef.current = setTimeout(() => {
      setIsCapturingSnapshot(false);
    }, 4000);
  }, []);

  const handleSnapshotCaptured = useCallback((uri: string | null) => {
    if (snapshotTimeoutRef.current) {
      clearTimeout(snapshotTimeoutRef.current);
      snapshotTimeoutRef.current = null;
    }
    setSnapshotUri(uri);
    setIsCapturingSnapshot(false);
  }, []);

  const handleOpenShareModal = useCallback(() => {
    searchInputRef.current?.blur();
    Keyboard.dismiss();
    setShowShareModal(true);
    setShowInfo(false);
    setShowDisplayOptions(false);
    setShowHistoryModal(false);
    handleCaptureSnapshot();
  }, [handleCaptureSnapshot]);

  const handleCloseShareModal = useCallback(() => {
    setShowShareModal(false);
  }, []);

  const handleEnterZenMode = useCallback(() => {
    setShowControls(false);
    setShowInfo(false);
    setShowDisplayOptions(false);
    setShowHistoryModal(false);
    setShowShareModal(false);
    setIsMeasuring(false);
    setPickedAtoms([]);
  }, []);

  const handleExitZenMode = useCallback(() => {
    setShowControls(true);
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
  }, [isMeasuring, measurementMode, pickedAtoms, measurementData]);

  const handleToggleMeasure = useCallback(() => {
    if (isMeasuring) {
      setIsMeasuring(false);
      setPickedAtoms([]);
    } else {
      if (structureFormat === "2d" && has3dStructure(moleculeData)) {
        setStructureFormat("3d");
      }
      setIsMeasuring(true);
      setIsAnimated(false);
      setShowDisplayOptions(false);
      setShowInfo(false);
    }
  }, [isMeasuring, structureFormat, moleculeData]);

  const handleCloseMeasure = useCallback(() => {
    setIsMeasuring(false);
    setPickedAtoms([]);
  }, []);

  useEffect(() => {
    if (!isMeasuring || showShareModal || showHistoryModal) return;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleCloseMeasure();
        return true;
      },
    );
    return () => subscription.remove();
  }, [isMeasuring, showShareModal, showHistoryModal, handleCloseMeasure]);

  const handleSelectMeasurementMode = useCallback((mode: MeasurementMode) => {
    setMeasurementMode(mode);
    setPickedAtoms([]);
  }, []);

  const handleRemoveAtom = useCallback((index: number) => {
    setPickedAtoms((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleClearMeasurements = useCallback(() => {
    setPickedAtoms([]);
  }, []);

  const handleAtomPicked = useCallback(
    (atom: PickedAtom) => {
      if (!isMeasuring) return;
      triggerMeasurementHaptic();

      setPickedAtoms((prev) => {
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
    [isMeasuring, measurementMode],
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* FULL SCREEN VIEWER */}
      <MoleculeViewer
        ref={moleculeViewerRef}
        moleculeData={moleculeData}
        isLoading={isLoading}
        structureFormat={structureFormat}
        vizStyle={vizStyle}
        showLabels={showLabels}
        isAnimated={isAnimated}
        isInteracting={isInteracting}
        isMeasuring={isMeasuring}
        measurementMode={measurementMode}
        onAtomPicked={handleAtomPicked}
        containerStyle={dynamicViewerContainerStyle}
        styles={styles}
        onSelectMolecule={handleSelectSuggestion}
        topOffset={
          headerHeight > 0 ? headerHeight + (isLandscape ? 18 : 16) : 0
        }
        history={history}
        bookmarks={bookmarks}
        onOpenHistory={handleOpenHistoryModal}
        onSnapshotCaptured={handleSnapshotCaptured}
      />

      {/* FLOATING HEADER (Island) */}
      {showControls && !isMeasuring && (
        <FloatingHeader
          searchInputRef={searchInputRef}
          searchText={searchText}
          suggestions={suggestions}
          showSuggestions={showSuggestions}
          isLoading={isLoading}
          moleculeData={moleculeData}
          isLandscape={isLandscape}
          showInfo={showInfo}
          isAnimated={isAnimated}
          structureFormat={structureFormat}
          containerStyle={dynamicHeaderContainerStyle}
          styles={styles}
          onTextChange={handleTextChange}
          onFocus={() => setShowSuggestions(true)}
          onSearch={handleSearch}
          onSelectSuggestion={handleSelectSuggestion}
          onToggleAnimation={toggleAnimation}
          onSelectFormat={handleSelectFormat}
          onLayoutHeader={setHeaderHeight}
          onClear={handleClearToShowcase}
          isBookmarked={isCurrentBookmarked}
          onToggleBookmark={handleToggleCurrentBookmark}
          onOpenHistory={() => handleOpenHistoryModal("history")}
          onOpenShare={handleOpenShareModal}
        />
      )}

      {/* FLOATING LEFT RAIL (Structure & Animation in Landscape) */}
      {moleculeData &&
        !isLoading &&
        showControls &&
        !isMeasuring &&
        isLandscape && (
          <View
            style={styles.floatingLeftRailContainer}
            pointerEvents="box-none"
          >
            <View style={styles.floatingLeftRail}>
              <StructureControls
                moleculeData={moleculeData}
                isAnimated={isAnimated}
                structureFormat={structureFormat}
                onToggleAnimation={toggleAnimation}
                onSelectFormat={handleSelectFormat}
                styles={styles}
                isLandscape={true}
              />
            </View>
          </View>
        )}

      {/* FLOATING DOCK (Controls) */}
      {moleculeData && !isLoading && showControls && !isMeasuring && (
        <FloatingDock
          vizStyle={vizStyle}
          showLabels={showLabels}
          showInfo={showInfo}
          showDisplayOptions={showDisplayOptions}
          isMeasuring={isMeasuring}
          onToggleMeasure={handleToggleMeasure}
          containerStyle={dynamicDockContainerStyle}
          styles={styles}
          onSelectStyle={handleSelectStyle}
          onToggleDisplayOptions={handleToggleDisplayOptions}
          onToggleInfo={handleToggleInfo}
          onToggleLabels={handleToggleLabels}
          onEnterZenMode={handleEnterZenMode}
          isLandscape={isLandscape}
          isCompact={Boolean(isLandscape && (showInfo || showShareModal))}
        />
      )}

      {/* INTERACTIVE ATOM PICKING & MEASUREMENT PANEL */}
      {moleculeData &&
        !isLoading &&
        isMeasuring &&
        showControls &&
        !showShareModal &&
        !showHistoryModal && (
          <MeasurementPanel
            mode={measurementMode}
            pickedAtoms={pickedAtoms}
            measurementData={measurementData}
            onSelectMode={handleSelectMeasurementMode}
            onRemoveAtom={handleRemoveAtom}
            onClear={handleClearMeasurements}
            onClose={handleCloseMeasure}
            styles={styles}
            isLandscape={isLandscape}
            onPanelLayout={handleMeasurePanelLayout}
          />
        )}

      {/* ANIMATED BOTTOM SHEET / SIDE DRAWER (Info Panel) */}
      {moleculeData && !isLoading && (
        <MoleculeInfoSheet
          moleculeData={moleculeData}
          showInfo={showInfo}
          isLandscape={isLandscape}
          width={width}
          height={height}
          insets={insets}
          styles={styles}
          onClose={handleCloseInfo}
          onOpenShare={handleOpenShareModal}
        />
      )}

      {/* Landscape Name Overlay (visible when info sheet is closed) */}
      {moleculeData &&
        !isLoading &&
        !showInfo &&
        showControls &&
        !isMeasuring && (
          <LandscapeNameOverlay name={moleculeData.name} styles={styles} />
        )}

      {/* Floating Exit Full Screen Button */}
      {!showControls && (
        <ExitFullScreenButton onPress={handleExitZenMode} styles={styles} />
      )}

      {/* RECENT SEARCHES & FAVORITES MODAL */}
      <HistoryBookmarksModal
        visible={showHistoryModal}
        onClose={handleCloseHistoryModal}
        onSelectCompound={handleSelectSuggestion}
        history={history}
        bookmarks={bookmarks}
        onToggleBookmark={toggleBookmark}
        onRemoveHistoryItem={removeHistory}
        onRemoveBookmarkItem={removeBookmark}
        onClearHistory={clearHistory}
        onClearBookmarks={clearBookmarks}
        isBookmarked={isBookmarked}
        initialTab={historyModalTab}
        styles={styles}
        isLandscape={isLandscape}
        height={height}
      />

      {/* SHARE & EXPORT MODAL */}
      <ShareExportModal
        visible={showShareModal}
        onClose={handleCloseShareModal}
        moleculeData={moleculeData}
        snapshotUri={snapshotUri}
        isCapturingSnapshot={isCapturingSnapshot}
        onRefreshSnapshot={handleCaptureSnapshot}
        styles={styles}
        isLandscape={isLandscape}
        height={height}
      />

      {/* THEMED CUSTOM ALERT POPUP */}
      <CustomAlertModal
        styles={styles}
        isLandscape={isLandscape}
        insets={insets}
      />
    </View>
  );
}
