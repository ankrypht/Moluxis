import { StyleSheet } from "react-native";
import { COLORS, addOpacity } from "../constants/colors";
import { ScaleMetrics } from "../utils/scaling";

export const getStructureControlsStyles = ({
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
    },
    toggleContainerActive: {
      borderColor: addOpacity(COLORS.primary, 0.45),
      backgroundColor: addOpacity(COLORS.surfaceElevated, 0.95),
    },
    badgeContainer: {
      flexDirection: "row",
      gap: hScaleSize(8),
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
    switchScale: {
      transform: [{ scale: 0.8 }],
    },
  });

export type StructureControlsStyles = ReturnType<
  typeof getStructureControlsStyles
>;
