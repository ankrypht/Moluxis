import { StyleSheet } from "react-native";
import { COLORS } from "./src/constants/colors";
import { createFloatingIslandStyle } from "./src/constants/theme";
import { getScaleMetrics, Insets } from "./src/utils/scaling";

export const getStyles = (width: number, height: number, insets: Insets) => {
  const metrics = getScaleMetrics(width, height, insets);
  const { scaleSize } = metrics;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
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
      ...createFloatingIslandStyle({
        scaleSize,
        bgOpacity: 0.88,
        borderRadius: 22,
        padding: 5,
        shadowPreset: "island",
      }),
      alignItems: "center",
      width: "auto",
      maxWidth: scaleSize(72),
    },
    floatingLeftRailCompact: {
      borderRadius: scaleSize(18),
      padding: scaleSize(4),
      maxWidth: scaleSize(62),
    },
  });
};

export type AppStyles = ReturnType<typeof getStyles>;
