import { StyleSheet } from "react-native";
import { COLORS, addOpacity } from "../constants/colors";
import { ScaleMetrics } from "../utils/scaling";

export const getFloatingDockStyles = ({
  isLandscape,
  insets,
  scaleSize,
  hScaleSize,
}: ScaleMetrics) =>
  StyleSheet.create({
    floatingDockContainer: {
      position: "absolute",
      bottom: 0,
      left: isLandscape ? insets.left : 0,
      right: isLandscape ? insets.right : 0,
      zIndex: 50,
      alignItems: "center",
      paddingBottom: isLandscape
        ? Math.max(insets.bottom, scaleSize(12))
        : insets.bottom + scaleSize(16),
    },
    floatingDockLandscape: {
      paddingBottom: scaleSize(12),
    },
    dock: {
      flexDirection: "row",
      backgroundColor: addOpacity(COLORS.surface, 0.85),
      borderRadius: scaleSize(32),
      padding: scaleSize(6),
      borderWidth: 1,
      borderColor: COLORS.surfaceElevated,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
      maxWidth: "90%",
      overflow: "hidden",
    },
    styleMenu: {
      position: "absolute",
      bottom: scaleSize(80),
      backgroundColor: addOpacity(COLORS.surface, 0.95),
      borderRadius: scaleSize(20),
      borderWidth: 1,
      borderColor: COLORS.surfaceElevated,
      padding: scaleSize(6),
      zIndex: 999,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 12,
      minWidth: scaleSize(180),
    },
    styleMenuItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: hScaleSize(16),
      paddingVertical: scaleSize(12),
      borderRadius: scaleSize(14),
      backgroundColor: "transparent",
    },
    styleMenuItemActive: {
      backgroundColor: addOpacity(COLORS.primary, 0.15),
    },
    styleMenuItemText: {
      fontSize: scaleSize(14),
      fontWeight: "600",
      color: COLORS.textSecondary,
    },
    styleMenuItemTextActive: {
      color: COLORS.primary,
      fontWeight: "700",
    },
    dockLandscape: {},
    dockScroll: {
      paddingHorizontal: scaleSize(4),
      gap: isLandscape ? hScaleSize(4) : hScaleSize(2),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      flexGrow: 1,
    },
    dockScrollLandscape: {},
    dockChip: {
      paddingHorizontal: isLandscape ? hScaleSize(16) : hScaleSize(8),
      paddingVertical: scaleSize(10),
      borderRadius: scaleSize(24),
      backgroundColor: "transparent",
      flexDirection: "row",
      alignItems: "center",
    },
    dockChipActive: {
      backgroundColor: COLORS.primary,
    },
    dockChipText: {
      fontSize: scaleSize(13),
      fontWeight: "700",
      color: COLORS.textSecondary,
    },
    dockChipTextActive: {
      color: COLORS.textOnPrimary,
    },
    infoIcon: {
      fontSize: scaleSize(18),
    },
  });

export type FloatingDockStyles = ReturnType<typeof getFloatingDockStyles>;
