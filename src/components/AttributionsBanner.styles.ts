import { StyleSheet } from "react-native";
import { COLORS, addOpacity } from "../constants/colors";
import {
  BREAKPOINTS,
  getResponsiveContainerMaxWidth,
} from "../constants/theme";
import { ScaleMetrics } from "../utils/scaling";

export const getAttributionsBannerStyles = ({
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
    showcaseAboutBanner: {
      marginTop: isPhoneLandscape ? scaleSize(6) : sectionGap,
      marginBottom: sectionGap,
      maxWidth: containerMaxWidth,
      width: "100%",
      alignSelf: "center",
      backgroundColor: addOpacity(COLORS.surface, 0.72),
      borderRadius: isPhoneLandscape ? scaleSize(12) : scaleSize(16),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.border, 0.5),
      paddingVertical: isPhoneLandscape ? scaleSize(5) : scaleSize(9),
      paddingHorizontal: isPhoneLandscape ? scaleSize(10) : hScaleSize(12),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: isPhoneLandscape ? scaleSize(8) : hScaleSize(10),
    },
    showcaseAboutInfoCol: {
      flex: 1,
      minWidth: 0,
      justifyContent: "center",
    },
    showcaseAboutCreditRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: isPhoneLandscape ? scaleSize(4) : hScaleSize(6),
    },
    showcaseAboutCreditText: {
      fontSize: isPhoneLandscape ? scaleSize(11) : scaleSize(12.5),
      color: COLORS.textSecondary,
      fontWeight: "500",
    },
    showcaseAboutAuthorName: {
      color: COLORS.textPrimary,
      fontWeight: "800",
    },
    showcaseAboutVersionText: {
      fontSize: isPhoneLandscape ? scaleSize(9.5) : scaleSize(10.5),
      color: COLORS.textMuted,
      fontWeight: "600",
    },
    showcaseGithubLink: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      marginTop: isPhoneLandscape ? scaleSize(1.5) : scaleSize(3),
      gap: isPhoneLandscape ? scaleSize(3) : hScaleSize(4),
    },
    showcaseGithubLinkText: {
      fontSize: isPhoneLandscape ? scaleSize(10) : scaleSize(11.5),
      color: COLORS.textSecondary,
      fontWeight: "600",
    },
    showcaseAboutPill: {
      flexShrink: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: isPhoneLandscape ? scaleSize(4) : hScaleSize(5),
      backgroundColor: addOpacity(COLORS.primary, 0.14),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.primary, 0.38),
      borderRadius: isPhoneLandscape ? scaleSize(9) : scaleSize(12),
      paddingHorizontal: isPhoneLandscape ? scaleSize(9) : hScaleSize(12),
      paddingVertical: isPhoneLandscape ? scaleSize(5) : scaleSize(8),
    },
    showcaseAboutPillText: {
      fontSize: isPhoneLandscape ? scaleSize(11) : scaleSize(12.5),
      fontWeight: "700",
      color: COLORS.primary,
    },
  });
};

export type AttributionsBannerStyles = ReturnType<
  typeof getAttributionsBannerStyles
>;
