import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Alert } from "./CustomAlert";
import { MoleculeInfo } from "../types";
import { COLORS, addOpacity } from "../constants/colors";
import {
  StructureControlsStyles,
  getStructureControlsStyles,
} from "./StructureControls.styles";
import { useScaleMetrics } from "../utils/scaling";
import { triggerSelectionHaptic, triggerWarningHaptic } from "../utils/haptics";
import { fetchSdf } from "../services/pubchem/api";
import { saveCachedMolecule } from "../services/storage/moleculeDiskCache";
import { cacheMoleculeInRam } from "../hooks/useMoleculeSearch";

export interface StructureControlsProps {
  moleculeData: MoleculeInfo;
  isAnimated: boolean;
  structureFormat: "3d" | "2d";
  onToggleAnimation: () => void;
  onSelectFormat: (format: "3d" | "2d") => void;
  styles?: StructureControlsStyles;
  isLandscape?: boolean;
  isCompact?: boolean;
  showInfo?: boolean;
}

export const StructureControls: React.FC<StructureControlsProps> = React.memo(
  ({
    moleculeData,
    isAnimated,
    structureFormat,
    onToggleAnimation,
    onSelectFormat,
    styles: passedStyles,
    isLandscape = false,
    isCompact: isCompactProp,
    showInfo = false,
  }) => {
    const metrics = useScaleMetrics();
    const ownStyles = useMemo(
      () => getStructureControlsStyles(metrics),
      [metrics],
    );
    const styles =
      passedStyles && passedStyles.toggleContainer ? passedStyles : ownStyles;
    const [isLoading2d, setIsLoading2d] = useState(false);

    const isCompact = Boolean(isLandscape && (isCompactProp ?? showInfo));
    const has3d = Boolean(moleculeData.sdf3d || moleculeData.useCif);
    const is2dLoaded = Boolean(moleculeData.sdf2d);
    const is2dAvailable =
      moleculeData.has2d !== false &&
      (is2dLoaded || Boolean(moleculeData.cid && moleculeData.cid !== "0"));

    const handlePressFormat = async (format: "3d" | "2d") => {
      if (format === "3d") {
        if (has3d) {
          triggerSelectionHaptic();
          onSelectFormat("3d");
        } else {
          triggerWarningHaptic();
          Alert.alert(
            "3D Structure Unavailable",
            "No 3D structure data available for this compound.",
          );
        }
        return;
      }

      // Format is 2D
      if (is2dLoaded) {
        triggerSelectionHaptic();
        onSelectFormat("2d");
        return;
      }

      if (!is2dAvailable) {
        triggerWarningHaptic();
        Alert.alert(
          "2D Structure Unavailable",
          "No 2D structure data available for this compound.",
        );
        return;
      }

      // Fetch 2D SDF on-demand
      if (isLoading2d) return;

      setIsLoading2d(true);
      try {
        const cidNum = Number(moleculeData.cid);
        const sdf2dText = await fetchSdf(cidNum, false);

        if (sdf2dText) {
          moleculeData.sdf2d = sdf2dText;
          moleculeData.has2d = true;

          saveCachedMolecule(moleculeData).catch(() => {});
          cacheMoleculeInRam(moleculeData.name, moleculeData);

          triggerSelectionHaptic();
          onSelectFormat("2d");
        } else {
          moleculeData.has2d = false;
          triggerWarningHaptic();
          Alert.alert(
            "2D Structure Unavailable",
            "No 2D structure data available for this compound.",
          );
        }
      } catch {
        triggerWarningHaptic();
        Alert.alert(
          "Connection Error",
          "Unable to download 2D structure data. Please check your internet connection.",
        );
      } finally {
        setIsLoading2d(false);
      }
    };

    const handleToggleAnim = () => {
      triggerSelectionHaptic();
      onToggleAnimation();
    };

    const getFormatLabel = (format: "3d" | "2d") => {
      const isAvailable = format === "3d" ? has3d : is2dAvailable;
      const prefix = format.toUpperCase();
      return isAvailable
        ? `${prefix} Structure`
        : `${prefix} Structure (Unavailable)`;
    };

    const getFormatColor = (format: "3d" | "2d") => {
      if (structureFormat === format) return COLORS.primary;
      const isAvailable = format === "3d" ? has3d : is2dAvailable;
      return isAvailable ? COLORS.textSecondary : COLORS.textMuted;
    };

    if (isLandscape) {
      return (
        <View
          style={[
            styles.leftRailColumn,
            isCompact && styles.leftRailColumnCompact,
          ]}
        >
          {/* 3D Structure Button */}
          <TouchableOpacity
            style={[
              styles.leftRailChip,
              isCompact && styles.leftRailChipCompact,
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
              size={isCompact ? 15 : 18}
              color={getFormatColor("3d")}
              style={[
                styles.leftRailIcon,
                isCompact && styles.leftRailIconCompact,
              ]}
            />
            <Text
              allowFontScaling={false}
              numberOfLines={1}
              style={[
                styles.leftRailChipText,
                isCompact && styles.leftRailChipTextCompact,
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
              isCompact && styles.leftRailChipCompact,
              structureFormat === "2d" && styles.leftRailChipActive,
              !is2dAvailable && styles.leftRailChipDisabled,
            ]}
            onPress={() => handlePressFormat("2d")}
            disabled={isLoading2d}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={getFormatLabel("2d")}
            accessibilityState={{
              selected: structureFormat === "2d",
              busy: isLoading2d,
            }}
          >
            {isLoading2d ? (
              <View
                style={[
                  styles.leftRailIndicatorContainer,
                  isCompact && styles.leftRailIndicatorContainerCompact,
                ]}
              >
                <ActivityIndicator
                  size="small"
                  color={COLORS.primary}
                  style={
                    isCompact
                      ? styles.leftRailIndicatorCompact
                      : styles.leftRailIndicator
                  }
                />
              </View>
            ) : (
              <Ionicons
                allowFontScaling={false}
                name={structureFormat === "2d" ? "layers" : "layers-outline"}
                size={isCompact ? 15 : 18}
                color={getFormatColor("2d")}
                style={[
                  styles.leftRailIcon,
                  isCompact && styles.leftRailIconCompact,
                ]}
              />
            )}
            <Text
              allowFontScaling={false}
              numberOfLines={1}
              style={[
                styles.leftRailChipText,
                isCompact && styles.leftRailChipTextCompact,
                structureFormat === "2d" && styles.leftRailChipTextActive,
                !is2dAvailable && styles.leftRailChipTextDisabled,
              ]}
            >
              2D
            </Text>
          </TouchableOpacity>

          {/* Animate Toggle Button */}
          <TouchableOpacity
            style={[
              styles.leftRailChip,
              isCompact && styles.leftRailChipCompact,
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
              size={isCompact ? 15 : 18}
              color={isAnimated ? COLORS.primary : COLORS.textSecondary}
              style={[
                styles.leftRailIcon,
                isCompact && styles.leftRailIconCompact,
              ]}
            />
            <Text
              allowFontScaling={false}
              numberOfLines={1}
              style={[
                styles.leftRailChipText,
                isCompact && styles.leftRailChipTextCompact,
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
          testID="structure-animate-toggle"
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
        <View
          testID="structure-controls-divider"
          style={styles.controlsDivider}
          accessible={false}
          importantForAccessibility="no"
        />
        <View testID="structure-format-badges" style={styles.badgeContainer}>
          <TouchableOpacity
            style={[
              styles.badge,
              is2dAvailable ? null : styles.badgeNotAvailable,
              structureFormat === "2d" && styles.badgeActive,
            ]}
            onPress={() => handlePressFormat("2d")}
            disabled={isLoading2d}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={getFormatLabel("2d")}
            accessibilityState={{
              selected: structureFormat === "2d",
              busy: isLoading2d,
            }}
          >
            {isLoading2d ? (
              <View style={styles.badgeIndicatorContainer}>
                <ActivityIndicator
                  size="small"
                  color={COLORS.primary}
                  style={styles.badgeIndicator}
                />
              </View>
            ) : (
              <Ionicons
                allowFontScaling={false}
                name="layers-outline"
                size={13}
                color={getFormatColor("2d")}
              />
            )}
            <Text
              allowFontScaling={false}
              style={[
                styles.badgeText,
                is2dAvailable ? null : styles.badgeTextNotAvailable,
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
