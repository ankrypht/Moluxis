import { StyleSheet } from "react-native";
import { COLORS, addOpacity } from "../constants/colors";
import { ScaleMetrics } from "../utils/scaling";

export const getFloatingHeaderStyles = ({
  isLandscape,
  insets,
  scaleSize,
  hScaleSize,
}: ScaleMetrics) =>
  StyleSheet.create({
    floatingHeaderContainer: {
      position: "absolute",
      top: 0,
      left: isLandscape ? insets.left : 0,
      right: isLandscape ? insets.right : 0,
      bottom: 0,
      zIndex: 100,
    },
    header: {
      paddingHorizontal: hScaleSize(16),
      paddingTop: isLandscape
        ? Math.max(insets.top, scaleSize(8))
        : insets.top + scaleSize(8),
      paddingBottom: scaleSize(8),
    },
    headerIsland: {
      backgroundColor: addOpacity(COLORS.surface, 0.85),
      borderRadius: scaleSize(24),
      padding: scaleSize(16),
      borderWidth: 1,
      borderColor: COLORS.surfaceElevated,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 10,
      zIndex: 100,
      maxWidth: 500,
      alignSelf: "center",
      width: "100%",
    },
    headerIslandLandscape: {
      padding: scaleSize(10),
      borderRadius: scaleSize(16),
      maxWidth: 480,
    },
    titleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: scaleSize(12),
    },
    title: {
      fontSize: scaleSize(24),
      fontWeight: "900",
      color: COLORS.primary,
      letterSpacing: -0.5,
    },
    titleLandscape: {
      display: "none",
    },
    titleRowLandscape: {
      display: "none",
    },
    searchRow: {
      flexDirection: "row",
      gap: hScaleSize(12),
      alignItems: "center",
    },
    searchRowLandscape: {
      gap: hScaleSize(8),
    },
    input: {
      flex: 1,
      backgroundColor: addOpacity(COLORS.surfaceElevated, 0.8),
      borderRadius: scaleSize(16),
      paddingHorizontal: hScaleSize(16),
      paddingVertical: scaleSize(12),
      fontSize: scaleSize(15),
      borderWidth: 1,
      borderColor: COLORS.border,
      color: COLORS.textPrimary,
    },
    inputLandscape: {
      paddingVertical: scaleSize(10),
      fontSize: scaleSize(14),
    },
    button: {
      backgroundColor: COLORS.primary,
      borderRadius: scaleSize(16),
      width: scaleSize(48),
      height: scaleSize(48),
      justifyContent: "center",
      alignItems: "center",
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonDisabled: {
      backgroundColor: COLORS.surfaceElevated,
      shadowOpacity: 0,
      elevation: 0,
    },
    buttonLandscape: {
      width: scaleSize(40),
      height: scaleSize(40),
    },
    buttonText: {
      color: COLORS.textOnPrimary,
      fontWeight: "700",
      fontSize: scaleSize(16),
    },
    suggestionsContainer: {
      position: "absolute",
      top: "145%", // just below the header island
      left: 0,
      right: 0,
      backgroundColor: COLORS.surface,
      borderRadius: scaleSize(16),
      elevation: 10,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      zIndex: 999,
      borderWidth: 1,
      borderColor: COLORS.border,
      overflow: "hidden",
    },
    suggestionsContainerLandscape: {},
    suggestionItem: {
      padding: scaleSize(16),
      borderBottomWidth: 1,
      borderBottomColor: COLORS.surfaceElevated,
      flexDirection: "row",
      alignItems: "center",
    },
    suggestionItemLandscape: {
      padding: scaleSize(12),
    },
    suggestionText: {
      fontSize: scaleSize(16),
      color: COLORS.textPrimary,
      fontWeight: "500",
    },
    controlsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: hScaleSize(16),
      marginTop: scaleSize(12),
      zIndex: 50,
    },
    islandInlineControls: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: scaleSize(8),
      gap: hScaleSize(12),
    },
    landscapeDivider: {
      width: 1,
      height: scaleSize(24),
      backgroundColor: COLORS.border,
      marginHorizontal: hScaleSize(6),
    },
  });

export type FloatingHeaderStyles = ReturnType<typeof getFloatingHeaderStyles>;
