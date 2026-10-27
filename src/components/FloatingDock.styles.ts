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
      backgroundColor: addOpacity(COLORS.surface, 0.88),
      borderRadius: scaleSize(32),
      padding: scaleSize(5),
      borderWidth: 1,
      borderColor: COLORS.surfaceElevated,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
      width: isLandscape ? "90%" : "94%",
      maxWidth: isLandscape ? scaleSize(540) : scaleSize(390),
    },
    dockCompact: {
      width: "92%",
      maxWidth: scaleSize(440),
      padding: scaleSize(4),
      borderRadius: scaleSize(26),
    },
    dockBackdrop: {
      position: "absolute",
      top: -3000,
      bottom: -1000,
      left: -3000,
      right: -3000,
      backgroundColor: "transparent",
    },
    displayOptionsMenu: {
      position: "absolute",
      bottom: isLandscape
        ? Math.max(insets.bottom, scaleSize(8)) + scaleSize(56)
        : insets.bottom + scaleSize(74),
      backgroundColor: addOpacity(COLORS.surface, 0.96),
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
      minWidth: scaleSize(230),
    },
    displayOptionsMenuLandscape: {
      bottom: Math.max(insets.bottom, scaleSize(8)) + scaleSize(56),
      minWidth: scaleSize(340),
      maxWidth: scaleSize(380),
      padding: scaleSize(6),
    },
    displayOptionsMenuCompact: {
      minWidth: scaleSize(320),
    },
    displayOptionsGridLandscape: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    displayOptionsItemLandscape: {
      width: "48.5%",
      paddingVertical: scaleSize(6),
      paddingHorizontal: hScaleSize(8),
      marginVertical: scaleSize(2),
    },
    displayOptionsHeader: {
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
    displayOptionsTitle: {
      fontSize: scaleSize(10),
      fontWeight: "800",
      color: COLORS.textMuted,
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    displayOptionsDivider: {
      height: 1,
      backgroundColor: addOpacity(COLORS.border, 0.4),
      marginVertical: scaleSize(4),
      marginHorizontal: hScaleSize(6),
    },
    displayOptionsSubHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: hScaleSize(5),
      paddingHorizontal: hScaleSize(10),
      paddingTop: scaleSize(4),
      paddingBottom: scaleSize(4),
    },
    displayOptionsSubTitle: {
      fontSize: scaleSize(10),
      fontWeight: "800",
      color: COLORS.textMuted,
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    displayOptionsItem: {
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
    displayOptionsItemActive: {
      backgroundColor: addOpacity(COLORS.primary, 0.12),
      borderColor: addOpacity(COLORS.primary, 0.35),
    },
    displayOptionsItemLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: hScaleSize(10),
    },
    displayOptionsIconBadge: {
      width: scaleSize(26),
      height: scaleSize(26),
      borderRadius: scaleSize(8),
      justifyContent: "center",
      alignItems: "center",
    },
    displayOptionsItemText: {
      fontSize: scaleSize(13),
      fontWeight: "600",
      color: COLORS.textSecondary,
    },
    displayOptionsItemTextActive: {
      color: COLORS.textPrimary,
      fontWeight: "700",
    },

    displayToggleBadge: {
      paddingHorizontal: hScaleSize(8),
      paddingVertical: scaleSize(3),
      borderRadius: scaleSize(8),
      backgroundColor: addOpacity(COLORS.surfaceElevated, 0.8),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.border, 0.5),
    },
    displayToggleBadgeActive: {
      backgroundColor: addOpacity(COLORS.primary, 0.2),
      borderColor: addOpacity(COLORS.primary, 0.4),
    },
    displayToggleBadgeText: {
      fontSize: scaleSize(10),
      fontWeight: "700",
      color: COLORS.textMuted,
    },
    displayToggleBadgeTextActive: {
      color: COLORS.primary,
      fontWeight: "800",
    },
    dockRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      paddingHorizontal: isLandscape ? scaleSize(8) : scaleSize(4),
    },
    dockRowCompact: {
      width: "100%",
      paddingHorizontal: scaleSize(4),
    },
    dockIcon: {
      marginRight: 4,
    },
    dockIconCompact: {
      marginRight: 3,
    },
    dockChip: {
      paddingHorizontal: isLandscape ? scaleSize(14) : scaleSize(8),
      paddingVertical: isLandscape ? scaleSize(8) : scaleSize(7),
      borderRadius: scaleSize(24),
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: "transparent",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    dockChipCompact: {
      paddingHorizontal: scaleSize(8),
      paddingVertical: scaleSize(6),
      borderRadius: scaleSize(18),
    },
    dockChipActive: {
      backgroundColor: addOpacity(COLORS.primary, 0.2),
      borderColor: addOpacity(COLORS.primary, 0.5),
    },
    dockChipText: {
      fontSize: isLandscape ? scaleSize(13) : scaleSize(12),
      fontWeight: "700",
      color: COLORS.textSecondary,
    },
    dockChipTextCompact: {
      fontSize: scaleSize(11),
    },
    dockChipTextActive: {
      color: COLORS.primary,
    },
    infoIcon: {
      fontSize: isLandscape ? scaleSize(18) : scaleSize(17),
    },
  });

export type FloatingDockStyles = ReturnType<typeof getFloatingDockStyles>;
