import { StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";
import { ScaleMetrics } from "../utils/scaling";

export const getMoleculeViewerStyles = ({
  scaleSize,
  hScaleSize,
}: ScaleMetrics) =>
  StyleSheet.create({
    viewerContainer: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: COLORS.background,
      zIndex: 1,
    },
    webview: {
      flex: 1,
      backgroundColor: "transparent",
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
  });

export type MoleculeViewerStyles = ReturnType<typeof getMoleculeViewerStyles>;
