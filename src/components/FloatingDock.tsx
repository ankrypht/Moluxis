import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { VisualizationType } from "../types";
import { COLORS, addOpacity } from "../constants/colors";
import { FloatingDockStyles } from "./FloatingDock.styles";
import {
  triggerStylePressHaptic,
  triggerZenModeHaptic,
  triggerImpactLight,
  triggerSelectionHaptic,
} from "../utils/haptics";

export interface FloatingDockProps {
  vizStyle: VisualizationType;
  showLabels: boolean;
  showInfo: boolean;
  showDisplayOptions: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  styles: FloatingDockStyles;
  onSelectStyle: (style: VisualizationType) => void;
  onToggleDisplayOptions: () => void;
  onToggleInfo: () => void;
  onToggleLabels: () => void;
  onEnterZenMode: () => void;
  isMeasuring?: boolean;
  onToggleMeasure?: () => void;
  isLandscape?: boolean;
  isCompact?: boolean;
}

export interface StyleOption {
  id: VisualizationType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  accentBg: string;
}

const STYLES_LIST: StyleOption[] = [
  {
    id: "ballStick",
    label: "Ball & Stick",
    icon: "git-network-outline",
    color: COLORS.emerald,
    accentBg: addOpacity(COLORS.emerald, 0.15),
  },
  {
    id: "stick",
    label: "Sticks",
    icon: "git-commit-outline",
    color: COLORS.purple,
    accentBg: addOpacity(COLORS.purple, 0.15),
  },
  {
    id: "sphere",
    label: "Space-Fill",
    icon: "planet-outline",
    color: COLORS.cyan,
    accentBg: addOpacity(COLORS.cyan, 0.15),
  },
  {
    id: "wireframe",
    label: "Wireframe",
    icon: "grid-outline",
    color: COLORS.amber,
    accentBg: addOpacity(COLORS.amber, 0.15),
  },
];

export const FloatingDock: React.FC<FloatingDockProps> = React.memo(
  ({
    vizStyle,
    showLabels,
    showInfo,
    showDisplayOptions,
    containerStyle,
    styles,
    onSelectStyle,
    onToggleDisplayOptions,
    onToggleInfo,
    onToggleLabels,
    onEnterZenMode,
    isMeasuring = false,
    onToggleMeasure,
    isLandscape = false,
    isCompact: isCompactProp,
  }) => {
    const isCompact = Boolean(isLandscape && (isCompactProp ?? showInfo));
    const iconSpacingStyle = isCompact
      ? styles.dockIconCompact
      : styles.dockIcon;

    return (
      <View
        style={[styles.floatingDockContainer, containerStyle]}
        pointerEvents="box-none"
      >
        {showDisplayOptions && (
          <TouchableOpacity
            style={styles.dockBackdrop}
            activeOpacity={1}
            onPress={onToggleDisplayOptions}
            accessibilityRole="button"
            accessibilityLabel="Close display options"
          />
        )}

        {showDisplayOptions && (
          <View
            style={[
              styles.displayOptionsMenu,
              isLandscape && styles.displayOptionsMenuLandscape,
              isCompact && styles.displayOptionsMenuCompact,
            ]}
            onStartShouldSetResponder={() => true}
          >
            {/* Display Options Header */}
            <View style={styles.displayOptionsHeader}>
              <Ionicons
                name="options-outline"
                size={12}
                color={COLORS.textMuted}
                allowFontScaling={false}
              />
              <Text allowFontScaling={false} style={styles.displayOptionsTitle}>
                Display Options
              </Text>
            </View>

            {/* Atom Labels Toggle Row */}
            <TouchableOpacity
              style={[
                styles.displayOptionsItem,
                showLabels && styles.displayOptionsItemActive,
              ]}
              onPress={() => {
                triggerSelectionHaptic();
                onToggleLabels();
              }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Toggle atom labels"
              accessibilityState={{ selected: showLabels }}
            >
              <View style={styles.displayOptionsItemLeft}>
                <View
                  style={[
                    styles.displayOptionsIconBadge,
                    {
                      backgroundColor: showLabels
                        ? addOpacity(COLORS.primary, 0.15)
                        : addOpacity(COLORS.surfaceElevated, 0.8),
                    },
                  ]}
                >
                  <Ionicons
                    name="text-outline"
                    size={14}
                    color={showLabels ? COLORS.primary : COLORS.textSecondary}
                    allowFontScaling={false}
                  />
                </View>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.displayOptionsItemText,
                    showLabels && [
                      styles.displayOptionsItemTextActive,
                      { color: COLORS.textPrimary },
                    ],
                  ]}
                >
                  Atom Labels
                </Text>
              </View>
              <View
                style={[
                  styles.displayToggleBadge,
                  showLabels && styles.displayToggleBadgeActive,
                ]}
              >
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.displayToggleBadgeText,
                    showLabels && styles.displayToggleBadgeTextActive,
                  ]}
                >
                  {showLabels ? "ON" : "OFF"}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.displayOptionsDivider} />

            {/* Render Style Section Subheader */}
            <View style={styles.displayOptionsSubHeader}>
              <Ionicons
                name="sparkles-outline"
                size={11}
                color={COLORS.textMuted}
                allowFontScaling={false}
              />
              <Text
                allowFontScaling={false}
                style={styles.displayOptionsSubTitle}
              >
                Render Style
              </Text>
            </View>

            {/* Render Styles List (in 2-column grid when isLandscape) */}
            <View
              style={
                isLandscape ? styles.displayOptionsGridLandscape : undefined
              }
            >
              {STYLES_LIST.map(
                ({ id: style, label, icon, color, accentBg }) => {
                  const isActive = vizStyle === style;
                  return (
                    <TouchableOpacity
                      key={style}
                      style={[
                        styles.displayOptionsItem,
                        isLandscape && styles.displayOptionsItemLandscape,
                        isActive && [
                          styles.displayOptionsItemActive,
                          {
                            backgroundColor: accentBg,
                            borderColor: addOpacity(color, 0.35),
                          },
                        ],
                      ]}
                      onPress={() => {
                        triggerStylePressHaptic();
                        onSelectStyle(style);
                      }}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={`${label} style`}
                      accessibilityState={{ selected: isActive }}
                    >
                      <View style={styles.displayOptionsItemLeft}>
                        <View
                          style={[
                            styles.displayOptionsIconBadge,
                            { backgroundColor: accentBg },
                          ]}
                        >
                          <Ionicons
                            name={icon}
                            size={14}
                            color={color}
                            allowFontScaling={false}
                          />
                        </View>
                        <Text
                          allowFontScaling={false}
                          style={[
                            styles.displayOptionsItemText,
                            isActive && [
                              styles.displayOptionsItemTextActive,
                              { color: COLORS.textPrimary },
                            ],
                          ]}
                        >
                          {label}
                        </Text>
                      </View>
                      {isActive && (
                        <Ionicons
                          name="checkmark-circle"
                          size={17}
                          color={color}
                          allowFontScaling={false}
                        />
                      )}
                    </TouchableOpacity>
                  );
                },
              )}
            </View>
          </View>
        )}

        <View style={[styles.dock, isCompact && styles.dockCompact]}>
          <View style={[styles.dockRow, isCompact && styles.dockRowCompact]}>
            {/* 1. Zen Mode */}
            <TouchableOpacity
              style={[styles.dockChip, isCompact && styles.dockChipCompact]}
              onPress={() => {
                triggerZenModeHaptic();
                onEnterZenMode();
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              accessibilityRole="button"
              accessibilityLabel="Enter Zen full screen mode"
            >
              <Ionicons
                allowFontScaling={false}
                name="expand-outline"
                size={isCompact ? 15 : styles.infoIcon.fontSize}
                color={COLORS.textSecondary}
                style={iconSpacingStyle}
              />
              <Text
                allowFontScaling={false}
                style={[
                  styles.dockChipText,
                  isCompact && styles.dockChipTextCompact,
                ]}
              >
                Zen
              </Text>
            </TouchableOpacity>

            {/* 2. Info */}
            <TouchableOpacity
              style={[
                styles.dockChip,
                isCompact && styles.dockChipCompact,
                showInfo && styles.dockChipActive,
              ]}
              onPress={() => {
                triggerImpactLight();
                onToggleInfo();
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              accessibilityRole="button"
              accessibilityLabel="Toggle molecule information"
              accessibilityState={{ selected: showInfo }}
            >
              <Ionicons
                allowFontScaling={false}
                name={
                  showInfo ? "information-circle" : "information-circle-outline"
                }
                size={isCompact ? 15 : styles.infoIcon.fontSize}
                color={showInfo ? COLORS.primary : COLORS.textSecondary}
                style={iconSpacingStyle}
              />
              <Text
                allowFontScaling={false}
                style={[
                  styles.dockChipText,
                  isCompact && styles.dockChipTextCompact,
                  showInfo && styles.dockChipTextActive,
                ]}
              >
                Info
              </Text>
            </TouchableOpacity>

            {/* 3. Measure */}
            <TouchableOpacity
              style={[
                styles.dockChip,
                isCompact && styles.dockChipCompact,
                isMeasuring && styles.dockChipActive,
              ]}
              onPress={() => {
                triggerSelectionHaptic();
                onToggleMeasure?.();
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              accessibilityRole="button"
              accessibilityLabel="Toggle measurement mode"
              accessibilityState={{ selected: isMeasuring }}
            >
              <Ionicons
                allowFontScaling={false}
                name={isMeasuring ? "resize" : "resize-outline"}
                size={isCompact ? 15 : styles.infoIcon.fontSize}
                color={isMeasuring ? COLORS.primary : COLORS.textSecondary}
                style={iconSpacingStyle}
              />
              <Text
                allowFontScaling={false}
                style={[
                  styles.dockChipText,
                  isCompact && styles.dockChipTextCompact,
                  isMeasuring && styles.dockChipTextActive,
                ]}
              >
                Measure
              </Text>
            </TouchableOpacity>

            {/* 4. Display (Render Style & Labels) */}
            <TouchableOpacity
              style={[
                styles.dockChip,
                isCompact && styles.dockChipCompact,
                showDisplayOptions && styles.dockChipActive,
              ]}
              onPress={() => {
                triggerStylePressHaptic();
                onToggleDisplayOptions();
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              accessibilityRole="button"
              accessibilityLabel="Toggle display and style options"
              accessibilityState={{ expanded: showDisplayOptions }}
            >
              <Ionicons
                allowFontScaling={false}
                name={showDisplayOptions ? "options" : "options-outline"}
                size={isCompact ? 15 : styles.infoIcon.fontSize}
                color={
                  showDisplayOptions ? COLORS.primary : COLORS.textSecondary
                }
                style={iconSpacingStyle}
              />
              <Text
                allowFontScaling={false}
                style={[
                  styles.dockChipText,
                  isCompact && styles.dockChipTextCompact,
                  showDisplayOptions && styles.dockChipTextActive,
                ]}
              >
                Display
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  },
);

FloatingDock.displayName = "FloatingDock";
