import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  TextInput,
  Keyboard,
  useWindowDimensions,
  ViewStyle,
  Platform,
} from "react-native";
import {
  useSafeAreaInsets,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { NavigationBar } from "expo-navigation-bar";

import { VisualizationType } from "./src/types";
import { useMoleculeSearch } from "./src/hooks/useMoleculeSearch";
import { useCompoundHistoryAndBookmarks } from "./src/hooks/useCompoundHistoryAndBookmarks";
import { getStyles } from "./App.styles";

import { MoleculeViewer } from "./src/components/MoleculeViewer";
import { FloatingHeader } from "./src/components/FloatingHeader";
import { FloatingDock } from "./src/components/FloatingDock";
import { MoleculeInfoSheet } from "./src/components/MoleculeInfoSheet";
import { LandscapeNameOverlay } from "./src/components/LandscapeNameOverlay";
import { ExitFullScreenButton } from "./src/components/ExitFullScreenButton";
import { HistoryBookmarksModal } from "./src/components/HistoryBookmarksModal";

export default function App() {
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
  const searchInputRef = useRef<TextInput>(null);
  const [vizStyle, setVizStyle] = useState<VisualizationType>("ballStick");
  const [showLabels, setShowLabels] = useState(false);
  const [isAnimated, setIsAnimated] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [structureFormat, setStructureFormat] = useState<"3d" | "2d">("3d");
  const [prevMoleculeData, setPrevMoleculeData] = useState(moleculeData);
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyModalTab, setHistoryModalTab] = useState<
    "history" | "bookmarks"
  >("history");
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
    isKeyboardVisible || showHistoryModal || showSuggestions,
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

  const styles = useMemo(
    () => getStyles(width, height, insets),
    [width, height, insets],
  );

  const dynamicViewerContainerStyle = useMemo<ViewStyle>(
    () => ({ right: isLandscape && showInfo ? "45%" : 0 }),
    [isLandscape, showInfo],
  );
  const dynamicHeaderContainerStyle = useMemo<ViewStyle>(
    () => ({
      right: isLandscape ? (showInfo ? "45%" : insets.right) : 0,
    }),
    [isLandscape, showInfo, insets.right],
  );
  const dynamicDockContainerStyle = useMemo<ViewStyle>(
    () => ({
      right: isLandscape ? (showInfo ? "45%" : insets.right) : 0,
      zIndex: showStyleMenu ? 150 : 50,
    }),
    [isLandscape, showInfo, showStyleMenu, insets.right],
  );

  if (moleculeData !== prevMoleculeData) {
    setPrevMoleculeData(moleculeData);
    if (moleculeData) {
      if (moleculeData.sdf3d || moleculeData.useCif) {
        setStructureFormat("3d");
      } else if (moleculeData.sdf2d) {
        setStructureFormat("2d");
      }
    }
  }

  useEffect(() => {
    // Hide navigation bar on Android only
    if (Platform.OS === "android") {
      NavigationBar.setHidden(true);
    }
  }, []);

  const toggleAnimation = useCallback(
    () => setIsAnimated((previousState) => !previousState),
    [],
  );

  const handleSearch = useCallback(
    (query?: string) => {
      searchInputRef.current?.blur();
      Keyboard.dismiss();
      searchMolecule(query);
    },
    [searchMolecule],
  );

  const handleSelectSuggestion = useCallback(
    (item: string) => {
      searchInputRef.current?.blur();
      Keyboard.dismiss();
      selectSuggestion(item);
    },
    [selectSuggestion],
  );

  const handleSelectFeaturedMolecule = useCallback(
    (item: string) => {
      searchInputRef.current?.blur();
      Keyboard.dismiss();
      setIsAnimated(true);
      selectSuggestion(item);
    },
    [selectSuggestion],
  );

  const handleClearToShowcase = useCallback(() => {
    searchInputRef.current?.blur();
    Keyboard.dismiss();
    setShowInfo(false);
    setShowStyleMenu(false);
    setShowHistoryModal(false);
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
      setShowStyleMenu(false);
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
    setShowStyleMenu(false);
  }, []);

  const handleCloseInfo = useCallback(() => {
    setShowInfo(false);
  }, []);

  const handleSelectStyle = useCallback((style: VisualizationType) => {
    setVizStyle(style);
    setShowStyleMenu(false);
  }, []);

  const handleToggleStyleMenu = useCallback(() => {
    setShowStyleMenu((prev) => !prev);
  }, []);

  const handleToggleLabels = useCallback(() => {
    setShowLabels((prev) => !prev);
    setShowStyleMenu(false);
  }, []);

  const handleEnterZenMode = useCallback(() => {
    setShowControls(false);
    setShowInfo(false);
    setShowStyleMenu(false);
    setShowHistoryModal(false);
  }, []);

  const handleExitZenMode = useCallback(() => {
    setShowControls(true);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* FULL SCREEN VIEWER */}
      <MoleculeViewer
        moleculeData={moleculeData}
        isLoading={isLoading}
        structureFormat={structureFormat}
        vizStyle={vizStyle}
        showLabels={showLabels}
        isAnimated={isAnimated}
        isInteracting={isInteracting}
        containerStyle={dynamicViewerContainerStyle}
        styles={styles}
        onSelectMolecule={handleSelectFeaturedMolecule}
        topOffset={headerHeight}
        history={history}
        bookmarks={bookmarks}
        onOpenHistory={handleOpenHistoryModal}
      />

      {/* FLOATING HEADER (Island) */}
      {showControls && (
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
          onSelectFormat={setStructureFormat}
          onLayoutHeader={setHeaderHeight}
          onClear={handleClearToShowcase}
          isBookmarked={isCurrentBookmarked}
          onToggleBookmark={handleToggleCurrentBookmark}
          onOpenHistory={() => handleOpenHistoryModal("history")}
        />
      )}

      {/* FLOATING DOCK (Controls) */}
      {moleculeData && !isLoading && showControls && (
        <FloatingDock
          vizStyle={vizStyle}
          showLabels={showLabels}
          showInfo={showInfo}
          showStyleMenu={showStyleMenu}
          containerStyle={dynamicDockContainerStyle}
          styles={styles}
          onSelectStyle={handleSelectStyle}
          onToggleStyleMenu={handleToggleStyleMenu}
          onToggleInfo={handleToggleInfo}
          onToggleLabels={handleToggleLabels}
          onEnterZenMode={handleEnterZenMode}
          isLandscape={isLandscape}
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
        />
      )}

      {/* Landscape Name Overlay (visible when info sheet is closed) */}
      {moleculeData && !isLoading && !showInfo && showControls && (
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
        onSelectCompound={handleSelectFeaturedMolecule}
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
    </View>
  );
}
