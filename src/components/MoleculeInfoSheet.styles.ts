import { StyleSheet } from "react-native";
import { COLORS, addOpacity } from "../constants/colors";
import { ScaleMetrics } from "../utils/scaling";

export const getMoleculeInfoSheetStyles = ({
  isLandscape,
  insets,
  scaleSize,
  hScaleSize,
}: ScaleMetrics) =>
  StyleSheet.create({
    bottomSheet: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: COLORS.surface,
      borderTopLeftRadius: scaleSize(32),
      borderTopRightRadius: scaleSize(32),
      borderWidth: 1,
      borderColor: COLORS.border,
      zIndex: 200,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: -10 },
      shadowOpacity: 0.4,
      shadowRadius: 24,
      elevation: 20,
    },
    bottomSheetLandscape: {
      top: 0,
      bottom: 0,
      right: 0,
      left: "55%", // Take up right 45%
      borderTopLeftRadius: scaleSize(32),
      borderBottomLeftRadius: scaleSize(32),
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    },
    sheetHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: scaleSize(24),
      paddingTop: isLandscape
        ? Math.max(insets.top, scaleSize(16))
        : scaleSize(20),
      paddingBottom: scaleSize(14),
      borderBottomWidth: 1,
      borderBottomColor: addOpacity(COLORS.surfaceElevated, 0.8),
      zIndex: 10,
    },
    moleculeName: {
      fontSize: scaleSize(20),
      fontWeight: "900",
      color: COLORS.textPrimary,
      letterSpacing: 1,
      flex: 1,
      marginRight: scaleSize(12),
      lineHeight: scaleSize(26),
    },
    closeButtonInline: {
      width: scaleSize(38),
      height: scaleSize(38),
      borderRadius: scaleSize(19),
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: addOpacity(COLORS.surfaceElevated, 0.8),
      zIndex: 20,
    },
    infoScroll: {
      paddingHorizontal: scaleSize(24),
      paddingTop: scaleSize(16),
      paddingBottom: scaleSize(40),
    },
    statsGrid: {
      flexDirection: "row",
      gap: hScaleSize(16),
      marginBottom: scaleSize(20),
    },
    statCard: {
      flex: 1,
      backgroundColor: COLORS.surfaceElevated,
      borderRadius: scaleSize(16),
      padding: scaleSize(16),
      borderWidth: 1,
      borderColor: COLORS.border,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    statLabel: {
      fontSize: scaleSize(13),
      color: COLORS.textSecondary,
      marginBottom: scaleSize(6),
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    statValue: {
      fontSize: scaleSize(18),
      color: COLORS.textPrimary,
      fontWeight: "800",
    },
    noDataText: {
      fontSize: scaleSize(14),
      color: COLORS.textMuted,
      fontStyle: "italic",
      textAlign: "center",
      paddingVertical: scaleSize(16),
    },
    safetySection: {
      marginBottom: scaleSize(20),
      backgroundColor: addOpacity(COLORS.danger, 0.05),
      padding: scaleSize(12),
      borderRadius: scaleSize(12),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.danger, 0.2),
    },
    safetyLabel: {
      fontSize: scaleSize(15),
      fontWeight: "800",
      color: COLORS.danger,
      marginBottom: scaleSize(8),
    },
    safetyText: {
      fontSize: scaleSize(14),
      color: COLORS.textSecondary,
      marginBottom: scaleSize(6),
      lineHeight: scaleSize(22),
    },
    hazardText: {
      fontSize: scaleSize(14),
      color: COLORS.warning,
      marginBottom: scaleSize(6),
      lineHeight: scaleSize(22),
      fontWeight: "500",
    },
    warningText: {
      fontSize: scaleSize(14),
      color: COLORS.danger,
      marginBottom: scaleSize(6),
      lineHeight: scaleSize(22),
      fontWeight: "600",
    },
    descriptionText: {
      fontSize: scaleSize(15),
      lineHeight: scaleSize(24),
      color: COLORS.textSecondary,
      fontWeight: "400",
    },
    synonymsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: hScaleSize(10),
    },
    synonymChip: {
      backgroundColor: COLORS.surfaceElevated,
      paddingHorizontal: hScaleSize(14),
      paddingVertical: scaleSize(8),
      borderRadius: scaleSize(20),
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    synonymText: {
      fontSize: scaleSize(14),
      color: COLORS.textSecondary,
      fontWeight: "500",
    },
    infoText: {
      fontSize: scaleSize(15),
      color: COLORS.textSecondary,
      marginBottom: scaleSize(14),
      fontWeight: "500",
    },
    linkButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: hScaleSize(10),
      paddingVertical: scaleSize(10),
      backgroundColor: addOpacity(COLORS.primary, 0.1),
      paddingHorizontal: scaleSize(14),
      borderRadius: scaleSize(12),
      marginBottom: scaleSize(10),
    },
    linkButtonText: {
      fontSize: scaleSize(15),
      color: COLORS.primary,
      fontWeight: "700",
    },
    linkIcon: {
      fontSize: scaleSize(18),
      color: COLORS.primary,
    },
  });

export type MoleculeInfoSheetStyles = ReturnType<
  typeof getMoleculeInfoSheetStyles
>;
