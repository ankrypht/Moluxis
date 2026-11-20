import { StyleSheet } from "react-native";
import { COLORS, addOpacity } from "../constants/colors";
import { ScaleMetrics } from "../utils/scaling";

export const getStructureControlsStyles = ({
  insets,
  scaleSize,
  hScaleSize,
}: ScaleMetrics) =>
  StyleSheet.create({
    toggleContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: addOpacity(COLORS.surfaceElevated, 0.8),
      paddingLeft: hScaleSize(10),
      paddingRight: hScaleSize(6),
      paddingVertical: scaleSize(4),
      borderRadius: scaleSize(12),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.border, 0.7),
      gap: hScaleSize(6),
      minHeight: scaleSize(36),
      justifyContent: "center",
    },
    toggleContainerActive: {
      borderColor: addOpacity(COLORS.primary, 0.45),
      backgroundColor: addOpacity(COLORS.surfaceElevated, 0.95),
    },
    badgeContainer: {
      flexDirection: "row",
      gap: hScaleSize(8),
      alignItems: "center",
    },
    controlsDivider: {
      display: "none",
    },
    toggleText: {
      fontSize: scaleSize(13),
      fontWeight: "700",
      color: COLORS.textSecondary,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: hScaleSize(5),
      paddingHorizontal: hScaleSize(11),
      paddingVertical: scaleSize(8),
      borderRadius: scaleSize(12),
      backgroundColor: addOpacity(COLORS.surfaceElevated, 0.8),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.border, 0.7),
      justifyContent: "center",
      minHeight: scaleSize(36),
    },
    badgeActive: {
      backgroundColor: addOpacity(COLORS.primary, 0.2),
      borderColor: COLORS.primary,
    },
    badgeText: {
      fontSize: scaleSize(13),
      fontWeight: "800",
      color: COLORS.textSecondary,
    },
    badgeTextActive: {
      color: COLORS.primary,
    },
    badgeNotAvailable: {
      backgroundColor: "transparent",
      borderColor: COLORS.surfaceElevated,
    },
    badgeTextNotAvailable: {
      color: COLORS.textMuted,
    },
    badgeIndicatorContainer: {
      width: 13,
      height: 13,
      justifyContent: "center",
      alignItems: "center",
    },
    badgeIndicator: {
      transform: [{ scale: 0.65 }],
    },
    switchScale: {
      transform: [{ scale: 0.8 }],
    },

    /* LANDSCAPE LEFT RAIL STYLES */
    leftRailColumn: {
      flexDirection: "column",
      alignItems: "center",
      gap: scaleSize(4),
    },
    leftRailColumnCompact: {
      gap: scaleSize(3),
    },
    leftRailChip: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: scaleSize(7),
      paddingHorizontal: scaleSize(6),
      borderRadius: scaleSize(16),
      minWidth: scaleSize(54),
    },
    leftRailChipCompact: {
      paddingVertical: scaleSize(5),
      paddingHorizontal: scaleSize(3),
      borderRadius: scaleSize(12),
      width: scaleSize(44),
      minWidth: scaleSize(42),
    },
    leftRailChipActive: {
      backgroundColor: addOpacity(COLORS.primary, 0.15),
    },
    leftRailChipDisabled: {
      opacity: 0.45,
    },
    leftRailIcon: {
      marginBottom: scaleSize(2),
    },
    leftRailIconCompact: {
      marginBottom: scaleSize(1),
    },
    leftRailIndicatorContainer: {
      width: scaleSize(18),
      height: scaleSize(18),
      justifyContent: "center",
      alignItems: "center",
      marginBottom: scaleSize(2),
    },
    leftRailIndicatorContainerCompact: {
      width: scaleSize(15),
      height: scaleSize(15),
      marginBottom: scaleSize(1),
    },
    leftRailIndicator: {
      transform: [{ scale: 0.75 }],
    },
    leftRailIndicatorCompact: {
      transform: [{ scale: 0.6 }],
    },
    leftRailChipText: {
      fontSize: scaleSize(9.5),
      fontWeight: "700",
      color: COLORS.textSecondary,
      letterSpacing: 0.2,
    },
    leftRailChipTextCompact: {
      fontSize: scaleSize(8.5),
    },
    leftRailChipTextActive: {
      color: COLORS.primary,
      fontWeight: "800",
    },
    leftRailChipTextDisabled: {
      color: COLORS.textMuted,
    },
  });

export type StructureControlsStyles = ReturnType<
  typeof getStructureControlsStyles
>;
