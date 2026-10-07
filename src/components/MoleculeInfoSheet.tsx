import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Linking,
  Animated,
  useAnimatedValue,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { MoleculeInfo } from "../types";
import { COLORS, addOpacity } from "../constants/colors";
import { Insets } from "../utils/scaling";
import { ChemicalFormula } from "./ChemicalFormula";
import { CollapsibleSection } from "./CollapsibleSection";
import { PropertyRow } from "./PropertyRow";
import { isValidId } from "../services/pubchem/utils";
import { MoleculeInfoSheetStyles } from "./MoleculeInfoSheet.styles";

export interface MoleculeInfoSheetProps {
  moleculeData: MoleculeInfo;
  showInfo: boolean;
  isLandscape: boolean;
  width: number;
  height: number;
  insets: Insets;
  styles: MoleculeInfoSheetStyles;
  onClose: () => void;
}

export const MoleculeInfoSheet: React.FC<MoleculeInfoSheetProps> = ({
  moleculeData,
  showInfo,
  isLandscape,
  width,
  height,
  insets,
  styles,
  onClose,
}) => {
  const sheetHeight = isLandscape ? width * 0.45 : height * 0.7;
  const slideAnim = useAnimatedValue(showInfo ? 0 : sheetHeight);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: showInfo ? 0 : sheetHeight,
      useNativeDriver: true,
      friction: 9,
      tension: 65,
      overshootClamping: true,
    }).start();
  }, [showInfo, sheetHeight, slideAnim]);

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

  return (
    <Animated.View
      pointerEvents={showInfo ? "auto" : "none"}
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
      {/* Molecule Name & Close Button pinned at top of sheet */}
      <View style={styles.sheetHeaderRow}>
        <Text allowFontScaling={false} style={styles.moleculeName}>
          {moleculeData.name.toUpperCase()}
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.closeButtonInline,
            pressed && {
              opacity: 0.7,
              backgroundColor: addOpacity(COLORS.danger, 0.25),
            },
          ]}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          pressRetentionOffset={{
            top: 20,
            bottom: 20,
            left: 20,
            right: 20,
          }}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close info panel"
        >
          <Ionicons
            name="close"
            size={22}
            color={COLORS.danger}
            allowFontScaling={false}
          />
        </Pressable>
      </View>

      <ScrollView
        style={styles.infoScroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
          paddingLeft: isLandscape ? 16 : 0,
          paddingRight: isLandscape ? Math.max(insets.right, 16) : 0,
        }}
      >
        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardFormula]}>
            <View style={styles.statCardHeader}>
              <Text allowFontScaling={false} style={styles.statLabel}>
                Formula
              </Text>
              <View
                style={[
                  styles.statIconBadge,
                  { backgroundColor: addOpacity(COLORS.emerald, 0.15) },
                ]}
              >
                <Ionicons
                  name="flask-outline"
                  size={12}
                  color={COLORS.emerald}
                  allowFontScaling={false}
                />
              </View>
            </View>
            {moleculeData.formula ? (
              <ChemicalFormula formula={moleculeData.formula} />
            ) : (
              <Text allowFontScaling={false} style={styles.statValue}>
                N/A
              </Text>
            )}
          </View>
          <View style={[styles.statCard, styles.statCardWeight]}>
            <View style={styles.statCardHeader}>
              <Text allowFontScaling={false} style={styles.statLabel}>
                Molecular Weight
              </Text>
              <View
                style={[
                  styles.statIconBadge,
                  { backgroundColor: addOpacity(COLORS.cyan, 0.15) },
                ]}
              >
                <Ionicons
                  name="scale-outline"
                  size={12}
                  color={COLORS.cyan}
                  allowFontScaling={false}
                />
              </View>
            </View>
            <Text allowFontScaling={false} style={styles.statValue}>
              {moleculeData.molecularWeight || "N/A"}
            </Text>
          </View>
        </View>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardIupac]}>
            <View style={styles.statCardHeader}>
              <Text allowFontScaling={false} style={styles.statLabel}>
                IUPAC Name
              </Text>
              <View
                style={[
                  styles.statIconBadge,
                  { backgroundColor: addOpacity(COLORS.purple, 0.15) },
                ]}
              >
                <Ionicons
                  name="text-outline"
                  size={12}
                  color={COLORS.purple}
                  allowFontScaling={false}
                />
              </View>
            </View>
            <Text allowFontScaling={false} style={styles.statValue}>
              {moleculeData.properties.iupacName || "N/A"}
            </Text>
          </View>
          <View style={[styles.statCard, styles.statCardCommon]}>
            <View style={styles.statCardHeader}>
              <Text allowFontScaling={false} style={styles.statLabel}>
                Common Name
              </Text>
              <View
                style={[
                  styles.statIconBadge,
                  { backgroundColor: addOpacity(COLORS.amber, 0.15) },
                ]}
              >
                <Ionicons
                  name="pricetag-outline"
                  size={12}
                  color={COLORS.amber}
                  allowFontScaling={false}
                />
              </View>
            </View>
            <Text allowFontScaling={false} style={styles.statValue}>
              {moleculeData.properties.commonName || "N/A"}
            </Text>
          </View>
        </View>

        {/* Chemical Properties */}
        <CollapsibleSection
          title="Chemical Properties"
          icon="flask-outline"
          iconColor={COLORS.emerald}
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

          {!moleculeData.properties.logP && !moleculeData.properties.tpsa && (
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
            iconColor={COLORS.danger}
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
          iconColor={COLORS.purple}
        >
          <Text allowFontScaling={false} style={styles.descriptionText}>
            {moleculeData.description}
          </Text>
        </CollapsibleSection>

        <CollapsibleSection
          title="Synonyms"
          icon="list-outline"
          iconColor={COLORS.cyan}
        >
          <View style={styles.synonymsContainer}>{synonymsList}</View>
        </CollapsibleSection>

        <CollapsibleSection
          title="Databases"
          icon="link-outline"
          iconColor={COLORS.blue}
        >
          <Text allowFontScaling={false} style={styles.infoText}>
            PubChem CID: {moleculeData.cid}
          </Text>
          <TouchableOpacity
            style={[styles.linkButton, styles.linkButtonPubChem]}
            onPress={() => {
              if (isValidId(moleculeData.cid)) {
                Linking.openURL(
                  `https://pubchem.ncbi.nlm.nih.gov/compound/${moleculeData.cid}`,
                );
              }
            }}
            activeOpacity={0.7}
            accessibilityRole="link"
            accessibilityLabel="View on PubChem"
          >
            <Text
              allowFontScaling={false}
              style={[styles.linkButtonText, { color: COLORS.blue }]}
            >
              View on PubChem
            </Text>
            <Ionicons
              allowFontScaling={false}
              name="open-outline"
              size={styles.linkIcon.fontSize}
              color={COLORS.blue}
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
                style={[styles.linkButton, styles.linkButtonCod]}
                onPress={() => {
                  if (isValidId(moleculeData.codId)) {
                    Linking.openURL(
                      `https://www.crystallography.net/cod/${moleculeData.codId}.html`,
                    );
                  }
                }}
                activeOpacity={0.7}
                accessibilityRole="link"
                accessibilityLabel="View Crystal Data on COD"
              >
                <Text
                  allowFontScaling={false}
                  style={[styles.linkButtonText, { color: COLORS.purple }]}
                >
                  View Crystal Data (COD)
                </Text>
                <Ionicons
                  allowFontScaling={false}
                  name="open-outline"
                  size={styles.linkIcon.fontSize}
                  color={COLORS.purple}
                />
              </TouchableOpacity>
            </>
          )}
        </CollapsibleSection>
      </ScrollView>
    </Animated.View>
  );
};
