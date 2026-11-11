import { StyleSheet } from "react-native";
import { COLORS, addOpacity } from "../constants/colors";
import { ScaleMetrics } from "../utils/scaling";

export const getMeasurementPanelStyles = ({
  isLandscape,
  insets,
  scaleSize,
  hScaleSize,
}: ScaleMetrics) => {
  return StyleSheet.create({
    measurementPanelWrapper: {
      position: "absolute",
      zIndex: 140,
      ...(isLandscape
        ? {
            top: 0,
            bottom: 0,
            right: 0,
            width: scaleSize(260) + Math.max(insets.right, scaleSize(12)),
          }
        : {
            bottom: 0,
            left: 0,
            right: 0,
          }),
    },
    measurementPanelContainer: {
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: addOpacity(COLORS.border, 0.7),
      elevation: 0,
      ...(isLandscape
        ? {
            flex: 1,
            borderTopLeftRadius: scaleSize(20),
            borderBottomLeftRadius: scaleSize(20),
            marginVertical: -1,
            marginRight: -1,
            paddingTop: Math.max(insets.top, scaleSize(12)) + scaleSize(2),
            paddingBottom:
              Math.max(insets.bottom, scaleSize(12)) + scaleSize(4),
            paddingRight: Math.max(insets.right, scaleSize(14)),
            paddingLeft: scaleSize(12),
            justifyContent: "space-between",
          }
        : {
            borderTopLeftRadius: scaleSize(22),
            borderTopRightRadius: scaleSize(22),
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            marginHorizontal: -1,
            marginBottom: -1,
            paddingHorizontal: scaleSize(16),
            paddingTop: scaleSize(14),
            paddingBottom:
              Math.max(insets.bottom, scaleSize(12)) + scaleSize(8),
          }),
    },
    measurementTopSection: {
      width: "100%",
    },
    measurementTopScroll: {
      width: "100%",
      flexGrow: 0,
      flexShrink: 1,
    },
    measurementLandscapeHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      marginBottom: scaleSize(8),
    },
    measurementLandscapeTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scaleSize(6),
    },
    measurementLandscapeTitle: {
      fontSize: scaleSize(14),
      fontWeight: "800",
      color: COLORS.textPrimary,
      letterSpacing: 0.3,
    },
    measurementHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      marginBottom: scaleSize(10),
      gap: scaleSize(8),
    },
    measurementModeTabs: {
      ...(isLandscape
        ? { width: "100%" }
        : { flex: 1, minWidth: 0, flexShrink: 1 }),
      flexDirection: "row",
      alignItems: "center",
      gap: scaleSize(3),
      backgroundColor: addOpacity(COLORS.surfaceElevated, 0.75),
      borderRadius: scaleSize(12),
      padding: scaleSize(3),
      marginBottom: isLandscape ? scaleSize(8) : 0,
    },
    measurementModeTab: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: isLandscape ? 3 : 4,
      paddingHorizontal: scaleSize(4),
      paddingVertical: isLandscape ? scaleSize(6) : scaleSize(7),
      borderRadius: scaleSize(9),
    },
    measurementModeTabActive: {
      backgroundColor: addOpacity(COLORS.primary, 0.22),
    },
    measurementModeTabText: {
      fontSize: isLandscape ? scaleSize(11) : scaleSize(12),
      fontWeight: "600",
      color: COLORS.textMuted,
      flexShrink: 1,
    },
    measurementModeTabTextActive: {
      color: COLORS.primary,
      fontWeight: "800",
    },
    measurementCloseButton: {
      width: scaleSize(32),
      height: scaleSize(32),
      borderRadius: scaleSize(16),
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: addOpacity(COLORS.danger, 0.14),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.danger, 0.35),
      flexShrink: 0,
    },
    measurementStatusPrompt: {
      fontSize: isLandscape ? scaleSize(11) : scaleSize(13),
      color: COLORS.textSecondary,
      marginBottom: isLandscape ? scaleSize(6) : scaleSize(10),
      fontWeight: "600",
      lineHeight: isLandscape ? scaleSize(15) : scaleSize(18),
    },
    measurementAtomSlotsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: isLandscape ? hScaleSize(5) : scaleSize(7),
      marginBottom: isLandscape ? scaleSize(6) : scaleSize(10),
      flexWrap: "wrap",
    },
    measurementAtomPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: isLandscape ? 4 : scaleSize(5),
      backgroundColor: addOpacity(COLORS.surfaceElevated, 0.85),
      borderRadius: scaleSize(12),
      paddingHorizontal: isLandscape ? scaleSize(8) : scaleSize(10),
      paddingVertical: isLandscape ? scaleSize(5) : scaleSize(6),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.border, 0.55),
    },
    measurementAtomPillEmpty: {
      borderStyle: "dashed",
      borderColor: addOpacity(COLORS.textMuted, 0.45),
      backgroundColor: "transparent",
    },
    measurementAtomIndexBadge: {
      width: isLandscape ? scaleSize(18) : scaleSize(20),
      height: isLandscape ? scaleSize(18) : scaleSize(20),
      borderRadius: isLandscape ? scaleSize(9) : scaleSize(10),
      backgroundColor: addOpacity(COLORS.primary, 0.22),
      justifyContent: "center",
      alignItems: "center",
    },
    measurementAtomIndexText: {
      fontSize: isLandscape ? scaleSize(10) : scaleSize(11),
      fontWeight: "800",
      color: COLORS.primary,
    },
    measurementAtomElemText: {
      fontSize: isLandscape ? scaleSize(13) : scaleSize(14),
      fontWeight: "800",
      color: COLORS.textPrimary,
    },
    measurementAtomRemoveIcon: {
      marginLeft: hScaleSize(3),
    },
    measurementEmptySlotText: {
      fontSize: isLandscape ? scaleSize(12) : scaleSize(13),
      color: COLORS.textMuted,
      fontStyle: "italic",
      fontWeight: "500",
    },
    measurementResultCard: {
      backgroundColor: addOpacity(COLORS.emerald, 0.1),
      borderColor: addOpacity(COLORS.emerald, 0.35),
      borderWidth: 1,
      borderRadius: scaleSize(14),
      padding: isLandscape ? scaleSize(8) : scaleSize(12),
      marginBottom: isLandscape ? scaleSize(6) : scaleSize(10),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    measurementResultLeft: {
      flex: 1,
    },
    measurementResultDesignation: {
      fontSize: isLandscape ? scaleSize(12) : scaleSize(13),
      fontWeight: "600",
      color: COLORS.textSecondary,
      marginBottom: scaleSize(2),
    },
    measurementResultValue: {
      fontSize: isLandscape ? scaleSize(18) : scaleSize(22),
      fontWeight: "900",
      color: COLORS.emerald,
      letterSpacing: -0.4,
    },
    measurementResultBadge: {
      backgroundColor: addOpacity(COLORS.emerald, 0.18),
      paddingHorizontal: hScaleSize(10),
      paddingVertical: scaleSize(5),
      borderRadius: scaleSize(8),
    },
    measurementResultBadgeText: {
      fontSize: isLandscape ? scaleSize(10) : scaleSize(11),
      fontWeight: "800",
      color: COLORS.emerald,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    measurementFooterActions: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: hScaleSize(10),
      marginTop: isLandscape ? scaleSize(6) : scaleSize(6),
    },
    measurementClearButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: hScaleSize(5),
      paddingHorizontal: hScaleSize(14),
      paddingVertical: scaleSize(8),
      borderRadius: scaleSize(11),
      backgroundColor: addOpacity(COLORS.danger, 0.14),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.danger, 0.35),
    },
    measurementClearButtonText: {
      fontSize: isLandscape ? scaleSize(12) : scaleSize(13),
      fontWeight: "700",
      color: COLORS.danger,
    },
    measurementDoneButton: {
      paddingHorizontal: hScaleSize(20),
      paddingVertical: scaleSize(8),
      borderRadius: scaleSize(11),
      backgroundColor: COLORS.primary,
    },
    measurementDoneButtonText: {
      fontSize: isLandscape ? scaleSize(12) : scaleSize(13),
      fontWeight: "800",
      color: COLORS.textOnPrimary,
    },
  });
};

export type MeasurementPanelStyles = ReturnType<
  typeof getMeasurementPanelStyles
>;
