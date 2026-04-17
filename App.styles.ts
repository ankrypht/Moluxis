import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  // Header
  header: {
    padding: 16,
    backgroundColor: "#121212",
    zIndex: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 15,
  },
  searchRow: {
    flexDirection: "row",
    gap: 10,
    zIndex: 101,
  },
  input: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#333",
    color: "#FFFFFF",
  },
  button: {
    backgroundColor: "#0A84FF",
    borderRadius: 12,
    minWidth: 60,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#333",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  // Suggestions Dropdown
  suggestionsContainer: {
    position: "absolute",
    top: 130,
    left: 16,
    right: 16,
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    zIndex: 999,
    borderWidth: 1,
    borderColor: "#333",
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2C",
    flexDirection: "row",
    alignItems: "center",
  },
  suggestionText: {
    fontSize: 16,
    color: "#DDD",
  },
  // Controls
  controlsContainer: {
    minHeight: 60,
    paddingVertical: 10,
    backgroundColor: "#121212",
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2C",
  },
  controlsScroll: {
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1E1E1E",
    borderWidth: 1,
    borderColor: "#333",
    flexDirection: "row",
    alignItems: "center",
  },
  chipActive: {
    backgroundColor: "#0A84FF",
    borderColor: "#0A84FF",
  },
  chipText: {
    fontSize: 13,
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
  badgeContainer: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    gap: 6,
    zIndex: 20,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(30, 30, 30, 0.8)",
    borderWidth: 1,
    borderColor: "#444",
  },
  badgeActive: {
    backgroundColor: "rgba(10, 132, 255, 0.2)",
    borderColor: "#0A84FF",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#888",
  },
  badgeTextActive: {
    color: "#0A84FF",
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
    paddingHorizontal: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: "#666",
    marginTop: 15,
    textAlign: "center",
  },
  // Info Panel
  infoPanel: {
    maxHeight: "50%",
    backgroundColor: "#1A1A1A",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  infoScroll: {
    padding: 16,
  },
  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#252525",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
    fontWeight: "600",
  },
  statValue: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "700",
  },
  noDataText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 12,
  },
  // Safety Section
  safetySection: {
    marginBottom: 16,
  },
  safetyLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 8,
  },
  safetyText: {
    fontSize: 13,
    color: "#DDD",
    marginBottom: 4,
    lineHeight: 20,
  },
  hazardText: {
    fontSize: 13,
    color: "#FF9500",
    marginBottom: 4,
    lineHeight: 20,
  },
  warningText: {
    fontSize: 13,
    color: "#FF453A",
    marginBottom: 4,
    lineHeight: 20,
  },
  // Description
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#CCC",
  },

  // Synonyms
  synonymsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  synonymChip: {
    backgroundColor: "#1E1E1E",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#444",
  },
  synonymText: {
    fontSize: 13,
    color: "#DDD",
  },
  // Info Text
  infoText: {
    fontSize: 14,
    color: "#CCC",
    marginBottom: 12,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  linkButtonText: {
    fontSize: 14,
    color: "#0A84FF",
    fontWeight: "600",
  },
  // Footer
  footer: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 40,
    backgroundColor: "#121212",
    borderTopWidth: 1,
    borderTopColor: "#2C2C2C",
    alignItems: "center",
  },
  moleculeName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  sourceText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
});
