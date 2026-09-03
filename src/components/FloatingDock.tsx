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
import { COLORS } from "../constants/colors";
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
}

const STYLES_LIST: { id: VisualizationType; label: string }[] = [
  { id: "ballStick", label: "Ball & Stick" },
  { id: "stick", label: "Sticks" },
  { id: "sphere", label: "Space-Fill" },
  { id: "wireframe", label: "Wireframe" },
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
}) => {
  return (
    <View
      style={[styles.floatingDockContainer, containerStyle]}
      pointerEvents="box-none"
    >
      {showStyleMenu && (
        <View style={styles.styleMenu}>
          {STYLES_LIST.map(({ id: style, label }) => {
            const isActive = vizStyle === style;
            return (
              <TouchableOpacity
                key={style}
                style={[
                  styles.styleMenuItem,
                  isActive && styles.styleMenuItemActive,
                ]}
                onPress={() => onSelectStyle(style)}
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
          })}
        </View>
      )}

      <View style={styles.dock}>
        <View style={styles.dockScroll}>
          <TouchableOpacity style={styles.dockChip} onPress={onEnterZenMode}>
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
            onPress={onToggleInfo}
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
            onPress={onToggleLabels}
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
            style={[styles.dockChip, showStyleMenu && styles.dockChipActive]}
            onPress={onToggleStyleMenu}
          >
            <Ionicons
              allowFontScaling={false}
              name="cube-outline"
              size={styles.infoIcon.fontSize}
              color={showStyleMenu ? COLORS.textPrimary : COLORS.textSecondary}
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
  );
};
