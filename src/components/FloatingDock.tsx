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

export interface FloatingDockProps {
  vizStyle: VisualizationType;
  showLabels: boolean;
  showInfo: boolean;
  showStyleMenu: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  styles: FloatingDockStyles;
  onSelectStyle: (style: VisualizationType) => void;
  onToggleStyleMenu: () => void;
  onToggleInfo: () => void;
  onToggleLabels: () => void;
  onEnterZenMode: () => void;
  isLandscape?: boolean;
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

export const FloatingDock: React.FC<FloatingDockProps> = ({
  vizStyle,
  showLabels,
  showInfo,
  showStyleMenu,
  containerStyle,
  styles,
  onSelectStyle,
  onToggleStyleMenu,
  onToggleInfo,
  onToggleLabels,
  onEnterZenMode,
  isLandscape = false,
}) => {
  const isCompact = Boolean(isLandscape && showInfo);

  return (
    <View
      style={[styles.floatingDockContainer, containerStyle]}
      pointerEvents="box-none"
    >
      {showStyleMenu && (
        <View
          style={[
            styles.styleMenu,
            isLandscape && styles.styleMenuLandscape,
            isCompact && styles.styleMenuCompact,
          ]}
        >
          <View style={styles.styleMenuHeader}>
            <Ionicons
              name="sparkles-outline"
              size={12}
              color={COLORS.textMuted}
              allowFontScaling={false}
            />
            <Text allowFontScaling={false} style={styles.styleMenuTitle}>
              Render Style
            </Text>
          </View>
          {STYLES_LIST.map(({ id: style, label, icon, color, accentBg }) => {
            const isActive = vizStyle === style;
            return (
              <TouchableOpacity
                key={style}
                style={[
                  styles.styleMenuItem,
                  isActive && [
                    styles.styleMenuItemActive,
                    {
                      backgroundColor: accentBg,
                      borderColor: addOpacity(color, 0.35),
                    },
                  ],
                ]}
                onPress={() => onSelectStyle(style)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${label} style`}
                accessibilityState={{ selected: isActive }}
              >
                <View style={styles.styleMenuItemLeft}>
                  <View
                    style={[
                      styles.styleMenuIconBadge,
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
                      styles.styleMenuItemText,
                      isActive && [
                        styles.styleMenuItemTextActive,
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
          })}
        </View>
      )}

      <View style={[styles.dock, isCompact && styles.dockCompact]}>
        <View
          style={[styles.dockScroll, isCompact && styles.dockScrollCompact]}
        >
          <TouchableOpacity
            style={[styles.dockChip, isCompact && styles.dockChipCompact]}
            onPress={onEnterZenMode}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Enter Zen full screen mode"
          >
            <Ionicons
              allowFontScaling={false}
              name="expand-outline"
              size={isCompact ? 16 : styles.infoIcon.fontSize}
              color={COLORS.textSecondary}
              style={{ marginRight: isCompact ? 3 : 4 }}
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

          <TouchableOpacity
            style={[
              styles.dockChip,
              isCompact && styles.dockChipCompact,
              showInfo && styles.dockChipActive,
            ]}
            onPress={onToggleInfo}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Toggle molecule information"
            accessibilityState={{ selected: showInfo }}
          >
            <Ionicons
              allowFontScaling={false}
              name={
                showInfo ? "information-circle" : "information-circle-outline"
              }
              size={isCompact ? 16 : styles.infoIcon.fontSize}
              color={showInfo ? COLORS.primary : COLORS.textSecondary}
              style={{ marginRight: isCompact ? 3 : 4 }}
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

          <TouchableOpacity
            style={[
              styles.dockChip,
              isCompact && styles.dockChipCompact,
              showLabels && styles.dockChipActive,
            ]}
            onPress={onToggleLabels}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Toggle atom labels"
            accessibilityState={{ selected: showLabels }}
          >
            <Ionicons
              allowFontScaling={false}
              name={showLabels ? "text" : "text-outline"}
              size={isCompact ? 16 : styles.infoIcon.fontSize}
              color={showLabels ? COLORS.primary : COLORS.textSecondary}
              style={{ marginRight: isCompact ? 3 : 4 }}
            />
            <Text
              allowFontScaling={false}
              style={[
                styles.dockChipText,
                isCompact && styles.dockChipTextCompact,
                showLabels && styles.dockChipTextActive,
              ]}
            >
              Labels
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.dockChip,
              isCompact && styles.dockChipCompact,
              showStyleMenu && styles.dockChipActive,
            ]}
            onPress={onToggleStyleMenu}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Toggle rendering styles menu"
            accessibilityState={{ expanded: showStyleMenu }}
          >
            <Ionicons
              allowFontScaling={false}
              name={showStyleMenu ? "cube" : "cube-outline"}
              size={isCompact ? 16 : styles.infoIcon.fontSize}
              color={showStyleMenu ? COLORS.primary : COLORS.textSecondary}
              style={{ marginRight: isCompact ? 3 : 4 }}
            />
            <Text
              allowFontScaling={false}
              style={[
                styles.dockChipText,
                isCompact && styles.dockChipTextCompact,
                showStyleMenu && styles.dockChipTextActive,
              ]}
            >
              Style
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
