import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  LayoutChangeEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { MeasurementMode, PickedAtom, MeasurementData } from "../types";
import { getRequiredAtomCount } from "../utils/geometry";
import { MeasurementPanelStyles } from "./MeasurementPanel.styles";
import { ATOM_MESH_COLORS, COLORS, addOpacity } from "../constants/colors";
import {
  triggerSelectionHaptic,
  triggerImpactLight,
  triggerWarningHaptic,
} from "../utils/haptics";

export interface MeasurementPanelProps {
  mode: MeasurementMode;
  pickedAtoms: PickedAtom[];
  measurementData: MeasurementData | null;
  onSelectMode: (mode: MeasurementMode) => void;
  onRemoveAtom: (index: number) => void;
  onClear: () => void;
  onClose: () => void;
  styles: MeasurementPanelStyles;
  isLandscape?: boolean;
  onPanelLayout?: (size: { width: number; height: number }) => void;
}

const MODES: {
  id: MeasurementMode;
  label: string;
  count: number;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: "distance", label: "Length", count: 2, icon: "resize-outline" },
  { id: "angle", label: "Angle", count: 3, icon: "git-commit-outline" },
  { id: "dihedral", label: "Dihedral", count: 4, icon: "cube-outline" },
];

export const MeasurementPanel: React.FC<MeasurementPanelProps> = React.memo(
  ({
    mode,
    pickedAtoms,
    measurementData,
    onSelectMode,
    onRemoveAtom,
    onClear,
    onClose,
    styles,
    isLandscape = false,
    onPanelLayout,
  }) => {
    const requiredCount = getRequiredAtomCount(mode);
    const isComplete = pickedAtoms.length >= requiredCount && !!measurementData;

    const getStatusText = () => {
      const remaining = requiredCount - pickedAtoms.length;
      if (remaining <= 0) {
        return "Measurement complete. Tap atoms to adjust.";
      }
      if (pickedAtoms.length === 0) {
        switch (mode) {
          case "distance":
            return "Tap 2 atoms to measure bond distance";
          case "angle":
            return "Tap 3 atoms (second atom is the vertex)";
          case "dihedral":
            return "Tap 4 atoms to measure torsion angle";
        }
      }
      return `Select ${remaining} more atom${remaining > 1 ? "s" : ""} on the model...`;
    };

    const closeButton = (
      <TouchableOpacity
        style={styles.measurementCloseButton}
        onPress={() => {
          triggerImpactLight();
          onClose();
        }}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Close measurement tool"
      >
        <Ionicons
          name="close"
          size={18}
          color={COLORS.danger}
          allowFontScaling={false}
        />
      </TouchableOpacity>
    );

    const modeTabs = (
      <View style={styles.measurementModeTabs}>
        {MODES.map((item) => {
          const isActive = mode === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.measurementModeTab,
                isActive && styles.measurementModeTabActive,
              ]}
              onPress={() => {
                triggerSelectionHaptic();
                onSelectMode(item.id);
              }}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityLabel={`${item.label} mode (${item.count} atoms)`}
              accessibilityState={{ selected: isActive }}
            >
              <Ionicons
                name={item.icon}
                size={isLandscape ? 13 : 14}
                color={isActive ? COLORS.primary : COLORS.textMuted}
                allowFontScaling={false}
              />
              <Text
                allowFontScaling={false}
                numberOfLines={1}
                style={[
                  styles.measurementModeTabText,
                  isActive && styles.measurementModeTabTextActive,
                ]}
              >
                {isLandscape ? item.label : `${item.label} (${item.count})`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );

    const topContent = (
      <>
        {/* HEADER: Mode Selector & Close */}
        {isLandscape ? (
          <>
            <View style={styles.measurementLandscapeHeader}>
              <View style={styles.measurementLandscapeTitleRow}>
                <Ionicons
                  name="resize"
                  size={16}
                  color={COLORS.primary}
                  allowFontScaling={false}
                />
                <Text
                  allowFontScaling={false}
                  style={styles.measurementLandscapeTitle}
                >
                  Measure
                </Text>
              </View>
              {closeButton}
            </View>
            {modeTabs}
          </>
        ) : (
          <View style={styles.measurementHeader}>
            {modeTabs}
            {closeButton}
          </View>
        )}

        {/* STATUS PROMPT */}
        <Text allowFontScaling={false} style={styles.measurementStatusPrompt}>
          {getStatusText()}
        </Text>

        {/* ATOM SELECTION SLOTS */}
        <View style={styles.measurementAtomSlotsRow}>
          {Array.from({ length: requiredCount }).map((_, index) => {
            const atom = pickedAtoms[index];
            if (atom) {
              const meshColor =
                ATOM_MESH_COLORS[index % ATOM_MESH_COLORS.length];
              return (
                <TouchableOpacity
                  key={`atom-${index}-${atom.index ?? index}-${atom.serial ?? index}`}
                  style={[
                    styles.measurementAtomPill,
                    {
                      borderColor: addOpacity(meshColor, 0.75),
                      backgroundColor: addOpacity(meshColor, 0.14),
                    },
                  ]}
                  onPress={() => {
                    triggerImpactLight();
                    onRemoveAtom(index);
                  }}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove atom ${index + 1}: ${atom.elem} ${atom.serial}`}
                >
                  <View
                    style={[
                      styles.measurementAtomIndexBadge,
                      { backgroundColor: meshColor },
                    ]}
                  >
                    <Text
                      allowFontScaling={false}
                      style={[
                        styles.measurementAtomIndexText,
                        { color: COLORS.background },
                      ]}
                    >
                      {index + 1}
                    </Text>
                  </View>
                  <Text
                    allowFontScaling={false}
                    style={styles.measurementAtomElemText}
                  >
                    {atom.elem}
                  </Text>
                  <Ionicons
                    name="close-circle"
                    size={15}
                    color={COLORS.danger}
                    style={styles.measurementAtomRemoveIcon}
                    allowFontScaling={false}
                  />
                </TouchableOpacity>
              );
            }

            return (
              <View
                key={`empty-slot-${index}`}
                style={[
                  styles.measurementAtomPill,
                  styles.measurementAtomPillEmpty,
                ]}
              >
                <View style={styles.measurementAtomIndexBadge}>
                  <Text
                    allowFontScaling={false}
                    style={styles.measurementAtomIndexText}
                  >
                    {index + 1}
                  </Text>
                </View>
                <Text
                  allowFontScaling={false}
                  style={styles.measurementEmptySlotText}
                >
                  {index === 1 && mode === "angle" ? "Vertex" : "Atom"}
                </Text>
              </View>
            );
          })}
        </View>

        {/* LIVE CALCULATION RESULT */}
        {isComplete && (
          <View
            style={styles.measurementResultCard}
            accessibilityLabel={`Result: ${measurementData.designation} equals ${measurementData.displayValue}`}
          >
            <View style={styles.measurementResultLeft}>
              <Text
                allowFontScaling={false}
                style={styles.measurementResultDesignation}
              >
                {measurementData.designation}
              </Text>
              <Text
                allowFontScaling={false}
                style={styles.measurementResultValue}
              >
                {measurementData.displayValue}
              </Text>
            </View>
            <View style={styles.measurementResultBadge}>
              <Text
                allowFontScaling={false}
                style={styles.measurementResultBadgeText}
              >
                {mode === "distance"
                  ? "Distance"
                  : mode === "angle"
                    ? "Angle"
                    : "Dihedral"}
              </Text>
            </View>
          </View>
        )}
      </>
    );

    return (
      <View
        style={styles.measurementPanelWrapper}
        pointerEvents="box-none"
        onLayout={(e: LayoutChangeEvent) => {
          const { width, height } = e.nativeEvent.layout;
          onPanelLayout?.({ width, height });
        }}
      >
        <View
          style={styles.measurementPanelContainer}
          accessibilityLabel="Measurement panel"
        >
          {isLandscape ? (
            <ScrollView
              style={styles.measurementTopScroll}
              contentContainerStyle={styles.measurementTopSection}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {topContent}
            </ScrollView>
          ) : (
            <View style={styles.measurementTopSection}>{topContent}</View>
          )}

          {/* FOOTER ACTIONS */}
          <View style={styles.measurementFooterActions}>
            {pickedAtoms.length > 0 && (
              <TouchableOpacity
                style={styles.measurementClearButton}
                onPress={() => {
                  triggerWarningHaptic();
                  onClear();
                }}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Clear measurement selection"
              >
                <Ionicons
                  name="trash-outline"
                  size={15}
                  color={COLORS.danger}
                  allowFontScaling={false}
                />
                <Text
                  allowFontScaling={false}
                  style={styles.measurementClearButtonText}
                >
                  Clear
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.measurementDoneButton}
              onPress={() => {
                triggerImpactLight();
                onClose();
              }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Done measuring"
            >
              <Text
                allowFontScaling={false}
                style={styles.measurementDoneButtonText}
              >
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  },
);

MeasurementPanel.displayName = "MeasurementPanel";
