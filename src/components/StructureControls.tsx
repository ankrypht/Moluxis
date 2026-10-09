import React from "react";
import { View, Text, Switch, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MoleculeInfo } from "../types";
import { COLORS, addOpacity } from "../constants/colors";
import { StructureControlsStyles } from "./StructureControls.styles";

export interface StructureControlsProps {
  moleculeData: MoleculeInfo;
  isAnimated: boolean;
  structureFormat: "3d" | "2d";
  onToggleAnimation: () => void;
  onSelectFormat: (format: "3d" | "2d") => void;
  styles: StructureControlsStyles;
}

export const StructureControls: React.FC<StructureControlsProps> = React.memo(
  ({
    moleculeData,
    isAnimated,
    structureFormat,
    onToggleAnimation,
    onSelectFormat,
    styles,
  }) => {
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
            onValueChange={onToggleAnimation}
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
              moleculeData.sdf2d ? null : styles.badgeNotAvailable,
              structureFormat === "2d" && styles.badgeActive,
            ]}
            onPress={() =>
              moleculeData.sdf2d
                ? onSelectFormat("2d")
                : Alert.alert(
                    "2D Structure Unavailable",
                    "No 2D structure data available for this compound.",
                  )
            }
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={
              moleculeData.sdf2d ? "2D Structure" : "2D Structure (Unavailable)"
            }
            accessibilityState={{
              selected: structureFormat === "2d",
            }}
          >
            <Ionicons
              allowFontScaling={false}
              name="layers-outline"
              size={13}
              color={
                structureFormat === "2d"
                  ? COLORS.primary
                  : moleculeData.sdf2d
                    ? COLORS.textSecondary
                    : COLORS.textMuted
              }
            />
            <Text
              allowFontScaling={false}
              style={[
                styles.badgeText,
                moleculeData.sdf2d ? null : styles.badgeTextNotAvailable,
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
                ? onSelectFormat("3d")
                : Alert.alert(
                    "3D Structure Unavailable",
                    "No 3D structure data available for this compound.",
                  )
            }
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={
              moleculeData.sdf3d || moleculeData.useCif
                ? "3D Structure"
                : "3D Structure (Unavailable)"
            }
            accessibilityState={{
              selected: structureFormat === "3d",
            }}
          >
            <Ionicons
              allowFontScaling={false}
              name="cube-outline"
              size={13}
              color={
                structureFormat === "3d"
                  ? COLORS.primary
                  : moleculeData.sdf3d || moleculeData.useCif
                    ? COLORS.textSecondary
                    : COLORS.textMuted
              }
            />
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
      </>
    );
  },
);

StructureControls.displayName = "StructureControls";
