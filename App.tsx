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
} from "react-native";
import {
  useSafeAreaInsets,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { NavigationBar } from "expo-navigation-bar";

import { VisualizationType } from "./src/types";
import { useMoleculeSearch } from "./src/hooks/useMoleculeSearch";
import { getStyles } from "./App.styles";

import { MoleculeViewer } from "./src/components/MoleculeViewer";
import { FloatingHeader } from "./src/components/FloatingHeader";
import { FloatingDock } from "./src/components/FloatingDock";
import { MoleculeInfoSheet } from "./src/components/MoleculeInfoSheet";
import { LandscapeNameOverlay } from "./src/components/LandscapeNameOverlay";
import { ExitFullScreenButton } from "./src/components/ExitFullScreenButton";

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
  } = useMoleculeSearch();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

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
    // Hide navigation bar
    NavigationBar.setHidden(true);
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
        containerStyle={dynamicViewerContainerStyle}
        styles={styles}
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
    </View>
  );
}
