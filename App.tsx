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
import { SuggestionItem } from "./src/components/SuggestionItem";
import { useMoleculeSearch } from "./src/hooks/useMoleculeSearch";
import { styles } from "./App.styles";

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

  const signalWords = useMemo(() => {
    if (!moleculeData?.safety?.signal) return null;
    return moleculeData.safety.signal.map((item, idx) => (
      <Text key={idx} style={styles.warningText}>
        ⚠ {item}
      </Text>
    ));
  }, [moleculeData]);

  const hazardStatements = useMemo(() => {
    if (!moleculeData?.safety?.hazardStatements) return null;
    return moleculeData.safety.hazardStatements.map((item, idx) => (
      <Text key={idx} style={styles.hazardText}>
        ⚠ {item}
      </Text>
    ));
  }, [moleculeData]);

  const synonymsList = useMemo(() => {
    if (!moleculeData?.synonyms) return null;
    return moleculeData.synonyms.map((synonym, index) => (
      <View key={index} style={styles.synonymChip}>
        <Text style={styles.synonymText}>{synonym}</Text>
      </View>
    ));
  }, [moleculeData]);

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

  const handleSelectSuggestion = useCallback(
    (item: string) => {
      selectSuggestion(item);
      Keyboard.dismiss();
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
          originWhitelist={["about:blank"]}
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
                      {signalWords}
                    </View>
                  )}
                {moleculeData.safety.hazardStatements &&
                  moleculeData.safety.hazardStatements.length > 0 && (
                    <View style={styles.safetySection}>
                      <Text style={styles.safetyLabel}>Hazard Statements</Text>
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
