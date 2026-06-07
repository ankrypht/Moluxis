import { StyleSheet, PixelRatio } from "react-native";
import { COLORS, addOpacity } from "./src/constants/colors";

// Reference dimensions from Samsung S24
const REFERENCE_WIDTH = 360;
const REFERENCE_HEIGHT = 736;

export const getStyles = (
  width: number,
  height: number,
  insets: { top: number; bottom: number; left: number; right: number },
  showInfo: boolean,
  showStyleMenu: boolean,
) => {
  const isLandscape = width > height;

  // Swap reference dimensions based on orientation to maintain the 'optimized' look
  const refWidth = isLandscape ? REFERENCE_HEIGHT : REFERENCE_WIDTH;
  const refHeight = isLandscape ? REFERENCE_WIDTH : REFERENCE_HEIGHT;

  const wScale = width / refWidth;
  const hScale = height / refHeight;
  // Use a slightly dampened scale for fonts to avoid extreme sizes
  const s = Math.min(wScale, hScale);

  const scaleSize = (size: number, factor = 0.5) => {
    const scaledSize = size + (s * size - size) * factor;
    return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
  };

  const hScaleSize = (size: number) =>
    Math.round(PixelRatio.roundToNearestPixel((width / refWidth) * size));

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    // Main Content
    mainContent: {
      flex: 1,
    },
    // Background Viewer Area
    viewerContainer: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: isLandscape && showInfo ? "45%" : 0,
      backgroundColor: COLORS.background,
      zIndex: 1,
    },
    webview: {
      flex: 1,
      backgroundColor: "transparent",
    },
    // Floating Overlays Layer (Header)
    floatingHeaderContainer: {
      position: "absolute",
      top: 0,
      left: isLandscape ? insets.left : 0,
      right: isLandscape ? (showInfo ? "45%" : insets.right) : 0,
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
    // Suggestions Dropdown
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
    suggestionsContainerLandscape: {
      // Landscape styles same as portrait now since it's relative
    },
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
    // View Toggles
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
    toggleContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: addOpacity(COLORS.surfaceElevated, 0.8),
      paddingLeft: hScaleSize(12),
      paddingRight: hScaleSize(6),
      paddingVertical: scaleSize(4),
      borderRadius: scaleSize(12),
      borderWidth: 1,
      borderColor: COLORS.border,
      gap: hScaleSize(8),
    },
    badgeContainer: {
      flexDirection: "row",
      gap: hScaleSize(8),
    },
    toggleText: {
      fontSize: scaleSize(13),
      fontWeight: "700",
      color: COLORS.textSecondary,
    },
    badge: {
      paddingHorizontal: hScaleSize(12),
      paddingVertical: scaleSize(8),
      borderRadius: scaleSize(12),
      backgroundColor: addOpacity(COLORS.surfaceElevated, 0.8),
      borderWidth: 1,
      borderColor: COLORS.border,
      justifyContent: "center",
      alignItems: "center",
    },
    badgeActive: {
      backgroundColor: addOpacity(COLORS.primary, 0.2),
      borderColor: COLORS.primary,
    },
    badgeText: {
      fontSize: scaleSize(13),
      fontWeight: "800",
      color: COLORS.textSecondary,
    },
    badgeTextActive: {
      color: COLORS.primary,
    },
    badgeNotAvailable: {
      backgroundColor: "transparent",
      borderColor: COLORS.surfaceElevated,
    },
    badgeTextNotAvailable: {
      color: COLORS.textMuted,
    },
    placeholderOverlay: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: COLORS.background,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2,
      paddingHorizontal: hScaleSize(20),
    },
    placeholderIcon: {
      fontSize: scaleSize(64),
      color: COLORS.textMuted,
    },
    placeholderText: {
      fontSize: scaleSize(16),
      color: COLORS.textMuted,
      marginTop: scaleSize(16),
      textAlign: "center",
      fontWeight: "500",
    },
    landscapeNameOverlay: {
      position: "absolute",
      bottom: isLandscape
        ? Math.max(insets.bottom, scaleSize(12)) + scaleSize(64)
        : scaleSize(80),
      left: isLandscape ? insets.left : 0,
      right: isLandscape ? insets.right : 0,
      alignItems: "center",
      zIndex: 10,
    },
    landscapeNameText: {
      color: COLORS.textSecondary,
      fontSize: scaleSize(14),
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 2,
    },
    moleculeName: {
      fontSize: scaleSize(20),
      fontWeight: "900",
      color: COLORS.textPrimary,
      letterSpacing: 1,
      flex: 1,
    },
    // Dock (Floating bottom)
    floatingDockContainer: {
      position: "absolute",
      bottom: 0,
      left: isLandscape ? insets.left : 0,
      right: isLandscape ? (showInfo ? "45%" : insets.right) : 0,
      zIndex: showStyleMenu ? 150 : 50,
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
    // Bottom Sheet Info Panel
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
      marginBottom: scaleSize(20),
    },
    closeButtonInline: {
      padding: scaleSize(6),
      backgroundColor: addOpacity(COLORS.surface, 0.5),
      borderRadius: scaleSize(16),
    },
    infoScroll: {
      paddingHorizontal: scaleSize(24),
      paddingBottom: scaleSize(40),
    },
    // Stats Grid
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
    // Safety Section
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
    // Description
    descriptionText: {
      fontSize: scaleSize(15),
      lineHeight: scaleSize(24),
      color: COLORS.textSecondary,
      fontWeight: "400",
    },
    // Synonyms
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
    // Info Text
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
};
