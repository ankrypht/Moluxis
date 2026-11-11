import { StyleSheet } from "react-native";
import { COLORS, addOpacity } from "../constants/colors";
import { ScaleMetrics } from "../utils/scaling";

export const getStructureControlsStyles = ({
  isLandscape,
  insets,
  scaleSize,
  hScaleSize,
}: ScaleMetrics) =>
  StyleSheet.create({
    toggleContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: addOpacity(COLORS.surfaceElevated, 0.8),
      paddingLeft: isLandscape ? hScaleSize(6) : hScaleSize(10),
      paddingRight: isLandscape ? hScaleSize(4) : hScaleSize(6),
      paddingVertical: isLandscape ? scaleSize(3) : scaleSize(4),
      borderRadius: scaleSize(12),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.border, 0.7),
      gap: isLandscape ? hScaleSize(4) : hScaleSize(6),
    },
    toggleContainerActive: {
      borderColor: addOpacity(COLORS.primary, 0.45),
      backgroundColor: addOpacity(COLORS.surfaceElevated, 0.95),
    },
    badgeContainer: {
      flexDirection: "row",
      gap: isLandscape ? hScaleSize(5) : hScaleSize(8),
    },
    toggleText: {
      fontSize: isLandscape ? scaleSize(11) : scaleSize(13),
      fontWeight: "700",
      color: COLORS.textSecondary,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: isLandscape ? hScaleSize(4) : hScaleSize(5),
      paddingHorizontal: isLandscape ? hScaleSize(8) : hScaleSize(11),
      paddingVertical: isLandscape ? scaleSize(6) : scaleSize(8),
      borderRadius: scaleSize(12),
      backgroundColor: addOpacity(COLORS.surfaceElevated, 0.8),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.border, 0.7),
      justifyContent: "center",
    },
    badgeActive: {
      backgroundColor: addOpacity(COLORS.primary, 0.2),
      borderColor: COLORS.primary,
    },
    badgeText: {
      fontSize: isLandscape ? scaleSize(11) : scaleSize(13),
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
    switchScale: {
      transform: [{ scale: isLandscape ? 0.72 : 0.8 }],
    },

    /* LANDSCAPE LEFT RAIL STYLES */
    floatingLeftRailContainer: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: Math.max(insets.left, scaleSize(20)) + scaleSize(16),
      zIndex: 50,
      justifyContent: "center",
      alignItems: "flex-start",
    },
    floatingLeftRail: {
      flexDirection: "column",
      backgroundColor: addOpacity(COLORS.surface, 0.88),
      borderRadius: scaleSize(22),
      padding: scaleSize(5),
      borderWidth: 1,
      borderColor: COLORS.surfaceElevated,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
      alignItems: "center",
      width: "auto",
      maxWidth: scaleSize(72),
    },
    leftRailColumn: {
      flexDirection: "column",
      alignItems: "center",
      gap: scaleSize(4),
    },
    leftRailChip: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: scaleSize(7),
      paddingHorizontal: scaleSize(6),
      borderRadius: scaleSize(16),
      minWidth: scaleSize(54),
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
    leftRailChipText: {
      fontSize: scaleSize(9.5),
      fontWeight: "700",
      color: COLORS.textSecondary,
      letterSpacing: 0.2,
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
