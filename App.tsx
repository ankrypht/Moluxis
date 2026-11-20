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
} from "react-native";
import {
  useSafeAreaInsets,
  SafeAreaProvider,
  type EdgeInsets,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";

import { VisualizationType, MoleculeInfo } from "./src/types";
import { getDefaultStructureFormat } from "./src/utils/structure";
import { useMoleculeSearch } from "./src/hooks/useMoleculeSearch";
import { useCompoundHistoryAndBookmarks } from "./src/hooks/useCompoundHistoryAndBookmarks";
import {
  IS_DEV_TEST_ENABLED,
  useNotificationsAndUpdates,
} from "./src/hooks/useNotificationsAndUpdates";
import { useSystemUI } from "./src/hooks/useSystemUI";
import { useSnapshotCapture } from "./src/hooks/useSnapshotCapture";
import {
  MeasurementProvider,
  useMeasurementStatus,
} from "./src/context/MeasurementContext";
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
import { ErrorBoundary } from "./src/components/ErrorBoundary";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <MoleculeExplorer />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

function MoleculeExplorer() {
  const {
    isLoading,
    moleculeData,
    searchMolecule,
    selectSuggestion,
    clearMolecule,
  } = useMoleculeSearch();

  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const { isKeyboardVisible } = useSystemUI();

  // Visualization & View State
  const searchInputRef = useRef<TextInputInstance>(null);
  const moleculeViewerRef = useRef<MoleculeViewerRef>(null);

  const [vizStyle, setVizStyle] = useState<VisualizationType>("ballStick");
  const [showLabels, setShowLabels] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Keyed derived state: immediately defaults cleanly on molecule change without render-phase setters
  const currentMoleculeKey = moleculeData?.cid || moleculeData?.name || null;

  const [userFormatSelection, setUserFormatSelection] = useState<{
    moleculeKey: string | null;
    format: "3d" | "2d";
  } | null>(null);

  const structureFormat: "3d" | "2d" =
    userFormatSelection &&
    userFormatSelection.moleculeKey === currentMoleculeKey
      ? userFormatSelection.format
      : getDefaultStructureFormat(moleculeData);

  const setStructureFormat = useCallback(
    (format: "3d" | "2d") => {
      setUserFormatSelection({ moleculeKey: currentMoleculeKey, format });
    },
    [currentMoleculeKey],
  );

  const [userAnimatedSelection, setUserAnimatedSelection] = useState<{
    moleculeKey: string | null;
    isAnimated: boolean;
  } | null>(null);

  const isAnimated: boolean =
    userAnimatedSelection &&
    userAnimatedSelection.moleculeKey === currentMoleculeKey
      ? userAnimatedSelection.isAnimated
      : false;

  const setIsAnimated = useCallback(
    (next: boolean | ((prev: boolean) => boolean)) => {
      setUserAnimatedSelection((prev) => {
        const current =
          prev && prev.moleculeKey === currentMoleculeKey
            ? prev.isAnimated
            : false;
        const resolved = typeof next === "function" ? next(current) : next;
        return { moleculeKey: currentMoleculeKey, isAnimated: resolved };
      });
    },
    [currentMoleculeKey],
  );

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
    handleCaptureFullSnapshot,
    handleSnapshotCaptured,
    resetSnapshot,
  } = useSnapshotCapture(moleculeViewerRef, currentMoleculeKey);

  // Measurement
  const handleStartMeasuring = useCallback(() => {
    setIsAnimated(false);
    setShowDisplayOptions(false);
    setShowInfo(false);
  }, [setIsAnimated]);

  return (
    <MeasurementProvider
      moleculeViewerRef={moleculeViewerRef}
      moleculeData={moleculeData}
      structureFormat={structureFormat}
      setStructureFormat={setStructureFormat}
      isLandscape={isLandscape}
      onStartMeasuring={handleStartMeasuring}
    >
      <MoleculeExplorerContent
        isLoading={isLoading}
        moleculeData={moleculeData}
        searchMolecule={searchMolecule}
        selectSuggestion={selectSuggestion}
        clearMolecule={clearMolecule}
        insets={insets}
        width={width}
        height={height}
        isLandscape={isLandscape}
        isKeyboardVisible={isKeyboardVisible}
        searchInputRef={searchInputRef}
        moleculeViewerRef={moleculeViewerRef}
        vizStyle={vizStyle}
        setVizStyle={setVizStyle}
        showLabels={showLabels}
        setShowLabels={setShowLabels}
        showInfo={showInfo}
        setShowInfo={setShowInfo}
        showControls={showControls}
        setShowControls={setShowControls}
        structureFormat={structureFormat}
        setStructureFormat={setStructureFormat}
        isAnimated={isAnimated}
        setIsAnimated={setIsAnimated}
        showDisplayOptions={showDisplayOptions}
        setShowDisplayOptions={setShowDisplayOptions}
        headerHeight={headerHeight}
        setHeaderHeight={setHeaderHeight}
        showHistoryModal={showHistoryModal}
        setShowHistoryModal={setShowHistoryModal}
        historyModalTab={historyModalTab}
        setHistoryModalTab={setHistoryModalTab}
        showShareModal={showShareModal}
        setShowShareModal={setShowShareModal}
        showAboutModal={showAboutModal}
        setShowAboutModal={setShowAboutModal}
        showDevTestModal={showDevTestModal}
        setShowDevTestModal={setShowDevTestModal}
        snapshotUri={snapshotUri}
        isCapturingSnapshot={isCapturingSnapshot}
        handleCaptureSnapshot={handleCaptureSnapshot}
        handleCaptureFullSnapshot={handleCaptureFullSnapshot}
        handleSnapshotCaptured={handleSnapshotCaptured}
        resetSnapshot={resetSnapshot}
      />
    </MeasurementProvider>
  );
}

interface MoleculeExplorerContentProps {
  isLoading: boolean;
  moleculeData: MoleculeInfo | null;
  searchMolecule: (query?: string) => Promise<void>;
  selectSuggestion: (item: string) => void;
  clearMolecule: () => void;
  insets: EdgeInsets;
  width: number;
  height: number;
  isLandscape: boolean;
  isKeyboardVisible: boolean;
  searchInputRef: React.RefObject<TextInputInstance | null>;
  moleculeViewerRef: React.RefObject<MoleculeViewerRef | null>;
  vizStyle: VisualizationType;
  setVizStyle: (style: VisualizationType) => void;
  showLabels: boolean;
  setShowLabels: React.Dispatch<React.SetStateAction<boolean>>;
  showInfo: boolean;
  setShowInfo: React.Dispatch<React.SetStateAction<boolean>>;
  showControls: boolean;
  setShowControls: React.Dispatch<React.SetStateAction<boolean>>;
  structureFormat: "3d" | "2d";
  setStructureFormat: (format: "3d" | "2d") => void;
  isAnimated: boolean;
  setIsAnimated: (next: boolean | ((prev: boolean) => boolean)) => void;
  showDisplayOptions: boolean;
  setShowDisplayOptions: React.Dispatch<React.SetStateAction<boolean>>;
  headerHeight: number;
  setHeaderHeight: (height: number) => void;
  showHistoryModal: boolean;
  setShowHistoryModal: React.Dispatch<React.SetStateAction<boolean>>;
  historyModalTab: "history" | "bookmarks";
  setHistoryModalTab: React.Dispatch<
    React.SetStateAction<"history" | "bookmarks">
  >;
  showShareModal: boolean;
  setShowShareModal: React.Dispatch<React.SetStateAction<boolean>>;
  showAboutModal: boolean;
  setShowAboutModal: React.Dispatch<React.SetStateAction<boolean>>;
  showDevTestModal: boolean;
  setShowDevTestModal: React.Dispatch<React.SetStateAction<boolean>>;
  snapshotUri: string | null;
  isCapturingSnapshot: boolean;
  handleCaptureSnapshot: () => void;
  handleCaptureFullSnapshot?: () => Promise<string | null>;
  handleSnapshotCaptured: (dataUri: string | null) => void;
  resetSnapshot: () => void;
}

const MoleculeExplorerContent = React.memo(function MoleculeExplorerContent({
  isLoading,
  moleculeData,
  searchMolecule,
  selectSuggestion,
  clearMolecule,
  insets,
  width,
  height,
  isLandscape,
  isKeyboardVisible,
  searchInputRef,
  moleculeViewerRef,
  vizStyle,
  setVizStyle,
  showLabels,
  setShowLabels,
  showInfo,
  setShowInfo,
  showControls,
  setShowControls,
  structureFormat,
  setStructureFormat,
  isAnimated,
  setIsAnimated,
  showDisplayOptions,
  setShowDisplayOptions,
  headerHeight,
  setHeaderHeight,
  showHistoryModal,
  setShowHistoryModal,
  historyModalTab,
  setHistoryModalTab,
  showShareModal,
  setShowShareModal,
  showAboutModal,
  setShowAboutModal,
  showDevTestModal,
  setShowDevTestModal,
  snapshotUri,
  isCapturingSnapshot,
  handleCaptureSnapshot,
  handleCaptureFullSnapshot,
  handleSnapshotCaptured,
  resetSnapshot,
}: MoleculeExplorerContentProps) {
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
  const {
    isMeasuring,
    measurementMode,
    measurePanelSize,
    handleToggleMeasure,
    handleCloseMeasure,
    handleAtomPicked,
  } = useMeasurementStatus();

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
      addHistory(
        {
          name: moleculeData.name,
          formula: moleculeData.formula,
          cid: moleculeData.cid,
          molecularWeight: moleculeData.molecularWeight,
        },
        history,
      );
    }
  }, [moleculeData, addHistory, history]);

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

  const toggleAnimation = useCallback(() => {
    const next = !isAnimated;
    setIsAnimated(next);
    if (next) {
      handleCloseMeasure();
    }
  }, [isAnimated, setIsAnimated, handleCloseMeasure]);

  const handleSelectFormat = useCallback(
    (format: "2d" | "3d") => {
      setStructureFormat(format);
      handleCloseMeasure();
    },
    [setStructureFormat, handleCloseMeasure],
  );

  const handleSearch = useCallback(
    (query?: string) => {
      searchInputRef.current?.blur();
      Keyboard.dismiss();
      setIsAnimated(false);
      searchMolecule(query);
    },
    [searchMolecule, setIsAnimated, searchInputRef],
  );

  const handleSelectSuggestion = useCallback(
    (item: string) => {
      searchInputRef.current?.blur();
      Keyboard.dismiss();
      setIsAnimated(false);
      selectSuggestion(item);
    },
    [selectSuggestion, setIsAnimated, searchInputRef],
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
  }, [
    clearMolecule,
    handleCloseMeasure,
    setIsAnimated,
    searchInputRef,
    setShowInfo,
    setShowDisplayOptions,
    setShowHistoryModal,
    setShowShareModal,
    setShowAboutModal,
  ]);

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
    [
      searchInputRef,
      setHistoryModalTab,
      setShowHistoryModal,
      setShowInfo,
      setShowDisplayOptions,
      setShowAboutModal,
    ],
  );

  const handleOpenHistoryFromHeader = useCallback(() => {
    handleOpenHistoryModal("history");
  }, [handleOpenHistoryModal]);

  const handleCloseHistoryModal = useCallback(() => {
    setShowHistoryModal(false);
  }, [setShowHistoryModal]);

  const handleOpenAboutModal = useCallback(() => {
    searchInputRef.current?.blur();
    Keyboard.dismiss();
    setShowAboutModal(true);
    setShowInfo(false);
    setShowDisplayOptions(false);
    setShowHistoryModal(false);
    setShowShareModal(false);
  }, [
    searchInputRef,
    setShowAboutModal,
    setShowInfo,
    setShowDisplayOptions,
    setShowHistoryModal,
    setShowShareModal,
  ]);

  const handleCloseAboutModal = useCallback(() => {
    setShowAboutModal(false);
  }, [setShowAboutModal]);

  const handleToggleInfo = useCallback(() => {
    searchInputRef.current?.blur();
    Keyboard.dismiss();
    setShowInfo((prev) => !prev);
    setShowDisplayOptions(false);
    handleCloseMeasure();
  }, [handleCloseMeasure, searchInputRef, setShowInfo, setShowDisplayOptions]);

  const handleCloseInfo = useCallback(() => {
    setShowInfo(false);
  }, [setShowInfo]);

  const handleSelectStyle = useCallback(
    (style: VisualizationType) => {
      setVizStyle(style);
      setShowDisplayOptions(false);
    },
    [setVizStyle, setShowDisplayOptions],
  );

  const handleToggleDisplayOptions = useCallback(() => {
    setShowDisplayOptions((prev) => !prev);
  }, [setShowDisplayOptions]);

  const handleToggleLabels = useCallback(() => {
    setShowLabels((prev) => !prev);
  }, [setShowLabels]);

  const handleOpenShareModal = useCallback(() => {
    searchInputRef.current?.blur();
    Keyboard.dismiss();
    setShowShareModal(true);
    setShowInfo(false);
    setShowDisplayOptions(false);
    setShowHistoryModal(false);
    setShowAboutModal(false);
    handleCaptureSnapshot();
  }, [
    handleCaptureSnapshot,
    searchInputRef,
    setShowShareModal,
    setShowInfo,
    setShowDisplayOptions,
    setShowHistoryModal,
    setShowAboutModal,
  ]);

  const handleCloseShareModal = useCallback(() => {
    setShowShareModal(false);
    resetSnapshot();
  }, [resetSnapshot, setShowShareModal]);

  const handleEnterZenMode = useCallback(() => {
    setShowControls(false);
    setShowInfo(false);
    setShowDisplayOptions(false);
    setShowHistoryModal(false);
    setShowShareModal(false);
    setShowAboutModal(false);
    handleCloseMeasure();
  }, [
    handleCloseMeasure,
    setShowControls,
    setShowInfo,
    setShowDisplayOptions,
    setShowHistoryModal,
    setShowShareModal,
    setShowAboutModal,
  ]);

  const handleExitZenMode = useCallback(() => {
    setShowControls(true);
  }, [setShowControls]);

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
  }, [setShowDisplayOptions]);

  const handleOpenDevTools = useCallback(() => {
    setShowDevTestModal(true);
  }, [setShowDevTestModal]);

  const handleCloseDevTestModal = useCallback(() => {
    setShowDevTestModal(false);
  }, [setShowDevTestModal]);

  const hasActiveAlert = useActiveAlert();

  const handleCloseAlert = useCallback(() => {
    Alert.handleBackPress();
  }, []);

  const isInteracting = Boolean(
    isKeyboardVisible ||
    hasActiveAlert ||
    showHistoryModal ||
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
    canClearToShowcase: Boolean(moleculeData || isLoading),
    onClearToShowcase: handleClearToShowcase,
  });

  const isCompactDock = Boolean(isLandscape && (showInfo || showShareModal));

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
          isLoading={isLoading}
          moleculeData={moleculeData}
          isLandscape={isLandscape}
          showInfo={showInfo}
          isAnimated={isAnimated}
          structureFormat={structureFormat}
          containerStyle={dynamicHeaderContainerStyle}
          styles={styles}
          onSearch={handleSearch}
          onSelectSuggestion={handleSelectSuggestion}
          onToggleAnimation={toggleAnimation}
          onSelectFormat={handleSelectFormat}
          onLayoutHeader={setHeaderHeight}
          onClear={handleClearToShowcase}
          isBookmarked={isCurrentBookmarked}
          onToggleBookmark={handleToggleCurrentBookmark}
          onOpenHistory={handleOpenHistoryFromHeader}
          onOpenShare={handleOpenShareModal}
          onOpenDevTools={IS_DEV_TEST_ENABLED ? handleOpenDevTools : undefined}
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
          isCompact={isCompactDock}
        />
      )}

      {/* INTERACTIVE ATOM PICKING & MEASUREMENT PANEL */}
      {moleculeData &&
        !isLoading &&
        isMeasuring &&
        showControls &&
        !showShareModal &&
        !showHistoryModal && (
          <MeasurementPanel styles={styles} isLandscape={isLandscape} />
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
        onCaptureFullSnapshot={handleCaptureFullSnapshot}
        onResetSnapshot={resetSnapshot}
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
});
