import React from "react";
import { View, Text, Switch, TouchableOpacity, Alert } from "react-native";
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

export const StructureControls: React.FC<StructureControlsProps> = ({
  moleculeData,
  isAnimated,
  structureFormat,
  onToggleAnimation,
  onSelectFormat,
  styles,
}) => {
  return (
    <>
      <View style={styles.toggleContainer}>
        <Text allowFontScaling={false} style={styles.toggleText}>
          Animate
        </Text>
        <Switch
          trackColor={{
            false: COLORS.border,
            true: addOpacity(COLORS.primary, 0.4),
          }}
          thumbColor={isAnimated ? COLORS.primary : COLORS.textSecondary}
          onValueChange={onToggleAnimation}
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
              ? onSelectFormat("2d")
              : Alert.alert(
                  "2D Structure Unavailable",
                  "No 2D structure data available for this compound.",
                )
          }
        >
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
        >
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
};
