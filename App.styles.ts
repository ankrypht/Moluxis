import { StyleSheet } from "react-native";
import { COLORS, addOpacity } from "./src/constants/colors";
import { getScaleMetrics, Insets } from "./src/utils/scaling";
import { getMoleculeViewerStyles } from "./src/components/MoleculeViewer.styles";
import { getStructureControlsStyles } from "./src/components/StructureControls.styles";
import { getFloatingHeaderStyles } from "./src/components/FloatingHeader.styles";
import { getFloatingDockStyles } from "./src/components/FloatingDock.styles";
import { getMoleculeInfoSheetStyles } from "./src/components/MoleculeInfoSheet.styles";
import { getOverlaysStyles } from "./src/components/Overlays.styles";
import { getFeaturedMoleculesStyles } from "./src/components/FeaturedMolecules.styles";
import { getHistoryBookmarksModalStyles } from "./src/components/HistoryBookmarksModal.styles";
import { getShareExportModalStyles } from "./src/components/ShareExportModal.styles";
import { getCustomAlertStyles } from "./src/components/CustomAlert.styles";
import { getMeasurementPanelStyles } from "./src/components/MeasurementPanel.styles";
import { getUpdateAvailableModalStyles } from "./src/components/UpdateAvailableModal.styles";
import { getWhatsNewModalStyles } from "./src/components/WhatsNewModal.styles";
import { getDevTestModalStyles } from "./src/components/DevTestModal.styles";
import { getAboutModalStyles } from "./src/components/AboutModal.styles";

export const getStyles = (width: number, height: number, insets: Insets) => {
  const metrics = getScaleMetrics(width, height, insets);
  const { scaleSize } = metrics;

  const rootStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    floatingLeftRailContainer: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: Math.max(insets.left, scaleSize(20)) + scaleSize(16),
      zIndex: 50,
      justifyContent: "center",
      alignItems: "flex-start",
    },
    floatingLeftRail: {
      flexDirection: "column",
      backgroundColor: addOpacity(COLORS.surface, 0.88),
      borderRadius: scaleSize(22),
      padding: scaleSize(5),
      borderWidth: 1,
      borderColor: COLORS.surfaceElevated,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
      alignItems: "center",
      width: "auto",
      maxWidth: scaleSize(72),
    },
    floatingLeftRailCompact: {
      borderRadius: scaleSize(18),
      padding: scaleSize(4),
      maxWidth: scaleSize(62),
    },
  });

  return {
    ...rootStyles,
    ...getMoleculeViewerStyles(metrics),
    ...getStructureControlsStyles(metrics),
    ...getFloatingHeaderStyles(metrics),
    ...getFloatingDockStyles(metrics),
    ...getMoleculeInfoSheetStyles(metrics),
    ...getOverlaysStyles(metrics),
    ...getFeaturedMoleculesStyles(metrics),
    ...getHistoryBookmarksModalStyles(metrics),
    ...getShareExportModalStyles(metrics),
    ...getCustomAlertStyles(metrics),
    ...getMeasurementPanelStyles(metrics),
    ...getUpdateAvailableModalStyles(metrics),
    ...getWhatsNewModalStyles(metrics),
    ...getDevTestModalStyles(metrics),
    ...getAboutModalStyles(metrics),
  };
};
