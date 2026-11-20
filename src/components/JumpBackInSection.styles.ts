import { StyleSheet } from "react-native";
import { COLORS, addOpacity } from "../constants/colors";
import {
  BREAKPOINTS,
  getResponsiveContainerMaxWidth,
} from "../constants/theme";
import { ScaleMetrics } from "../utils/scaling";

export const getJumpBackInSectionStyles = ({
  width,
  height,
  isLandscape,
  scaleSize,
  hScaleSize,
}: ScaleMetrics) => {
  const isPhoneLandscape = isLandscape && height < BREAKPOINTS.TABLET;
  const containerMaxWidth = getResponsiveContainerMaxWidth(
    width,
    height,
    isLandscape,
  );
  const sectionGap = isPhoneLandscape ? scaleSize(8) : scaleSize(16);

  return StyleSheet.create({
    jumpBackSection: {
      marginBottom: sectionGap,
      maxWidth: containerMaxWidth,
      width: "100%",
      alignSelf: "center",
      backgroundColor: addOpacity(COLORS.surface, 0.7),
      borderRadius: isPhoneLandscape ? scaleSize(14) : scaleSize(20),
      padding: isPhoneLandscape ? scaleSize(8) : scaleSize(14),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.border, 0.5),
    },
    jumpBackHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: isPhoneLandscape ? scaleSize(6) : scaleSize(12),
    },
    jumpBackHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: isPhoneLandscape ? scaleSize(6) : hScaleSize(8),
    },
    jumpBackTitle: {
      fontSize: isPhoneLandscape ? scaleSize(13) : scaleSize(15),
      fontWeight: "800",
      color: COLORS.textPrimary,
      letterSpacing: -0.2,
    },
    jumpBackViewAllBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: scaleSize(4),
      paddingVertical: isPhoneLandscape ? scaleSize(2) : scaleSize(4),
      paddingHorizontal: isPhoneLandscape ? scaleSize(6) : scaleSize(8),
      borderRadius: scaleSize(8),
      backgroundColor: addOpacity(COLORS.primary, 0.12),
    },
    jumpBackViewAllText: {
      fontSize: isPhoneLandscape ? scaleSize(10.5) : scaleSize(12),
      fontWeight: "700",
      color: COLORS.primary,
    },
    jumpBackChipsScroll: {
      flexDirection: "row",
      gap: isPhoneLandscape ? scaleSize(8) : hScaleSize(10),
    },
    jumpBackChip: {
      backgroundColor: COLORS.surfaceElevated,
      borderRadius: isPhoneLandscape ? scaleSize(10) : scaleSize(14),
      paddingVertical: isPhoneLandscape ? scaleSize(6) : scaleSize(10),
      paddingHorizontal: isPhoneLandscape ? scaleSize(10) : scaleSize(14),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.border, 0.7),
      flexDirection: "row",
      alignItems: "center",
      gap: isPhoneLandscape ? scaleSize(6) : scaleSize(10),
    },
    jumpBackChipIcon: {
      width: isPhoneLandscape ? scaleSize(22) : scaleSize(28),
      height: isPhoneLandscape ? scaleSize(22) : scaleSize(28),
      borderRadius: isPhoneLandscape ? scaleSize(6) : scaleSize(8),
      backgroundColor: addOpacity(COLORS.primary, 0.15),
      justifyContent: "center",
      alignItems: "center",
    },
    jumpBackChipIconFav: {
      backgroundColor: addOpacity(COLORS.warning, 0.15),
    },
    jumpBackChipName: {
      fontSize: isPhoneLandscape ? scaleSize(11.5) : scaleSize(13),
      fontWeight: "700",
      color: COLORS.textPrimary,
    },
    jumpBackChipFormula: {
      fontSize: isPhoneLandscape ? scaleSize(10) : scaleSize(11),
      fontWeight: "600",
      color: COLORS.textSecondary,
    },
  });
};

export type JumpBackInSectionStyles = ReturnType<
  typeof getJumpBackInSectionStyles
>;
