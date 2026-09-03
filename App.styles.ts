import { StyleSheet } from "react-native";
import { COLORS } from "./src/constants/colors";
import { getScaleMetrics, Insets } from "./src/utils/scaling";
import { getMoleculeViewerStyles } from "./src/components/MoleculeViewer.styles";
import { getStructureControlsStyles } from "./src/components/StructureControls.styles";
import { getFloatingHeaderStyles } from "./src/components/FloatingHeader.styles";
import { getFloatingDockStyles } from "./src/components/FloatingDock.styles";
import { getMoleculeInfoSheetStyles } from "./src/components/MoleculeInfoSheet.styles";
import { getOverlaysStyles } from "./src/components/Overlays.styles";

export const getStyles = (width: number, height: number, insets: Insets) => {
  const metrics = getScaleMetrics(width, height, insets);

  const rootStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    mainContent: {
      flex: 1,
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
  };
};

export type AppStyles = ReturnType<typeof getStyles>;
