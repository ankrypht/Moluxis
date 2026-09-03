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
      paddingLeft: hScaleSize(12),
      paddingRight: hScaleSize(6),
      paddingVertical: scaleSize(4),
      borderRadius: scaleSize(12),
      borderWidth: 1,
      borderColor: COLORS.border,
      gap: hScaleSize(8),
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
      paddingHorizontal: hScaleSize(12),
      paddingVertical: scaleSize(8),
      borderRadius: scaleSize(12),
      backgroundColor: addOpacity(COLORS.surfaceElevated, 0.8),
      borderWidth: 1,
      borderColor: COLORS.border,
      justifyContent: "center",
      alignItems: "center",
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
  });

export type StructureControlsStyles = ReturnType<
  typeof getStructureControlsStyles
>;
