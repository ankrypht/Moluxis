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
    dock: {
      flexDirection: "row",
      backgroundColor: addOpacity(COLORS.surface, 0.85),
      borderRadius: scaleSize(32),
      padding: scaleSize(5),
      borderWidth: 1,
      borderColor: COLORS.surfaceElevated,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
      maxWidth: isLandscape ? "70%" : "90%",
    },
    dockCompact: {
      maxWidth: "90%",
      padding: scaleSize(5),
      borderRadius: scaleSize(26),
    },
    styleMenu: {
      position: "absolute",
      bottom: scaleSize(80),
      backgroundColor: addOpacity(COLORS.surface, 0.95),
      borderRadius: scaleSize(20),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.border, 0.7),
      padding: scaleSize(6),
      zIndex: 999,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 12,
      minWidth: scaleSize(210),
    },
    styleMenuLandscape: {
      bottom: scaleSize(65),
    },
    styleMenuCompact: {
      minWidth: scaleSize(190),
    },
    styleMenuHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: hScaleSize(6),
      paddingHorizontal: hScaleSize(10),
      paddingTop: scaleSize(6),
      paddingBottom: scaleSize(6),
      borderBottomWidth: 1,
      borderBottomColor: addOpacity(COLORS.border, 0.4),
      marginBottom: scaleSize(2),
    },
    styleMenuTitle: {
      fontSize: scaleSize(10),
      fontWeight: "800",
      color: COLORS.textMuted,
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    styleMenuItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: hScaleSize(10),
      paddingVertical: scaleSize(8),
      borderRadius: scaleSize(12),
      backgroundColor: "transparent",
      marginVertical: scaleSize(2),
      borderWidth: 1,
      borderColor: "transparent",
    },
    styleMenuItemActive: {
      backgroundColor: addOpacity(COLORS.primary, 0.12),
      borderColor: addOpacity(COLORS.primary, 0.35),
    },
    styleMenuItemLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: hScaleSize(10),
    },
    styleMenuIconBadge: {
      width: scaleSize(26),
      height: scaleSize(26),
      borderRadius: scaleSize(8),
      justifyContent: "center",
      alignItems: "center",
    },
    styleMenuItemText: {
      fontSize: scaleSize(13),
      fontWeight: "600",
      color: COLORS.textSecondary,
    },
    styleMenuItemTextActive: {
      color: COLORS.textPrimary,
      fontWeight: "700",
    },
    dockScroll: {
      paddingHorizontal: scaleSize(4),
      gap: isLandscape ? hScaleSize(4) : hScaleSize(2),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      flexGrow: 1,
    },
    dockScrollCompact: {
      paddingHorizontal: scaleSize(2),
      gap: scaleSize(2),
    },
    dockIcon: {
      marginRight: 4,
    },
    dockIconCompact: {
      marginRight: 3,
    },
    dockChip: {
      paddingHorizontal: isLandscape ? hScaleSize(12) : hScaleSize(10),
      paddingVertical: scaleSize(8),
      borderRadius: scaleSize(24),
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: "transparent",
      flexDirection: "row",
      alignItems: "center",
    },
    dockChipCompact: {
      paddingHorizontal: scaleSize(7),
      paddingVertical: scaleSize(6),
      borderRadius: scaleSize(18),
    },
    dockChipActive: {
      backgroundColor: addOpacity(COLORS.primary, 0.2),
      borderColor: addOpacity(COLORS.primary, 0.5),
    },
    dockChipText: {
      fontSize: scaleSize(13),
      fontWeight: "700",
      color: COLORS.textSecondary,
    },
    dockChipTextCompact: {
      fontSize: scaleSize(12),
    },
    dockChipTextActive: {
      color: COLORS.primary,
    },
    infoIcon: {
      fontSize: scaleSize(18),
    },
  });

export type FloatingDockStyles = ReturnType<typeof getFloatingDockStyles>;
