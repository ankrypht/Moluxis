import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  ScrollView,
  Switch,
  Linking,
  Alert,
  useWindowDimensions,
  Animated,
  useAnimatedValue,
} from "react-native";
import {
  useSafeAreaInsets,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { NavigationBar } from "expo-navigation-bar";

import { VisualizationType } from "./src/types";
import { getViewerHtml } from "./src/constants/viewerHtml";
import { ChemicalFormula } from "./src/components/ChemicalFormula";
import { CollapsibleSection } from "./src/components/CollapsibleSection";
import { PropertyRow } from "./src/components/PropertyRow";
import { isValidId } from "./src/services/pubchem/utils";
import { SuggestionItem } from "./src/components/SuggestionItem";
import { useMoleculeSearch } from "./src/hooks/useMoleculeSearch";
import { getStyles } from "./App.styles";
import { COLORS, addOpacity } from "./src/constants/colors";

interface WebViewReadyMessage {
  type: "WEBVIEW_READY";
}

function isWebViewReadyMessage(data: unknown): data is WebViewReadyMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as Record<string, unknown>).type === "WEBVIEW_READY"
  );
}

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
  const [vizStyle, setVizStyle] = useState<VisualizationType>("ballStick");
  const [showLabels, setShowLabels] = useState(false);
  const [isAnimated, setIsAnimated] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [structureFormat, setStructureFormat] = useState<"3d" | "2d">("3d");
  const [prevMoleculeData, setPrevMoleculeData] = useState(moleculeData);
  const [showStyleMenu, setShowStyleMenu] = useState(false);

  const styles = useMemo(
    () => getStyles(width, height, insets, showInfo, showStyleMenu),
    [width, height, insets, showInfo, showStyleMenu],
  );

  // Bottom Sheet Animation
  const sheetHeight = isLandscape ? width * 0.45 : height * 0.7; // Slide from right in landscape
  const slideAnim = useAnimatedValue(showInfo ? 0 : sheetHeight);

  useEffect(() => {
    if (!showInfo) {
      slideAnim.setValue(sheetHeight);
    }
  }, [sheetHeight, showInfo, slideAnim]);

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
    Animated.spring(slideAnim, {
      toValue: showInfo ? 0 : sheetHeight,
      useNativeDriver: true,
      friction: 8,
      tension: 50,
    }).start();
  }, [showInfo, sheetHeight, slideAnim]);

  const toggleAnimation = () =>
    setIsAnimated((previousState) => !previousState);

  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    // Hide navigation bar
    NavigationBar.setHidden(true);
  }, []);

  const webViewSource = useMemo(
    () => ({
      html: getViewerHtml(),
      baseUrl: "https://3Dmol.csb.pitt.edu",
    }),
    [],
  );

  const signalWords = useMemo(() => {
    if (!moleculeData?.safety?.signal) return null;
    return moleculeData.safety.signal.map((item, idx) => (
      <Text allowFontScaling={false} key={idx} style={styles.warningText}>
        ⚠ {item}
      </Text>
    ));
  }, [moleculeData, styles]);

  const hazardStatements = useMemo(() => {
    if (!moleculeData?.safety?.hazardStatements) return null;
    return moleculeData.safety.hazardStatements.map((item, idx) => (
      <Text allowFontScaling={false} key={idx} style={styles.hazardText}>
        ⚠ {item}
      </Text>
    ));
  }, [moleculeData, styles]);

  const synonymsList = useMemo(() => {
    if (!moleculeData?.synonyms) return null;
    return moleculeData.synonyms.map((synonym, index) => (
      <View key={index} style={styles.synonymChip}>
        <Text allowFontScaling={false} style={styles.synonymText}>
          {synonym}
        </Text>
      </View>
    ));
  }, [moleculeData, styles]);

  useEffect(() => {
    if (moleculeData && webViewRef.current) {
      const useCif = moleculeData.useCif;
      const message = JSON.stringify({
        type: "LOAD_STRUCTURE",
        data:
          structureFormat === "2d"
            ? moleculeData.sdf2d
            : useCif
              ? moleculeData.cif
              : moleculeData.sdf3d,
        format: structureFormat === "2d" ? "sdf" : useCif ? "cif" : "sdf",
        style: vizStyle,
        labels: showLabels,
        animate: isAnimated,
      });

      const timer = setTimeout(() => {
        webViewRef.current?.postMessage(message);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [moleculeData, structureFormat, vizStyle, showLabels, isAnimated]);

  useEffect(() => {
    if (moleculeData && webViewRef.current) {
      const timer = setTimeout(() => {
        const message = JSON.stringify({
          type: "UPDATE_SETTINGS",
          style: vizStyle,
          labels: showLabels,
          animate: isAnimated,
        });
        webViewRef.current?.postMessage(message);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [moleculeData, vizStyle, showLabels, isAnimated]);

  const onWebViewMessage = useCallback(
    (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (isWebViewReadyMessage(data) && moleculeData && webViewRef.current) {
          const useCif = moleculeData.useCif;
          const message = JSON.stringify({
            type: "LOAD_STRUCTURE",
            data:
              structureFormat === "2d"
                ? moleculeData.sdf2d
                : useCif
                  ? moleculeData.cif
                  : moleculeData.sdf3d,
            format: structureFormat === "2d" ? "sdf" : useCif ? "cif" : "sdf",
            style: vizStyle,
            labels: showLabels,
            animate: isAnimated,
          });
          webViewRef.current.postMessage(message);
        }
      } catch {
        // Silently handle non-JSON messages
      }
    },
    [moleculeData, structureFormat, vizStyle, showLabels, isAnimated],
  );

  const handleSelectSuggestion = useCallback(
    (item: string) => {
      selectSuggestion(item);
    },
    [selectSuggestion],
  );

  const renderSuggestionItem = useCallback(
    ({ item }: { item: string }) => (
      <SuggestionItem item={item} onSelect={handleSelectSuggestion} />
    ),
    [handleSelectSuggestion],
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* FULL SCREEN VIEWER */}
      <View style={styles.viewerContainer}>
        {(moleculeData || isLoading) && (
          <WebView
            ref={webViewRef}
            originWhitelist={["https://3Dmol.csb.pitt.edu"]}
            source={webViewSource}
            style={styles.webview}
            scrollEnabled={false}
            onMessage={onWebViewMessage}
          />
        )}
        {!moleculeData && !isLoading && (
          <View style={styles.placeholderOverlay}>
            <Ionicons
              allowFontScaling={false}
              name="cube-outline"
              size={styles.placeholderIcon.fontSize}
              color={styles.placeholderIcon.color}
            />
            <Text allowFontScaling={false} style={styles.placeholderText}>
              Search for a compound to view 3D structure
            </Text>
          </View>
        )}
      </View>

      {/* FLOATING HEADER (Island) */}
      {showControls && (
        <View style={styles.floatingHeaderContainer} pointerEvents="box-none">
          <View style={styles.header}>
            <View
              style={[
                styles.headerIsland,
                isLandscape && styles.headerIslandLandscape,
              ]}
            >
              {!isLandscape && (
                <View style={styles.titleRow}>
                  <Text allowFontScaling={false} style={styles.title}>
                    Moluxis
                  </Text>
                </View>
              )}
              <View
                style={[
                  styles.searchRow,
                  isLandscape && styles.searchRowLandscape,
                ]}
              >
                <TextInput
                  allowFontScaling={false}
                  style={[styles.input, isLandscape && styles.inputLandscape]}
                  placeholder="Search by name or formula"
                  placeholderTextColor={COLORS.textSecondary}
                  value={searchText}
                  onChangeText={handleTextChange}
                  onFocus={() => setShowSuggestions(true)}
                  returnKeyType="search"
                  onSubmitEditing={() => searchMolecule()}
                  keyboardAppearance="dark"
                />
                <TouchableOpacity
                  style={[
                    styles.button,
                    isLandscape && styles.buttonLandscape,
                    isLoading && styles.buttonDisabled,
                  ]}
                  onPress={() => searchMolecule()}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator
                      color={COLORS.textPrimary}
                      size="small"
                    />
                  ) : (
                    <Ionicons
                      name="search"
                      size={20}
                      color={COLORS.textPrimary}
                    />
                  )}
                </TouchableOpacity>
              </View>

              {/* Autocomplete Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <FlatList
                    data={suggestions}
                    keyExtractor={(item) => item}
                    renderItem={renderSuggestionItem}
                    keyboardShouldPersistTaps="handled"
                    style={{ maxHeight: 200 }}
                  />
                </View>
              )}

              {/* In LANDSCAPE: compact controls row INSIDE the island */}
              {isLandscape && moleculeData && !isLoading && (
                <View style={styles.islandInlineControls}>
                  <View style={styles.toggleContainer}>
                    <Text allowFontScaling={false} style={styles.toggleText}>
                      Animate
                    </Text>
                    <Switch
                      trackColor={{
                        false: COLORS.border,
                        true: addOpacity(COLORS.primary, 0.4),
                      }}
                      thumbColor={
                        isAnimated ? COLORS.primary : COLORS.textSecondary
                      }
                      onValueChange={toggleAnimation}
                      value={isAnimated}
                      style={{ transform: [{ scale: 0.8 }] }}
                    />
                  </View>
                  <View style={styles.badgeContainer}>
                    <TouchableOpacity
                      style={[
                        styles.badge,
                        moleculeData.sdf2d ? null : styles.badgeNotAvailable,
                        structureFormat === "2d" && styles.badgeActive,
                      ]}
                      onPress={() =>
                        moleculeData.sdf2d
                          ? setStructureFormat("2d")
                          : Alert.alert(
                              "2D Structure Unavailable",
                              "No 2D structure data available for this compound.",
                            )
                      }
                    >
                      <Text
                        allowFontScaling={false}
                        style={[
                          styles.badgeText,
                          moleculeData.sdf2d
                            ? null
                            : styles.badgeTextNotAvailable,
                          structureFormat === "2d" && styles.badgeTextActive,
                        ]}
                      >
                        2D
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.badge,
                        moleculeData.sdf3d || moleculeData.useCif
                          ? null
                          : styles.badgeNotAvailable,
                        structureFormat === "3d" && styles.badgeActive,
                      ]}
                      onPress={() =>
                        moleculeData.sdf3d || moleculeData.useCif
                          ? setStructureFormat("3d")
                          : Alert.alert(
                              "3D Structure Unavailable",
                              "No 3D structure data available for this compound.",
                            )
                      }
                    >
                      <Text
                        allowFontScaling={false}
                        style={[
                          styles.badgeText,
                          moleculeData.sdf3d || moleculeData.useCif
                            ? null
                            : styles.badgeTextNotAvailable,
                          structureFormat === "3d" && styles.badgeTextActive,
                        ]}
                      >
                        3D
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* In PORTRAIT: controls row BELOW the island */}
            {!isLandscape && moleculeData && !isLoading && (
              <View style={styles.controlsRow}>
                <View style={styles.toggleContainer}>
                  <Text allowFontScaling={false} style={styles.toggleText}>
                    Animate
                  </Text>
                  <Switch
                    trackColor={{
                      false: COLORS.border,
                      true: addOpacity(COLORS.primary, 0.4),
                    }}
                    thumbColor={
                      isAnimated ? COLORS.primary : COLORS.textSecondary
                    }
                    onValueChange={toggleAnimation}
                    value={isAnimated}
                    style={{ transform: [{ scale: 0.8 }] }}
                  />
                </View>
                <View style={styles.badgeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.badge,
                      moleculeData.sdf2d ? null : styles.badgeNotAvailable,
                      structureFormat === "2d" && styles.badgeActive,
                    ]}
                    onPress={() =>
                      moleculeData.sdf2d
                        ? setStructureFormat("2d")
                        : Alert.alert(
                            "2D Structure Unavailable",
                            "No 2D structure data available for this compound.",
                          )
                    }
                  >
                    <Text
                      allowFontScaling={false}
                      style={[
                        styles.badgeText,
                        moleculeData.sdf2d
                          ? null
                          : styles.badgeTextNotAvailable,
                        structureFormat === "2d" && styles.badgeTextActive,
                      ]}
                    >
                      2D
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.badge,
                      moleculeData.sdf3d || moleculeData.useCif
                        ? null
                        : styles.badgeNotAvailable,
                      structureFormat === "3d" && styles.badgeActive,
                    ]}
                    onPress={() =>
                      moleculeData.sdf3d || moleculeData.useCif
                        ? setStructureFormat("3d")
                        : Alert.alert(
                            "3D Structure Unavailable",
                            "No 3D structure data available for this compound.",
                          )
                    }
                  >
                    <Text
                      allowFontScaling={false}
                      style={[
                        styles.badgeText,
                        moleculeData.sdf3d || moleculeData.useCif
                          ? null
                          : styles.badgeTextNotAvailable,
                        structureFormat === "3d" && styles.badgeTextActive,
                      ]}
                    >
                      3D
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      )}
      {/* FLOATING DOCK (Controls) */}
      {moleculeData && !isLoading && showControls && (
        <View style={styles.floatingDockContainer} pointerEvents="box-none">
          {showStyleMenu && (
            <View style={styles.styleMenu}>
              {(["ballStick", "stick", "sphere", "wireframe"] as const).map(
                (style) => {
                  const isActive = vizStyle === style;
                  const label =
                    style === "ballStick"
                      ? "Ball & Stick"
                      : style === "stick"
                        ? "Sticks"
                        : style === "sphere"
                          ? "Space-Fill"
                          : "Wireframe";
                  return (
                    <TouchableOpacity
                      key={style}
                      style={[
                        styles.styleMenuItem,
                        isActive && styles.styleMenuItemActive,
                      ]}
                      onPress={() => {
                        setVizStyle(style);
                        setShowStyleMenu(false);
                      }}
                    >
                      <Text
                        allowFontScaling={false}
                        style={[
                          styles.styleMenuItemText,
                          isActive && styles.styleMenuItemTextActive,
                        ]}
                      >
                        {label}
                      </Text>
                      {isActive && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={COLORS.primary}
                          allowFontScaling={false}
                        />
                      )}
                    </TouchableOpacity>
                  );
                },
              )}
            </View>
          )}

          <View style={styles.dock}>
            <View style={styles.dockScroll}>
              <TouchableOpacity
                style={styles.dockChip}
                onPress={() => {
                  setShowControls(false);
                  setShowInfo(false);
                  setShowStyleMenu(false);
                }}
              >
                <Ionicons
                  allowFontScaling={false}
                  name="expand-outline"
                  size={styles.infoIcon.fontSize}
                  color={COLORS.textSecondary}
                  style={{ marginRight: 4 }}
                />
                <Text allowFontScaling={false} style={styles.dockChipText}>
                  Zen
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dockChip, showInfo && styles.dockChipActive]}
                onPress={() => {
                  setShowInfo(!showInfo);
                  setShowStyleMenu(false);
                }}
              >
                <Ionicons
                  allowFontScaling={false}
                  name="information-circle-outline"
                  size={styles.infoIcon.fontSize}
                  color={showInfo ? COLORS.textPrimary : COLORS.textSecondary}
                  style={{ marginRight: 4 }}
                />
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.dockChipText,
                    showInfo && styles.dockChipTextActive,
                  ]}
                >
                  Info
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dockChip, showLabels && styles.dockChipActive]}
                onPress={() => {
                  setShowLabels(!showLabels);
                  setShowStyleMenu(false);
                }}
              >
                <Ionicons
                  allowFontScaling={false}
                  name="text-outline"
                  size={styles.infoIcon.fontSize}
                  color={showLabels ? COLORS.textPrimary : COLORS.textSecondary}
                  style={{ marginRight: 4 }}
                />
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.dockChipText,
                    showLabels && styles.dockChipTextActive,
                  ]}
                >
                  Labels
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.dockChip,
                  showStyleMenu && styles.dockChipActive,
                ]}
                onPress={() => setShowStyleMenu(!showStyleMenu)}
              >
                <Ionicons
                  allowFontScaling={false}
                  name="cube-outline"
                  size={styles.infoIcon.fontSize}
                  color={
                    showStyleMenu ? COLORS.textPrimary : COLORS.textSecondary
                  }
                  style={{ marginRight: 4 }}
                />
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.dockChipText,
                    showStyleMenu && styles.dockChipTextActive,
                  ]}
                >
                  Style
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* ANIMATED BOTTOM SHEET / SIDE DRAWER (Info Panel) */}
      {moleculeData && !isLoading && (
        <Animated.View
          style={[
            styles.bottomSheet,
            isLandscape && styles.bottomSheetLandscape,
            {
              height: isLandscape ? height : sheetHeight,
              transform: isLandscape
                ? [{ translateX: slideAnim }]
                : [{ translateY: slideAnim }],
            },
          ]}
        >
          <ScrollView
            style={styles.infoScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: insets.bottom + 100,
              paddingTop: isLandscape ? Math.max(insets.top, 20) : 20,
              paddingLeft: isLandscape ? 16 : 0,
              paddingRight: isLandscape ? Math.max(insets.right, 16) : 0,
            }}
          >
            {/* Molecule Name & Close Button inside sheet */}
            <View style={styles.sheetHeaderRow}>
              <Text allowFontScaling={false} style={styles.moleculeName}>
                {moleculeData.name.toUpperCase()}
              </Text>
              <TouchableOpacity
                style={styles.closeButtonInline}
                onPress={() => setShowInfo(false)}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={COLORS.textPrimary}
                  allowFontScaling={false}
                />
              </TouchableOpacity>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text allowFontScaling={false} style={styles.statLabel}>
                  Formula
                </Text>
                {moleculeData.formula ? (
                  <ChemicalFormula formula={moleculeData.formula} />
                ) : (
                  <Text allowFontScaling={false} style={styles.statValue}>
                    N/A
                  </Text>
                )}
              </View>
              <View style={styles.statCard}>
                <Text allowFontScaling={false} style={styles.statLabel}>
                  Molecular Weight
                </Text>
                <Text allowFontScaling={false} style={styles.statValue}>
                  {moleculeData.molecularWeight || "N/A"}
                </Text>
              </View>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text allowFontScaling={false} style={styles.statLabel}>
                  IUPAC Name
                </Text>
                <Text allowFontScaling={false} style={styles.statValue}>
                  {moleculeData.properties.iupacName || "N/A"}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text allowFontScaling={false} style={styles.statLabel}>
                  Common Name
                </Text>
                <Text allowFontScaling={false} style={styles.statValue}>
                  {moleculeData.properties.commonName || "N/A"}
                </Text>
              </View>
            </View>

            {/* Chemical Properties */}
            <CollapsibleSection
              title="Chemical Properties"
              icon="flask-outline"
              defaultExpanded
            >
              <PropertyRow
                label="H-Bond Acceptors"
                value={moleculeData.properties.hBondAcceptors}
              />
              <PropertyRow
                label="H-Bond Donors"
                value={moleculeData.properties.hBondDonors}
              />
              <PropertyRow
                label="Rotatable Bonds"
                value={moleculeData.properties.rotatableBonds}
              />
              <PropertyRow
                label="LogP (Lipophilicity)"
                value={moleculeData.properties.logP}
              />
              <PropertyRow
                label="Polar Surface Area"
                value={moleculeData.properties.tpsa}
              />
              <PropertyRow
                label="Boiling Point"
                value={moleculeData.properties.boilingPoint}
              />
              <PropertyRow
                label="Melting Point"
                value={moleculeData.properties.meltingPoint}
              />
              <PropertyRow
                label="Solubility"
                value={moleculeData.properties.solubility}
              />
              <PropertyRow
                label="Density"
                value={moleculeData.properties.density}
              />
              <PropertyRow label="pH" value={moleculeData.properties.pH} />

              {!moleculeData.properties.logP &&
                !moleculeData.properties.tpsa && (
                  <Text allowFontScaling={false} style={styles.noDataText}>
                    No additional properties available
                  </Text>
                )}
            </CollapsibleSection>

            {/* Safety & Hazards */}
            {(moleculeData.safety.hazardStatements ||
              moleculeData.safety.signal) && (
              <CollapsibleSection
                title="Safety & Hazards"
                icon="warning-outline"
              >
                {moleculeData.safety.signal &&
                  moleculeData.safety.signal.length > 0 && (
                    <View style={styles.safetySection}>
                      <Text allowFontScaling={false} style={styles.safetyLabel}>
                        Signal Words
                      </Text>
                      {signalWords}
                    </View>
                  )}
                {moleculeData.safety.hazardStatements &&
                  moleculeData.safety.hazardStatements.length > 0 && (
                    <View style={styles.safetySection}>
                      <Text allowFontScaling={false} style={styles.safetyLabel}>
                        Hazard Statements
                      </Text>
                      {hazardStatements}
                    </View>
                  )}
              </CollapsibleSection>
            )}

            {/* Collapsible Sections */}
            <CollapsibleSection
              title="Description"
              icon="document-text-outline"
            >
              <Text allowFontScaling={false} style={styles.descriptionText}>
                {moleculeData.description}
              </Text>
            </CollapsibleSection>

            <CollapsibleSection title="Synonyms" icon="list-outline">
              <View style={styles.synonymsContainer}>{synonymsList}</View>
            </CollapsibleSection>

            <CollapsibleSection title="Databases" icon="link-outline">
              <Text allowFontScaling={false} style={styles.infoText}>
                PubChem CID: {moleculeData.cid}
              </Text>
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => {
                  if (isValidId(moleculeData.cid)) {
                    Linking.openURL(
                      `https://pubchem.ncbi.nlm.nih.gov/compound/${moleculeData.cid}`,
                    );
                  }
                }}
              >
                <Text allowFontScaling={false} style={styles.linkButtonText}>
                  View on PubChem
                </Text>
                <Ionicons
                  allowFontScaling={false}
                  name="open-outline"
                  size={styles.linkIcon.fontSize}
                  color={styles.linkIcon.color}
                />
              </TouchableOpacity>

              {moleculeData.codId && (
                <>
                  <Text
                    allowFontScaling={false}
                    style={[styles.infoText, { marginTop: 15 }]}
                  >
                    COD ID: {moleculeData.codId}
                  </Text>
                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => {
                      if (isValidId(moleculeData.codId)) {
                        Linking.openURL(
                          `https://www.crystallography.net/cod/${moleculeData.codId}.html`,
                        );
                      }
                    }}
                  >
                    <Text
                      allowFontScaling={false}
                      style={styles.linkButtonText}
                    >
                      View Crystal Data (COD)
                    </Text>
                    <Ionicons
                      allowFontScaling={false}
                      name="open-outline"
                      size={styles.linkIcon.fontSize}
                      color={styles.linkIcon.color}
                    />
                  </TouchableOpacity>
                </>
              )}
            </CollapsibleSection>
          </ScrollView>
        </Animated.View>
      )}

      {/* Landscape Name Overlay (visible when info sheet is closed) */}
      {moleculeData && !isLoading && !showInfo && showControls && (
        <View style={styles.landscapeNameOverlay}>
          <Text allowFontScaling={false} style={styles.landscapeNameText}>
            {moleculeData.name.toUpperCase()}
          </Text>
        </View>
      )}

      {/* Floating Exit Full Screen Button */}
      {!showControls && (
        <TouchableOpacity
          style={styles.exitFullScreenButton}
          onPress={() => setShowControls(true)}
        >
          <Ionicons
            allowFontScaling={false}
            name="contract-outline"
            size={24}
            color={COLORS.textPrimary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
