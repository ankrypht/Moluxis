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
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import * as NavigationBar from "expo-navigation-bar";

import { VisualizationType } from "./src/types";
import { getViewerHtml } from "./src/constants/viewerHtml";
import { ChemicalFormula } from "./src/components/ChemicalFormula";
import { CollapsibleSection } from "./src/components/CollapsibleSection";
import { PropertyRow } from "./src/components/PropertyRow";
import { isValidId } from "./src/services/pubchem/utils";
import { SuggestionItem } from "./src/components/SuggestionItem";
import { useMoleculeSearch } from "./src/hooks/useMoleculeSearch";
import { getStyles } from "./App.styles";

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

// Extract constant to avoid inline allocation and trigger unnecessary re-renders
const SAFE_AREA_EDGES = ["top"] as const;

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

  const styles = useMemo(() => getStyles(width, height), [width, height]);

  const horizontalPadding = Math.max(insets.left, isLandscape ? 12 : 16);

  // Visualization State
  const [vizStyle, setVizStyle] = useState<VisualizationType>("ballStick");
  const [showLabels, setShowLabels] = useState(false);
  const [isAnimated, setIsAnimated] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [structureFormat, setStructureFormat] = useState<"3d" | "2d">("3d");

  const toggleAnimation = () =>
    setIsAnimated((previousState) => !previousState);

  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    // Hide navigation bar
    NavigationBar.setVisibilityAsync("hidden");
  }, []);

  useEffect(() => {
    if (moleculeData) {
      if (moleculeData.sdf3d || moleculeData.useCif) {
        setStructureFormat("3d");
      } else if (moleculeData.sdf2d) {
        setStructureFormat("2d");
      }
    }
  }, [moleculeData]);

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
      <Text key={idx} style={styles.warningText}>
        ⚠ {item}
      </Text>
    ));
  }, [moleculeData, styles]);

  const hazardStatements = useMemo(() => {
    if (!moleculeData?.safety?.hazardStatements) return null;
    return moleculeData.safety.hazardStatements.map((item, idx) => (
      <Text key={idx} style={styles.hazardText}>
        ⚠ {item}
      </Text>
    ));
  }, [moleculeData, styles]);

  const synonymsList = useMemo(() => {
    if (!moleculeData?.synonyms) return null;
    return moleculeData.synonyms.map((synonym, index) => (
      <View key={index} style={styles.synonymChip}>
        <Text style={styles.synonymText}>{synonym}</Text>
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
      const message = JSON.stringify({
        type: "UPDATE_SETTINGS",
        style: vizStyle,
        labels: showLabels,
        animate: isAnimated,
      });
      webViewRef.current.postMessage(message);
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
    <SafeAreaView style={styles.container} edges={SAFE_AREA_EDGES}>
      <StatusBar style="light" />

      <View
        key={isLandscape ? "landscape" : "portrait"}
        style={isLandscape ? styles.mainContentLandscape : styles.mainContent}
      >
        <View
          style={
            isLandscape
              ? styles.viewerContainerLandscape
              : styles.viewerContainer
          }
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              isLandscape && styles.headerLandscape,
              {
                paddingLeft: horizontalPadding,
                paddingRight: horizontalPadding,
              },
            ]}
          >
            <Text style={[styles.title, isLandscape && styles.titleLandscape]}>
              Moluxis
            </Text>
            <View
              style={[
                styles.searchRow,
                isLandscape && styles.searchRowLandscape,
              ]}
            >
              <TextInput
                style={[styles.input, isLandscape && styles.inputLandscape]}
                placeholder="Search by name or formula"
                placeholderTextColor="#888"
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
                  <ActivityIndicator color="#000" size="small" />
                ) : (
                  <Text style={styles.buttonText}>GO</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <View
                style={[
                  styles.suggestionsContainer,
                  isLandscape && styles.suggestionsContainerLandscape,
                  {
                    left: horizontalPadding,
                    right: horizontalPadding,
                  },
                ]}
              >
                <FlatList
                  data={suggestions}
                  keyExtractor={(item) => item}
                  renderItem={renderSuggestionItem}
                  keyboardShouldPersistTaps="handled"
                  style={{ maxHeight: 200 }}
                />
              </View>
            )}
          </View>

          {/* Control Bar */}
          {moleculeData && !isLoading && (
            <View
              style={[
                styles.controlsContainer,
                isLandscape && styles.controlsContainerLandscape,
              ]}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[
                  styles.controlsScroll,
                  {
                    paddingLeft: horizontalPadding,
                    paddingRight: horizontalPadding,
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.chip,
                    isLandscape && styles.chipLandscape,
                    showInfo && styles.chipActive,
                    { marginRight: 5, borderColor: "#555" },
                  ]}
                  onPress={() => setShowInfo(!showInfo)}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={styles.infoIcon.fontSize}
                    color={showInfo ? "#FFF" : "#AAA"}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[styles.chipText, showInfo && styles.chipTextActive]}
                  >
                    Info
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.chip,
                    isLandscape && styles.chipLandscape,
                    showLabels && styles.chipActive,
                    { marginRight: 5, borderColor: "#555" },
                  ]}
                  onPress={() => setShowLabels(!showLabels)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      showLabels && styles.chipTextActive,
                    ]}
                  >
                    {showLabels ? "Hide Labels" : "Show Labels"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.chip,
                    isLandscape && styles.chipLandscape,
                    vizStyle === "ballStick" && styles.chipActive,
                  ]}
                  onPress={() => setVizStyle("ballStick")}
                >
                  <Text
                    style={[
                      styles.chipText,
                      vizStyle === "ballStick" && styles.chipTextActive,
                    ]}
                  >
                    Ball & Stick
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.chip,
                    isLandscape && styles.chipLandscape,
                    vizStyle === "stick" && styles.chipActive,
                  ]}
                  onPress={() => setVizStyle("stick")}
                >
                  <Text
                    style={[
                      styles.chipText,
                      vizStyle === "stick" && styles.chipTextActive,
                    ]}
                  >
                    Sticks
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.chip,
                    isLandscape && styles.chipLandscape,
                    vizStyle === "sphere" && styles.chipActive,
                  ]}
                  onPress={() => setVizStyle("sphere")}
                >
                  <Text
                    style={[
                      styles.chipText,
                      vizStyle === "sphere" && styles.chipTextActive,
                    ]}
                  >
                    Space-Fill
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.chip,
                    isLandscape && styles.chipLandscape,
                    vizStyle === "wireframe" && styles.chipActive,
                  ]}
                  onPress={() => setVizStyle("wireframe")}
                >
                  <Text
                    style={[
                      styles.chipText,
                      vizStyle === "wireframe" && styles.chipTextActive,
                    ]}
                  >
                    Wireframe
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}

          {/* Viewer Area */}
          <View style={[styles.viewerContainer, { flex: 1 }]}>
            {moleculeData && !isLoading && (
              <>
                <View style={styles.toggleContainer}>
                  <Text style={styles.toggleText}>Animate</Text>
                  <Switch
                    trackColor={{
                      false: "#555",
                      true: "rgba(10, 132, 255, 0.4)",
                    }}
                    thumbColor={isAnimated ? "#0A84FF" : "#CCC"}
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
                {/* Molecule name overlay for landscape when info is hidden */}
                {isLandscape && !showInfo && (
                  <View style={styles.landscapeNameOverlay}>
                    <Text style={styles.landscapeNameText}>
                      {moleculeData.name}
                    </Text>
                  </View>
                )}
              </>
            )}
            <WebView
              ref={webViewRef}
              originWhitelist={["https://3Dmol.csb.pitt.edu"]}
              source={webViewSource}
              style={styles.webview}
              scrollEnabled={false}
              onMessage={onWebViewMessage}
            />

            {!moleculeData && !isLoading && (
              <View style={styles.placeholderOverlay}>
                <Ionicons
                  name="cube-outline"
                  size={styles.placeholderIcon.fontSize}
                  color="#444"
                />
                <Text style={styles.placeholderText}>
                  Search for a compound to view 3D structure
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Info Panel */}
        {moleculeData && !isLoading && showInfo && (
          <View
            style={isLandscape ? styles.infoPanelLandscape : styles.infoPanel}
          >
            <ScrollView
              style={styles.infoScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            >
              {/* Quick Stats */}
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Formula</Text>
                  {moleculeData.formula ? (
                    <ChemicalFormula formula={moleculeData.formula} />
                  ) : (
                    <Text style={styles.statValue}>N/A</Text>
                  )}
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Molecular Weight</Text>
                  <Text style={styles.statValue}>
                    {moleculeData.molecularWeight || "N/A"}
                  </Text>
                </View>
              </View>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>IUPAC Name</Text>
                  <Text style={styles.statValue}>
                    {moleculeData.properties.iupacName || "N/A"}
                  </Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Common Name</Text>
                  <Text style={styles.statValue}>
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
                    <Text style={styles.noDataText}>
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
                        <Text style={styles.safetyLabel}>Signal Words</Text>
                        {signalWords}
                      </View>
                    )}
                  {moleculeData.safety.hazardStatements &&
                    moleculeData.safety.hazardStatements.length > 0 && (
                      <View style={styles.safetySection}>
                        <Text style={styles.safetyLabel}>
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
                <Text style={styles.descriptionText}>
                  {moleculeData.description}
                </Text>
              </CollapsibleSection>

              <CollapsibleSection title="Synonyms" icon="list-outline">
                <View style={styles.synonymsContainer}>{synonymsList}</View>
              </CollapsibleSection>

              <CollapsibleSection title="Databases" icon="link-outline">
                <Text style={styles.infoText}>
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
                  <Text style={styles.linkButtonText}>View on PubChem</Text>
                  <Ionicons
                    name="open-outline"
                    size={styles.linkIcon.fontSize}
                    color={styles.linkIcon.color}
                  />
                </TouchableOpacity>

                {/* NEW: Add COD link if available */}
                {moleculeData.codId && (
                  <>
                    <Text style={[styles.infoText, { marginTop: 15 }]}>
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
                      <Text style={styles.linkButtonText}>
                        View Crystal Data (COD)
                      </Text>
                      <Ionicons
                        name="open-outline"
                        size={styles.linkIcon.fontSize}
                        color={styles.linkIcon.color}
                      />
                    </TouchableOpacity>
                  </>
                )}
              </CollapsibleSection>
            </ScrollView>
          </View>
        )}
      </View>

      {/* Footer Info - Portrait only */}
      {!isLandscape && moleculeData && !isLoading && !showInfo && (
        <View style={styles.footer}>
          <Text style={styles.moleculeName}>
            {moleculeData.name.toUpperCase()}
          </Text>
          <Text style={styles.sourceText}>Source: PubChem</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MoleculeExplorer />
    </SafeAreaProvider>
  );
}
