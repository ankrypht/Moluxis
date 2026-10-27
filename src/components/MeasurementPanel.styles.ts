import { StyleSheet } from "react-native";
import { COLORS, addOpacity } from "../constants/colors";
import { ScaleMetrics } from "../utils/scaling";

export const getMeasurementPanelStyles = ({
  width,
  isLandscape,
  insets,
  scaleSize,
  hScaleSize,
}: ScaleMetrics) =>
  StyleSheet.create({
    measurementPanelContainer: {
      position: "absolute",
      bottom: isLandscape
        ? Math.max(insets.bottom, scaleSize(8)) + scaleSize(56)
        : insets.bottom + scaleSize(74),
      left: isLandscape
        ? undefined
        : Math.max(scaleSize(16), Math.round((width - scaleSize(400)) / 2)),
      right: isLandscape
        ? insets.right + scaleSize(16)
        : Math.max(scaleSize(16), Math.round((width - scaleSize(400)) / 2)),
      width: isLandscape ? scaleSize(335) : undefined,
      maxWidth: isLandscape ? scaleSize(360) : scaleSize(400),
      backgroundColor: addOpacity(COLORS.surface, 0.95),
      borderRadius: isLandscape ? scaleSize(16) : scaleSize(20),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.border, 0.7),
      padding: isLandscape ? scaleSize(8) : scaleSize(12),
      zIndex: 140,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 14,
      elevation: 10,
    },
    measurementHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      marginBottom: isLandscape ? scaleSize(4) : scaleSize(8),
    },
    measurementModeTabs: {
      flexDirection: "row",
      alignItems: "center",
      gap: isLandscape ? hScaleSize(2) : hScaleSize(4),
      backgroundColor: addOpacity(COLORS.surfaceElevated, 0.6),
      borderRadius: scaleSize(12),
      padding: scaleSize(3),
      flexShrink: 1,
    },
    measurementModeTab: {
      flexDirection: "row",
      alignItems: "center",
      gap: isLandscape ? 3 : hScaleSize(4),
      paddingHorizontal: isLandscape ? scaleSize(6) : hScaleSize(8),
      paddingVertical: isLandscape ? scaleSize(3) : scaleSize(5),
      borderRadius: scaleSize(9),
    },
    measurementModeTabActive: {
      backgroundColor: addOpacity(COLORS.primary, 0.22),
    },
    measurementModeTabText: {
      fontSize: scaleSize(11),
      fontWeight: "600",
      color: COLORS.textMuted,
    },
    measurementModeTabTextActive: {
      color: COLORS.primary,
      fontWeight: "700",
    },
    measurementCloseButton: {
      width: scaleSize(26),
      height: scaleSize(26),
      borderRadius: scaleSize(13),
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: addOpacity(COLORS.surfaceElevated, 0.5),
      flexShrink: 0,
      marginLeft: scaleSize(6),
    },
    measurementStatusPrompt: {
      fontSize: isLandscape ? scaleSize(10) : scaleSize(11),
      color: COLORS.textSecondary,
      marginBottom: isLandscape ? scaleSize(4) : scaleSize(8),
      fontWeight: "500",
    },
    measurementAtomSlotsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: isLandscape ? hScaleSize(4) : scaleSize(4),
      marginBottom: isLandscape ? scaleSize(5) : scaleSize(8),
      flexWrap: "wrap",
    },
    measurementAtomPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: isLandscape ? 3 : scaleSize(4),
      backgroundColor: addOpacity(COLORS.surfaceElevated, 0.8),
      borderRadius: scaleSize(10),
      paddingHorizontal: isLandscape ? scaleSize(6) : scaleSize(6),
      paddingVertical: scaleSize(4),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.border, 0.5),
    },
    measurementAtomPillEmpty: {
      borderStyle: "dashed",
      borderColor: addOpacity(COLORS.textMuted, 0.4),
      backgroundColor: "transparent",
    },
    measurementAtomIndexBadge: {
      width: scaleSize(16),
      height: scaleSize(16),
      borderRadius: scaleSize(8),
      backgroundColor: addOpacity(COLORS.primary, 0.2),
      justifyContent: "center",
      alignItems: "center",
    },
    measurementAtomIndexText: {
      fontSize: scaleSize(9),
      fontWeight: "700",
      color: COLORS.primary,
    },
    measurementAtomElemText: {
      fontSize: scaleSize(12),
      fontWeight: "700",
      color: COLORS.textPrimary,
    },
    measurementAtomSerialText: {
      fontSize: scaleSize(10),
      color: COLORS.textMuted,
    },
    measurementAtomRemoveIcon: {
      marginLeft: hScaleSize(2),
    },
    measurementEmptySlotText: {
      fontSize: scaleSize(11),
      color: COLORS.textMuted,
      fontStyle: "italic",
    },
    measurementResultCard: {
      backgroundColor: addOpacity(COLORS.emerald, 0.1),
      borderColor: addOpacity(COLORS.emerald, 0.35),
      borderWidth: 1,
      borderRadius: scaleSize(12),
      padding: isLandscape ? scaleSize(6) : scaleSize(10),
      marginBottom: isLandscape ? scaleSize(4) : scaleSize(8),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    measurementResultLeft: {
      flex: 1,
    },
    measurementResultDesignation: {
      fontSize: isLandscape ? scaleSize(11) : scaleSize(12),
      fontWeight: "600",
      color: COLORS.textSecondary,
      marginBottom: scaleSize(2),
    },
    measurementResultValue: {
      fontSize: isLandscape ? scaleSize(16) : scaleSize(19),
      fontWeight: "800",
      color: COLORS.emerald,
      letterSpacing: -0.4,
    },
    measurementResultBadge: {
      backgroundColor: addOpacity(COLORS.emerald, 0.18),
      paddingHorizontal: hScaleSize(8),
      paddingVertical: scaleSize(4),
      borderRadius: scaleSize(8),
    },
    measurementResultBadgeText: {
      fontSize: scaleSize(10),
      fontWeight: "700",
      color: COLORS.emerald,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    measurementFooterActions: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: hScaleSize(8),
      marginTop: scaleSize(2),
    },
    measurementClearButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: hScaleSize(4),
      paddingHorizontal: hScaleSize(10),
      paddingVertical: scaleSize(6),
      borderRadius: scaleSize(10),
      backgroundColor: addOpacity(COLORS.surfaceElevated, 0.7),
    },
    measurementClearButtonText: {
      fontSize: scaleSize(11),
      fontWeight: "600",
      color: COLORS.textSecondary,
    },
    measurementDoneButton: {
      paddingHorizontal: hScaleSize(14),
      paddingVertical: scaleSize(6),
      borderRadius: scaleSize(10),
      backgroundColor: COLORS.primary,
    },
    measurementDoneButtonText: {
      fontSize: scaleSize(11),
      fontWeight: "700",
      color: COLORS.textOnPrimary,
    },
  });

export type MeasurementPanelStyles = ReturnType<
  typeof getMeasurementPanelStyles
>;
