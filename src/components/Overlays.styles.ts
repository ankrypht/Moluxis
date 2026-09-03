import { StyleSheet } from "react-native";
import { COLORS, addOpacity } from "../constants/colors";
import { ScaleMetrics } from "../utils/scaling";

export const getOverlaysStyles = ({
  isLandscape,
  insets,
  scaleSize,
  hScaleSize,
}: ScaleMetrics) =>
  StyleSheet.create({
    landscapeNameOverlay: {
      position: "absolute",
      bottom: isLandscape
        ? Math.max(insets.bottom, scaleSize(12)) + scaleSize(64)
        : scaleSize(80),
      left: isLandscape ? insets.left : 0,
      right: isLandscape ? insets.right : 0,
      paddingHorizontal: hScaleSize(32),
      alignItems: "center",
      zIndex: 10,
    },
    landscapeNameText: {
      color: COLORS.textSecondary,
      fontSize: scaleSize(14),
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 2,
      textAlign: "center",
    },
    exitFullScreenButton: {
      position: "absolute",
      top: isLandscape
        ? Math.max(insets.top, scaleSize(16))
        : insets.top + scaleSize(16),
      right: isLandscape
        ? Math.max(insets.right, scaleSize(16))
        : scaleSize(16),
      backgroundColor: addOpacity(COLORS.surface, 0.85),
      borderRadius: scaleSize(24),
      width: scaleSize(48),
      height: scaleSize(48),
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: COLORS.surfaceElevated,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
      zIndex: 300,
    },
  });

export type OverlaysStyles = ReturnType<typeof getOverlaysStyles>;
