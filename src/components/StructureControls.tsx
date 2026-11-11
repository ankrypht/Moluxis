import React from "react";
import { View, Text, Switch, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Alert } from "./CustomAlert";
import { MoleculeInfo } from "../types";
import { COLORS, addOpacity } from "../constants/colors";
import { StructureControlsStyles } from "./StructureControls.styles";
import { triggerSelectionHaptic, triggerWarningHaptic } from "../utils/haptics";

export interface StructureControlsProps {
  moleculeData: MoleculeInfo;
  isAnimated: boolean;
  structureFormat: "3d" | "2d";
  onToggleAnimation: () => void;
  onSelectFormat: (format: "3d" | "2d") => void;
  styles: StructureControlsStyles;
  isLandscape?: boolean;
}

export const StructureControls: React.FC<StructureControlsProps> = React.memo(
  ({
    moleculeData,
    isAnimated,
    structureFormat,
    onToggleAnimation,
    onSelectFormat,
    styles,
    isLandscape = false,
  }) => {
    const has3d = Boolean(moleculeData.sdf3d || moleculeData.useCif);
    const has2d = Boolean(moleculeData.sdf2d);

    const handlePressFormat = (format: "3d" | "2d") => {
      const isAvailable = format === "3d" ? has3d : has2d;
      if (isAvailable) {
        triggerSelectionHaptic();
        onSelectFormat(format);
      } else {
        triggerWarningHaptic();
        Alert.alert(
          `${format.toUpperCase()} Structure Unavailable`,
          `No ${format.toUpperCase()} structure data available for this compound.`,
        );
      }
    };

    const handleToggleAnim = () => {
      triggerSelectionHaptic();
      onToggleAnimation();
    };

    const getFormatLabel = (format: "3d" | "2d") => {
      const isAvailable = format === "3d" ? has3d : has2d;
      const prefix = format.toUpperCase();
      return isAvailable
        ? `${prefix} Structure`
        : `${prefix} Structure (Unavailable)`;
    };

    const getFormatColor = (format: "3d" | "2d") => {
      if (structureFormat === format) return COLORS.primary;
      const isAvailable = format === "3d" ? has3d : has2d;
      return isAvailable ? COLORS.textSecondary : COLORS.textMuted;
    };

    if (isLandscape) {
      return (
        <View style={styles.leftRailColumn}>
          {/* 3D Structure Button */}
          <TouchableOpacity
            style={[
              styles.leftRailChip,
              structureFormat === "3d" && styles.leftRailChipActive,
              !has3d && styles.leftRailChipDisabled,
            ]}
            onPress={() => handlePressFormat("3d")}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={getFormatLabel("3d")}
            accessibilityState={{
              selected: structureFormat === "3d",
            }}
          >
            <Ionicons
              allowFontScaling={false}
              name={structureFormat === "3d" ? "cube" : "cube-outline"}
              size={18}
              color={getFormatColor("3d")}
              style={styles.leftRailIcon}
            />
            <Text
              allowFontScaling={false}
              style={[
                styles.leftRailChipText,
                structureFormat === "3d" && styles.leftRailChipTextActive,
                !has3d && styles.leftRailChipTextDisabled,
              ]}
            >
              3D
            </Text>
          </TouchableOpacity>

          {/* 2D Structure Button */}
          <TouchableOpacity
            style={[
              styles.leftRailChip,
              structureFormat === "2d" && styles.leftRailChipActive,
              !has2d && styles.leftRailChipDisabled,
            ]}
            onPress={() => handlePressFormat("2d")}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={getFormatLabel("2d")}
            accessibilityState={{
              selected: structureFormat === "2d",
            }}
          >
            <Ionicons
              allowFontScaling={false}
              name={structureFormat === "2d" ? "layers" : "layers-outline"}
              size={18}
              color={getFormatColor("2d")}
              style={styles.leftRailIcon}
            />
            <Text
              allowFontScaling={false}
              style={[
                styles.leftRailChipText,
                structureFormat === "2d" && styles.leftRailChipTextActive,
                !has2d && styles.leftRailChipTextDisabled,
              ]}
            >
              2D
            </Text>
          </TouchableOpacity>

          {/* Animate Toggle Button */}
          <TouchableOpacity
            style={[
              styles.leftRailChip,
              isAnimated && styles.leftRailChipActive,
            ]}
            onPress={handleToggleAnim}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Toggle rotation animation"
            accessibilityState={{
              selected: isAnimated,
              checked: isAnimated,
            }}
          >
            <Ionicons
              allowFontScaling={false}
              name={isAnimated ? "sync" : "sync-outline"}
              size={18}
              color={isAnimated ? COLORS.primary : COLORS.textSecondary}
              style={styles.leftRailIcon}
            />
            <Text
              allowFontScaling={false}
              numberOfLines={1}
              style={[
                styles.leftRailChipText,
                isAnimated && styles.leftRailChipTextActive,
              ]}
            >
              Animate
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <>
        <View
          style={[
            styles.toggleContainer,
            isAnimated && styles.toggleContainerActive,
          ]}
        >
          <Ionicons
            allowFontScaling={false}
            name={isAnimated ? "sync" : "sync-outline"}
            size={13}
            color={isAnimated ? COLORS.primary : COLORS.textMuted}
          />
          <Text
            allowFontScaling={false}
            style={[
              styles.toggleText,
              isAnimated && { color: COLORS.textPrimary },
            ]}
          >
            Animate
          </Text>
          <Switch
            trackColor={{
              false: COLORS.border,
              true: addOpacity(COLORS.primary, 0.45),
            }}
            thumbColor={isAnimated ? COLORS.primary : COLORS.textSecondary}
            onValueChange={handleToggleAnim}
            value={isAnimated}
            style={styles.switchScale}
            accessibilityRole="switch"
            accessibilityLabel="Toggle rotation animation"
            accessibilityState={{ checked: isAnimated }}
          />
        </View>
        <View style={styles.badgeContainer}>
          <TouchableOpacity
            style={[
              styles.badge,
              has2d ? null : styles.badgeNotAvailable,
              structureFormat === "2d" && styles.badgeActive,
            ]}
            onPress={() => handlePressFormat("2d")}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={getFormatLabel("2d")}
            accessibilityState={{
              selected: structureFormat === "2d",
            }}
          >
            <Ionicons
              allowFontScaling={false}
              name="layers-outline"
              size={13}
              color={getFormatColor("2d")}
            />
            <Text
              allowFontScaling={false}
              style={[
                styles.badgeText,
                has2d ? null : styles.badgeTextNotAvailable,
                structureFormat === "2d" && styles.badgeTextActive,
              ]}
            >
              2D
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.badge,
              has3d ? null : styles.badgeNotAvailable,
              structureFormat === "3d" && styles.badgeActive,
            ]}
            onPress={() => handlePressFormat("3d")}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={getFormatLabel("3d")}
            accessibilityState={{
              selected: structureFormat === "3d",
            }}
          >
            <Ionicons
              allowFontScaling={false}
              name="cube-outline"
              size={13}
              color={getFormatColor("3d")}
            />
            <Text
              allowFontScaling={false}
              style={[
                styles.badgeText,
                has3d ? null : styles.badgeTextNotAvailable,
                structureFormat === "3d" && styles.badgeTextActive,
              ]}
            >
              3D
            </Text>
          </TouchableOpacity>
        </View>
      </>
    );
  },
);

StructureControls.displayName = "StructureControls";
