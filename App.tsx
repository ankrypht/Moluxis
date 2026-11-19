import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  View,
  type TextInputInstance,
  Keyboard,
  useWindowDimensions,
} from "react-native";
import {
  useSafeAreaInsets,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";

import { VisualizationType } from "./src/types";
import { getDefaultStructureFormat } from "./src/utils/structure";
import { useMoleculeSearch } from "./src/hooks/useMoleculeSearch";
import { useCompoundHistoryAndBookmarks } from "./src/hooks/useCompoundHistoryAndBookmarks";
import {
  IS_DEV_TEST_ENABLED,
  useNotificationsAndUpdates,
} from "./src/hooks/useNotificationsAndUpdates";
import { useSystemUI } from "./src/hooks/useSystemUI";
import { useSnapshotCapture } from "./src/hooks/useSnapshotCapture";
import { useMeasurement } from "./src/hooks/useMeasurement";
import { useAppLayoutStyles } from "./src/hooks/useAppLayoutStyles";
import { useAppBackHandler } from "./src/hooks/useAppBackHandler";
import { FeaturedCategoryKey } from "./src/constants/featuredMolecules";
import { setSavedFeaturedCategory } from "./src/components/FeaturedMolecules";
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
import { AppModals } from "./src/components/AppModals";
import { Alert, useActiveAlert } from "./src/components/CustomAlert";
import { CURRENT_RELEASE_NOTES } from "./src/services/updates/updateNoticeService";

SplashScreen.preventAutoHideAsync().catch(() => {});

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

  const { isKeyboardVisible } = useSystemUI();

  // Visualization & View State
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
  const [prevMoleculeData, setPrevMoleculeData] = useState(moleculeData);
  const [showDisplayOptions, setShowDisplayOptions] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  // Modals State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyModalTab, setHistoryModalTab] = useState<
    "history" | "bookmarks"
  >("history");
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showDevTestModal, setShowDevTestModal] = useState(false);

  // Snapshots
  const {
    snapshotUri,
    isCapturingSnapshot,
    handleCaptureSnapshot,
    handleSnapshotCaptured,
    resetSnapshot,
  } = useSnapshotCapture(moleculeViewerRef);

  // Measurement
  const handleStartMeasuring = useCallback(() => {
    setIsAnimated(false);
    setShowDisplayOptions(false);
    setShowInfo(false);
  }, []);

  const {
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
  } = useMeasurement({
    moleculeViewerRef,
    moleculeData,
    structureFormat,
    setStructureFormat,
    isLandscape,
    onStartMeasuring: handleStartMeasuring,
  });

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

  // Dynamic Layout Styles
  const {
    dynamicViewerContainerStyle,
    dynamicHeaderContainerStyle,
    dynamicDockContainerStyle,
  } = useAppLayoutStyles({
    isLandscape,
    isMeasuring,
    showInfo,
    showShareModal,
    showDisplayOptions,
    measurePanelSize,
    measurementPanelWrapperStyle: styles.measurementPanelWrapper,
  });

  // Reset transient states when molecule changes
  if (moleculeData !== prevMoleculeData) {
    setPrevMoleculeData(moleculeData);
    resetSnapshot();
    setIsAnimated(false);
    resetMeasurement();
    if (moleculeData) {
      setStructureFormat(getDefaultStructureFormat(moleculeData));
    }
  }

  const toggleAnimation = useCallback(() => {
    const next = !isAnimated;
    setIsAnimated(next);
    if (next) {
      handleCloseMeasure();
    }
  }, [isAnimated, handleCloseMeasure]);

  const handleSelectFormat = useCallback(
    (format: "2d" | "3d") => {
      setStructureFormat(format);
      handleCloseMeasure();
    },
    [handleCloseMeasure],
  );

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
    handleCloseMeasure();
    setShowInfo(false);
    setShowDisplayOptions(false);
    setShowHistoryModal(false);
    setShowShareModal(false);
    setShowAboutModal(false);
    clearMolecule();
  }, [clearMolecule, handleCloseMeasure]);

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
      setShowAboutModal(false);
    },
    [],
  );

  const handleCloseHistoryModal = useCallback(() => {
    setShowHistoryModal(false);
  }, []);

  const handleOpenAboutModal = useCallback(() => {
    searchInputRef.current?.blur();
    Keyboard.dismiss();
    setShowAboutModal(true);
    setShowInfo(false);
    setShowDisplayOptions(false);
    setShowHistoryModal(false);
    setShowShareModal(false);
  }, []);

  const handleCloseAboutModal = useCallback(() => {
    setShowAboutModal(false);
  }, []);

  const handleToggleInfo = useCallback(() => {
    searchInputRef.current?.blur();
    Keyboard.dismiss();
    setShowInfo((prev) => !prev);
    setShowDisplayOptions(false);
    handleCloseMeasure();
  }, [handleCloseMeasure]);

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

  const handleOpenShareModal = useCallback(() => {
    searchInputRef.current?.blur();
    Keyboard.dismiss();
    setShowShareModal(true);
    setShowInfo(false);
    setShowDisplayOptions(false);
    setShowHistoryModal(false);
    setShowAboutModal(false);
    handleCaptureSnapshot();
  }, [handleCaptureSnapshot]);

  const handleCloseShareModal = useCallback(() => {
    setShowShareModal(false);
    resetSnapshot();
  }, [resetSnapshot]);

  const handleEnterZenMode = useCallback(() => {
    setShowControls(false);
    setShowInfo(false);
    setShowDisplayOptions(false);
    setShowHistoryModal(false);
    setShowShareModal(false);
    setShowAboutModal(false);
    handleCloseMeasure();
  }, [handleCloseMeasure]);

  const handleExitZenMode = useCallback(() => {
    setShowControls(true);
  }, []);

  const handleOpenBookmarksFromLink = useCallback(() => {
    handleOpenHistoryModal("bookmarks");
  }, [handleOpenHistoryModal]);

  const handleOpenCategoryFromLink = useCallback(
    (category: FeaturedCategoryKey) => {
      setSavedFeaturedCategory(category);
      handleClearToShowcase();
    },
    [handleClearToShowcase],
  );

  const {
    releaseInfo,
    showUpdateModal,
    dismissUpdateModal,
    whatsNewNotes,
    showWhatsNewModal,
    dismissWhatsNewModal,
    openPreviewUpdateModal,
    openPreviewWhatsNewModal,
    runLiveUpdateCheck,
    refreshVersionNotice,
  } = useNotificationsAndUpdates({
    bookmarks,
    onSelectMolecule: handleSelectSuggestion,
    onOpenBookmarks: handleOpenBookmarksFromLink,
    onOpenCategory: handleOpenCategoryFromLink,
  });

  const handleOpenWhatsNewFromAbout = useCallback(() => {
    openPreviewWhatsNewModal(CURRENT_RELEASE_NOTES);
  }, [openPreviewWhatsNewModal]);

  const handleCloseDisplayOptions = useCallback(() => {
    setShowDisplayOptions(false);
  }, []);

  const handleCloseSuggestions = useCallback(() => {
    searchInputRef.current?.blur();
    Keyboard.dismiss();
    setShowSuggestions(false);
  }, [setShowSuggestions]);

  const handleCloseDevTestModal = useCallback(() => {
    setShowDevTestModal(false);
  }, []);

  const hasActiveAlert = useActiveAlert();

  const handleCloseAlert = useCallback(() => {
    Alert.handleBackPress();
  }, []);

  const isInteracting = Boolean(
    isKeyboardVisible ||
    hasActiveAlert ||
    showHistoryModal ||
    showSuggestions ||
    showShareModal ||
    showAboutModal ||
    showUpdateModal ||
    showWhatsNewModal ||
    showDevTestModal,
  );

  // Hardware Back Button Navigation
  useAppBackHandler({
    hasActiveAlert,
    onCloseAlert: handleCloseAlert,
    showUpdateModal,
    onCloseUpdateModal: dismissUpdateModal,
    showWhatsNewModal,
    onCloseWhatsNewModal: dismissWhatsNewModal,
    showDevTestModal,
    onCloseDevTestModal: handleCloseDevTestModal,
    showShareModal,
    onCloseShareModal: handleCloseShareModal,
    showHistoryModal,
    onCloseHistoryModal: handleCloseHistoryModal,
    showAboutModal,
    onCloseAboutModal: handleCloseAboutModal,
    isMeasuring,
    onCloseMeasure: handleCloseMeasure,
    showInfo,
    onCloseInfo: handleCloseInfo,
    showDisplayOptions,
    onCloseDisplayOptions: handleCloseDisplayOptions,
    showControls,
    onExitZenMode: handleExitZenMode,
    showSuggestions,
    onCloseSuggestions: handleCloseSuggestions,
    canClearToShowcase: Boolean(moleculeData || isLoading),
    onClearToShowcase: handleClearToShowcase,
  });

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
        topOffset={headerHeight > 0 ? headerHeight : 0}
        history={history}
        bookmarks={bookmarks}
        onOpenHistory={handleOpenHistoryModal}
        onOpenAbout={handleOpenAboutModal}
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
          onOpenDevTools={
            IS_DEV_TEST_ENABLED ? () => setShowDevTestModal(true) : undefined
          }
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
            <View
              style={[
                styles.floatingLeftRail,
                (showInfo || showShareModal) && styles.floatingLeftRailCompact,
              ]}
            >
              <StructureControls
                moleculeData={moleculeData}
                isAnimated={isAnimated}
                structureFormat={structureFormat}
                onToggleAnimation={toggleAnimation}
                onSelectFormat={handleSelectFormat}
                styles={styles}
                isLandscape={true}
                showInfo={showInfo}
                isCompact={showInfo || showShareModal}
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

      {/* ALL MODALS & DIALOGS */}
      <AppModals
        styles={styles}
        insets={insets}
        height={height}
        isLandscape={isLandscape}
        showHistoryModal={showHistoryModal}
        historyModalTab={historyModalTab}
        onCloseHistoryModal={handleCloseHistoryModal}
        onSelectCompound={handleSelectSuggestion}
        history={history}
        bookmarks={bookmarks}
        onToggleBookmark={toggleBookmark}
        onRemoveHistoryItem={removeHistory}
        onRemoveBookmarkItem={removeBookmark}
        onClearHistory={clearHistory}
        onClearBookmarks={clearBookmarks}
        isBookmarked={isBookmarked}
        showShareModal={showShareModal}
        onCloseShareModal={handleCloseShareModal}
        moleculeData={moleculeData}
        snapshotUri={snapshotUri}
        isCapturingSnapshot={isCapturingSnapshot}
        onRefreshSnapshot={handleCaptureSnapshot}
        showAboutModal={showAboutModal}
        onCloseAboutModal={handleCloseAboutModal}
        onOpenWhatsNew={handleOpenWhatsNewFromAbout}
        onCheckForUpdates={runLiveUpdateCheck}
        showUpdateModal={showUpdateModal}
        releaseInfo={releaseInfo}
        dismissUpdateModal={dismissUpdateModal}
        showWhatsNewModal={showWhatsNewModal}
        whatsNewNotes={whatsNewNotes}
        dismissWhatsNewModal={dismissWhatsNewModal}
        showDevTestModal={showDevTestModal}
        onCloseDevTestModal={handleCloseDevTestModal}
        openPreviewUpdateModal={openPreviewUpdateModal}
        openPreviewWhatsNewModal={openPreviewWhatsNewModal}
        runLiveUpdateCheck={runLiveUpdateCheck}
        refreshVersionNotice={refreshVersionNotice}
      />
    </View>
  );
}
