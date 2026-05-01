import { StyleSheet, PixelRatio } from "react-native";

// Reference dimensions from Samsung S24
const REFERENCE_WIDTH = 360;
const REFERENCE_HEIGHT = 736;

export const getStyles = (width: number, height: number) => {
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
    // Main Container
    container: {
      flex: 1,
      backgroundColor: "#121212",
    },
    // Header
    header: {
      padding: scaleSize(16),
      backgroundColor: "#121212",
      zIndex: 100,
    },
    headerLandscape: {
      padding: scaleSize(8),
      paddingBottom: scaleSize(4),
    },
    title: {
      fontSize: scaleSize(24),
      fontWeight: "800",
      color: "#FFFFFF",
      marginBottom: scaleSize(15),
    },
    titleLandscape: {
      display: "none",
    },
    searchRow: {
      flexDirection: "row",
      gap: hScaleSize(10),
      zIndex: 101,
    },
    searchRowLandscape: {
      gap: hScaleSize(6),
    },
    input: {
      flex: 1,
      backgroundColor: "#1E1E1E",
      borderRadius: scaleSize(12),
      paddingHorizontal: hScaleSize(15),
      paddingVertical: scaleSize(12),
      fontSize: scaleSize(16),
      borderWidth: 1,
      borderColor: "#333",
      color: "#FFFFFF",
    },
    inputLandscape: {
      paddingVertical: scaleSize(8),
      fontSize: scaleSize(14),
    },
    button: {
      backgroundColor: "#0A84FF",
      borderRadius: scaleSize(12),
      minWidth: hScaleSize(60),
      paddingHorizontal: hScaleSize(12),
      justifyContent: "center",
      alignItems: "center",
    },
    buttonDisabled: {
      backgroundColor: "#333",
    },
    buttonLandscape: {
      minWidth: hScaleSize(50),
    },
    buttonText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: scaleSize(14),
    },
    // Suggestions Dropdown
    suggestionsContainer: {
      position: "absolute",
      top: scaleSize(130),
      left: hScaleSize(16),
      right: hScaleSize(16),
      backgroundColor: "#1E1E1E",
      borderRadius: scaleSize(12),
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 6,
      zIndex: 999,
      borderWidth: 1,
      borderColor: "#333",
    },
    suggestionsContainerLandscape: {
      top: scaleSize(60),
    },
    suggestionItem: {
      padding: scaleSize(15),
      borderBottomWidth: 1,
      borderBottomColor: "#2C2C2C",
      flexDirection: "row",
      alignItems: "center",
    },
    suggestionItemLandscape: {
      padding: scaleSize(10),
    },
    suggestionText: {
      fontSize: scaleSize(16),
      color: "#DDD",
    },
    // Controls
    controlsContainer: {
      minHeight: scaleSize(60),
      paddingVertical: scaleSize(10),
      backgroundColor: "#121212",
      borderBottomWidth: 1,
      borderBottomColor: "#2C2C2C",
    },
    controlsContainerLandscape: {
      minHeight: scaleSize(40),
      paddingVertical: scaleSize(6),
    },
    controlsScroll: {
      alignItems: "center",
      gap: hScaleSize(8),
    },
    chip: {
      paddingHorizontal: hScaleSize(14),
      paddingVertical: scaleSize(8),
      borderRadius: scaleSize(20),
      backgroundColor: "#1E1E1E",
      borderWidth: 1,
      borderColor: "#333",
      flexDirection: "row",
      alignItems: "center",
    },
    chipLandscape: {
      paddingVertical: scaleSize(4),
      paddingHorizontal: hScaleSize(10),
    },
    chipActive: {
      backgroundColor: "#0A84FF",
      borderColor: "#0A84FF",
    },
    chipText: {
      fontSize: scaleSize(13),
      fontWeight: "600",
      color: "#AAA",
    },
    chipTextActive: {
      color: "#FFFFFF",
    },
    // Viewer
    viewerContainer: {
      flex: 1,
      backgroundColor: "#121212",
      position: "relative",
    },
    viewerContainerLandscape: {
      flex: 2,
    },
    toggleContainer: {
      position: "absolute",
      top: scaleSize(10),
      left: hScaleSize(16),
      zIndex: 20,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(30, 30, 30, 0.8)",
      paddingLeft: hScaleSize(10),
      paddingRight: hScaleSize(4),
      borderRadius: scaleSize(20),
      borderWidth: 1,
      borderColor: "#444",
    },
    toggleText: {
      fontSize: scaleSize(12),
      fontWeight: "700",
      color: "#888",
    },
    badgeContainer: {
      position: "absolute",
      top: scaleSize(10),
      right: hScaleSize(16),
      flexDirection: "row",
      gap: hScaleSize(6),
      zIndex: 20,
    },
    badge: {
      paddingHorizontal: hScaleSize(10),
      paddingVertical: scaleSize(6),
      borderRadius: scaleSize(8),
      backgroundColor: "rgba(30, 30, 30, 0.8)",
      borderWidth: 1,
      borderColor: "#444",
    },
    badgeActive: {
      backgroundColor: "rgba(10, 132, 255, 0.2)",
      borderColor: "#0A84FF",
    },
    badgeText: {
      fontSize: scaleSize(12),
      fontWeight: "700",
      color: "#888",
    },
    badgeTextActive: {
      color: "#0A84FF",
    },
    badgeNotAvailable: {
      backgroundColor: "transparent",
      borderColor: "#2C2C2C",
    },
    badgeTextNotAvailable: {
      color: "#444",
    },
    webview: {
      flex: 1,
      backgroundColor: "transparent",
    },
    placeholderOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "#121212",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10,
      paddingHorizontal: hScaleSize(20),
    },
    placeholderIcon: {
      fontSize: scaleSize(60),
    },
    placeholderText: {
      fontSize: scaleSize(16),
      color: "#666",
      marginTop: scaleSize(15),
      textAlign: "center",
    },
    landscapeNameOverlay: {
      position: "absolute",
      bottom: scaleSize(15),
      left: 0,
      right: 0,
      alignItems: "center",
      zIndex: 10,
    },
    landscapeNameText: {
      color: "#AAA",
      fontSize: scaleSize(13),
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.5,
    },
    infoIcon: {
      fontSize: scaleSize(16),
    },
    linkIcon: {
      fontSize: scaleSize(16),
      color: "#0A84FF",
    },
    // Main Content
    mainContent: {
      flex: 1,
    },
    mainContentLandscape: {
      flex: 1,
      flexDirection: "row",
    },
    // Info Panel
    infoPanel: {
      maxHeight: "50%",
      backgroundColor: "#1A1A1A",
      borderTopLeftRadius: scaleSize(20),
      borderTopRightRadius: scaleSize(20),
      borderTopWidth: 1,
      borderTopColor: "#333",
    },
    infoPanelLandscape: {
      flex: 1,
      height: "100%",
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderTopWidth: 0,
      borderLeftWidth: 1,
      borderLeftColor: "#333",
    },
    infoScroll: {
      padding: scaleSize(16),
    },
    // Stats Grid
    statsGrid: {
      flexDirection: "row",
      gap: hScaleSize(12),
      marginBottom: scaleSize(16),
    },
    statCard: {
      flex: 1,
      backgroundColor: "#252525",
      borderRadius: scaleSize(12),
      padding: scaleSize(16),
      borderWidth: 1,
      borderColor: "#333",
    },
    statLabel: {
      fontSize: scaleSize(12),
      color: "#888",
      marginBottom: scaleSize(4),
      fontWeight: "600",
    },
    statValue: {
      fontSize: scaleSize(16),
      color: "#FFF",
      fontWeight: "700",
    },
    noDataText: {
      fontSize: scaleSize(14),
      color: "#666",
      fontStyle: "italic",
      textAlign: "center",
      paddingVertical: scaleSize(12),
    },
    // Safety Section
    safetySection: {
      marginBottom: scaleSize(16),
    },
    safetyLabel: {
      fontSize: scaleSize(14),
      fontWeight: "700",
      color: "#FFF",
      marginBottom: scaleSize(8),
    },
    safetyText: {
      fontSize: scaleSize(13),
      color: "#DDD",
      marginBottom: scaleSize(4),
      lineHeight: scaleSize(20),
    },
    hazardText: {
      fontSize: scaleSize(13),
      color: "#FF9500",
      marginBottom: scaleSize(4),
      lineHeight: scaleSize(20),
    },
    warningText: {
      fontSize: scaleSize(13),
      color: "#FF453A",
      marginBottom: scaleSize(4),
      lineHeight: scaleSize(20),
    },
    // Description
    descriptionText: {
      fontSize: scaleSize(14),
      lineHeight: scaleSize(22),
      color: "#CCC",
    },

    // Synonyms
    synonymsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: hScaleSize(8),
    },
    synonymChip: {
      backgroundColor: "#1E1E1E",
      paddingHorizontal: hScaleSize(12),
      paddingVertical: scaleSize(6),
      borderRadius: scaleSize(16),
      borderWidth: 1,
      borderColor: "#444",
    },
    synonymText: {
      fontSize: scaleSize(13),
      color: "#DDD",
    },
    // Info Text
    infoText: {
      fontSize: scaleSize(14),
      color: "#CCC",
      marginBottom: scaleSize(12),
    },
    linkButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: hScaleSize(8),
      paddingVertical: scaleSize(8),
    },
    linkButtonText: {
      fontSize: scaleSize(14),
      color: "#0A84FF",
      fontWeight: "600",
    },
    // Footer
    footer: {
      paddingTop: scaleSize(16),
      paddingHorizontal: hScaleSize(16),
      paddingBottom: scaleSize(20),
      backgroundColor: "#121212",
      borderTopWidth: 1,
      borderTopColor: "#2C2C2C",
      alignItems: "center",
    },
    moleculeName: {
      fontSize: scaleSize(18),
      fontWeight: "800",
      color: "#FFFFFF",
    },
    sourceText: {
      fontSize: scaleSize(12),
      color: "#666",
      marginTop: scaleSize(4),
    },
  });
};
