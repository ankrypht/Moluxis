import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  FlatList,
  ScrollView,
  Linking,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

import { VisualizationType } from "./src/types";
import { viewerHtml } from "./src/constants/viewerHtml";
import { ChemicalFormula } from "./src/components/ChemicalFormula";
import { CollapsibleSection } from "./src/components/CollapsibleSection";
import { PropertyRow } from "./src/components/PropertyRow";
import { useMoleculeSearch } from "./src/hooks/useMoleculeSearch";

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
  const { bottom } = useSafeAreaInsets();

  // Visualization State
  const [vizStyle, setVizStyle] = useState<VisualizationType>("ballStick");
  const [showLabels, setShowLabels] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    if (moleculeData && webViewRef.current) {
      const script = `
        if (window.loadStructure) {
          window.loadStructure(${JSON.stringify(moleculeData.sdf)});
        }
      `;
      webViewRef.current.injectJavaScript(script);
    }
  }, [moleculeData]);

  useEffect(() => {
    if (moleculeData && webViewRef.current) {
      const script = `
        if (window.updateSettings) {
          window.updateSettings('${vizStyle}', ${showLabels});
        }
      `;
      webViewRef.current.injectJavaScript(script);
    }
  }, [moleculeData, vizStyle, showLabels]);

  const renderSuggestionItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => {
        selectSuggestion(item);
        Keyboard.dismiss();
      }}
    >
      <Ionicons
        name="search-outline"
        size={16}
        color="#AAA"
        style={{ marginRight: 10 }}
      />
      <Text style={styles.suggestionText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Moluxis</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder="Search (e.g., Caffeine, Aspirin)"
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={handleTextChange}
            onFocus={() => setShowSuggestions(true)}
            returnKeyType="search"
            onSubmitEditing={() => {
              searchMolecule();
              Keyboard.dismiss();
            }}
            keyboardAppearance="dark"
          />
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={() => {
              searchMolecule();
              Keyboard.dismiss();
            }}
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
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={suggestions}
              keyExtractor={(_item, index) => index.toString()}
              renderItem={renderSuggestionItem}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: 200 }}
            />
          </View>
        )}
      </View>

      {/* Control Bar */}
      {moleculeData && !isLoading && (
        <View style={styles.controlsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.controlsScroll}
          >
            <TouchableOpacity
              style={[
                styles.chip,
                showInfo && styles.chipActive,
                { marginRight: 5, borderColor: "#555" },
              ]}
              onPress={() => setShowInfo(!showInfo)}
            >
              <Ionicons
                name="information-circle-outline"
                size={16}
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
                showLabels && styles.chipActive,
                { marginRight: 5, borderColor: "#555" },
              ]}
              onPress={() => setShowLabels(!showLabels)}
            >
              <Text
                style={[styles.chipText, showLabels && styles.chipTextActive]}
              >
                {showLabels ? "Hide Labels" : "Show Labels"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.chip,
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
              style={[styles.chip, vizStyle === "stick" && styles.chipActive]}
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
              style={[styles.chip, vizStyle === "sphere" && styles.chipActive]}
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
      <View style={styles.viewerContainer}>
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html: viewerHtml }}
          style={styles.webview}
          scrollEnabled={false}
        />

        {!moleculeData && !isLoading && (
          <View style={styles.placeholderOverlay}>
            <Ionicons name="cube-outline" size={60} color="#444" />
            <Text style={styles.placeholderText}>
              Search for a compound to view 3D structure
            </Text>
          </View>
        )}
      </View>

      {/* Info Panel */}
      {moleculeData && !isLoading && showInfo && (
        <View style={styles.infoPanel}>
          <ScrollView
            style={styles.infoScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: bottom + 20 }}
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
                      {moleculeData.safety.signal.map((item, idx) => (
                        <Text key={idx} style={styles.warningText}>
                          ⚠ {item}
                        </Text>
                      ))}
                    </View>
                  )}
                {moleculeData.safety.hazardStatements &&
                  moleculeData.safety.hazardStatements.length > 0 && (
                    <View style={styles.safetySection}>
                      <Text style={styles.safetyLabel}>Hazard Statements</Text>
                      {moleculeData.safety.hazardStatements.map((item, idx) => (
                        <Text key={idx} style={styles.hazardText}>
                          ⚠ {item}
                        </Text>
                      ))}
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
              <View style={styles.synonymsContainer}>
                {moleculeData.synonyms.map((synonym, index) => (
                  <View key={index} style={styles.synonymChip}>
                    <Text style={styles.synonymText}>{synonym}</Text>
                  </View>
                ))}
              </View>
            </CollapsibleSection>

            <CollapsibleSection title="PubChem Data" icon="link-outline">
              <Text style={styles.infoText}>CID: {moleculeData.cid}</Text>
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() =>
                  Linking.openURL(
                    `https://pubchem.ncbi.nlm.nih.gov/compound/${moleculeData.cid}`,
                  )
                }
              >
                <Text style={styles.linkButtonText}>View on PubChem</Text>
                <Ionicons name="open-outline" size={16} color="#0A84FF" />
              </TouchableOpacity>
            </CollapsibleSection>
          </ScrollView>
        </View>
      )}

      {/* Footer Info */}
      {moleculeData && !isLoading && !showInfo && (
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

const styles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  // Header
  header: {
    padding: 16,
    backgroundColor: "#121212",
    zIndex: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 15,
  },
  searchRow: {
    flexDirection: "row",
    gap: 10,
    zIndex: 101,
  },
  input: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#333",
    color: "#FFFFFF",
  },
  button: {
    backgroundColor: "#0A84FF",
    borderRadius: 12,
    width: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#333",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  // Suggestions Dropdown
  suggestionsContainer: {
    position: "absolute",
    top: 130,
    left: 16,
    right: 16,
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    zIndex: 999,
    borderWidth: 1,
    borderColor: "#333",
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2C",
    flexDirection: "row",
    alignItems: "center",
  },
  suggestionText: {
    fontSize: 16,
    color: "#DDD",
  },
  // Controls
  controlsContainer: {
    height: 60,
    backgroundColor: "#121212",
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2C",
  },
  controlsScroll: {
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1E1E1E",
    borderWidth: 1,
    borderColor: "#333",
    flexDirection: "row",
    alignItems: "center",
  },
  chipActive: {
    backgroundColor: "#0A84FF",
    borderColor: "#0A84FF",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#AAA",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  // Viewer
  viewerContainer: {
    flex: 1,
    backgroundColor: "#121212",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  placeholderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  placeholderText: {
    fontSize: 16,
    color: "#666",
    marginTop: 15,
  },
  // Info Panel
  infoPanel: {
    maxHeight: "50%",
    backgroundColor: "#1A1A1A",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  infoScroll: {
    padding: 16,
  },
  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#252525",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
    fontWeight: "600",
  },
  statValue: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "700",
  },
  noDataText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 12,
  },
  // Safety Section
  safetySection: {
    marginBottom: 16,
  },
  safetyLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 8,
  },
  safetyText: {
    fontSize: 13,
    color: "#DDD",
    marginBottom: 4,
    lineHeight: 20,
  },
  hazardText: {
    fontSize: 13,
    color: "#FF9500",
    marginBottom: 4,
    lineHeight: 20,
  },
  warningText: {
    fontSize: 13,
    color: "#FF453A",
    marginBottom: 4,
    lineHeight: 20,
  },
  // Description
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#CCC",
  },

  // Synonyms
  synonymsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  synonymChip: {
    backgroundColor: "#1E1E1E",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#444",
  },
  synonymText: {
    fontSize: 13,
    color: "#DDD",
  },
  // Info Text
  infoText: {
    fontSize: 14,
    color: "#CCC",
    marginBottom: 12,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  linkButtonText: {
    fontSize: 14,
    color: "#0A84FF",
    fontWeight: "600",
  },
  // Footer
  footer: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 40,
    backgroundColor: "#121212",
    borderTopWidth: 1,
    borderTopColor: "#2C2C2C",
    alignItems: "center",
  },
  moleculeName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  sourceText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
});
