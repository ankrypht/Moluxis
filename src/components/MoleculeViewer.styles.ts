import { StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";
import { ScaleMetrics } from "../utils/scaling";

export const getMoleculeViewerStyles = ({ scaleSize }: ScaleMetrics) =>
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
      backgroundColor: COLORS.background,
    },
    loadingOverlay: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: COLORS.background,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10,
    },
    loadingText: {
      fontSize: scaleSize(15),
      color: COLORS.textSecondary,
      marginTop: scaleSize(14),
      fontWeight: "600",
      letterSpacing: -0.2,
    },
  });

export type MoleculeViewerStyles = ReturnType<typeof getMoleculeViewerStyles>;
