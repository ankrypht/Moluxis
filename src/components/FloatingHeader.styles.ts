import { StyleSheet } from "react-native";
import { COLORS, addOpacity } from "../constants/colors";
import {
  ScaleMetrics,
  REFERENCE_WIDTH,
  REFERENCE_HEIGHT,
} from "../utils/scaling";

export const getFloatingHeaderStyles = ({
  isLandscape,
  insets,
  scaleSize,
  hScaleSize,
  width,
  height,
}: ScaleMetrics) => {
  const safeWidth = width ?? (isLandscape ? REFERENCE_HEIGHT : REFERENCE_WIDTH);
  const safeHeight = height ?? (isLandscape ? REFERENCE_WIDTH : REFERENCE_HEIGHT);
  const isTablet = Math.min(safeWidth, safeHeight) >= 600;
  const isTabletPortrait = !isLandscape && isTablet;
  const isTabletLandscape = isLandscape && isTablet;

  // Unified container maxWidths across breakpoints:
  // - Phone Portrait (!isLandscape && width < 600): maxWidth: 500
  // - Tablet Portrait (!isLandscape && width >= 600): maxWidth: 680
  // - Phone Landscape (isLandscape && height < 600): maxWidth: 520
  // - Tablet Landscape (isLandscape && height >= 600): maxWidth: 860
  const headerMaxWidth = isLandscape
    ? isTabletLandscape
      ? 860
      : 520
    : isTabletPortrait
      ? 680
      : 500;

  return StyleSheet.create({
    floatingHeaderContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 100,
    },
    header: {
      paddingLeft: Math.max(insets.left, hScaleSize(16)),
      paddingRight: Math.max(insets.right, hScaleSize(16)),
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
      maxWidth: headerMaxWidth,
      alignSelf: "center",
      width: "100%",
    },
    headerIslandLandscape: {
      paddingVertical: isTabletLandscape ? scaleSize(8) : scaleSize(5),
      paddingHorizontal: isTabletLandscape ? scaleSize(10) : scaleSize(5),
      borderRadius: isTabletLandscape ? scaleSize(20) : scaleSize(18),
      maxWidth: headerMaxWidth,
      width: "100%",
      alignSelf: "center",
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
    headerTopActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: hScaleSize(8),
    },
    headerIconButton: {
      width: scaleSize(48),
      height: scaleSize(48),
      borderRadius: scaleSize(16),
      backgroundColor: addOpacity(COLORS.surfaceElevated, 0.8),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.border, 0.6),
      justifyContent: "center",
      alignItems: "center",
    },
    headerIconButtonActive: {
      backgroundColor: addOpacity(COLORS.warning, 0.15),
      borderColor: addOpacity(COLORS.warning, 0.5),
    },
    headerIconButtonLandscape: {
      width: isTabletLandscape ? scaleSize(44) : scaleSize(38),
      height: isTabletLandscape ? scaleSize(44) : scaleSize(38),
      borderRadius: isTabletLandscape ? scaleSize(14) : scaleSize(13),
    },
    searchRow: {
      flexDirection: "row",
      gap: hScaleSize(12),
      alignItems: "center",
    },
    searchRowLandscape: {
      gap: isTabletLandscape ? scaleSize(10) : hScaleSize(8),
    },
    inputWrapper: {
      flex: 1,
      position: "relative",
      justifyContent: "center",
    },
    input: {
      width: "100%",
      backgroundColor: addOpacity(COLORS.surfaceElevated, 0.8),
      borderRadius: scaleSize(16),
      paddingHorizontal: hScaleSize(10),
      paddingVertical: scaleSize(12),
      fontSize: scaleSize(15),
      borderWidth: 1,
      borderColor: COLORS.border,
      color: COLORS.textPrimary,
    },
    inputWithClear: {
      paddingRight: scaleSize(40),
    },
    inputLandscape: {
      paddingVertical: isTabletLandscape ? scaleSize(10) : scaleSize(8),
      fontSize: isTabletLandscape ? scaleSize(14) : scaleSize(13),
    },
    clearButton: {
      position: "absolute",
      right: scaleSize(10),
      justifyContent: "center",
      alignItems: "center",
      zIndex: 5,
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
      width: isTabletLandscape ? scaleSize(44) : scaleSize(38),
      height: isTabletLandscape ? scaleSize(44) : scaleSize(38),
      borderRadius: isTabletLandscape ? scaleSize(14) : scaleSize(13),
    },
    suggestionsContainer: {
      marginTop: scaleSize(6),
      alignSelf: "center",
      width: "100%",
      maxWidth: headerMaxWidth,
      backgroundColor: COLORS.surface,
      borderRadius: scaleSize(16),
      elevation: 10,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      zIndex: 999,
      borderWidth: 1,
      borderColor: COLORS.surfaceElevated,
      overflow: "hidden",
    },
    suggestionsContainerLandscape: {
      width: "100%",
      maxWidth: headerMaxWidth,
      marginTop: scaleSize(4),
      borderRadius: scaleSize(14),
      alignSelf: "center",
    },
    suggestionsList: {
      maxHeight: isLandscape ? scaleSize(130) : scaleSize(180),
    },
    controlsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingLeft: Math.max(insets.left, hScaleSize(16)),
      paddingRight: Math.max(insets.right, hScaleSize(16)),
      marginTop: scaleSize(12),
      zIndex: 50,
      maxWidth: headerMaxWidth,
      width: "100%",
      alignSelf: "center",
      backgroundColor: "transparent",
      borderWidth: 0,
      borderRadius: 0,
      elevation: 0,
      shadowOpacity: 0,
    },
  });
};

export type FloatingHeaderStyles = ReturnType<typeof getFloatingHeaderStyles>;
