import { StyleSheet } from "react-native";
import { ScaleMetrics } from "../utils/scaling";
import { getAttributionsBannerStyles } from "./AttributionsBanner.styles";
import { getJumpBackInSectionStyles } from "./JumpBackInSection.styles";
import { getFeaturedMoleculesCoreStyles } from "./FeaturedMolecules.styles";

export const getHomeScreenStyles = (metrics: ScaleMetrics) => {
  const { isLandscape, insets, scaleSize, hScaleSize } = metrics;
  const coreStyles = getFeaturedMoleculesCoreStyles(metrics);
  const bannerStyles = getAttributionsBannerStyles(metrics);
  const jumpBackStyles = getJumpBackInSectionStyles(metrics);

  const containerStyles = StyleSheet.create({
    featuredContainer: {
      flex: 1,
      width: "100%",
    },
    featuredScrollContent: {
      width: "100%",
      paddingLeft: Math.max(insets.left, hScaleSize(16)),
      paddingRight: Math.max(insets.right, hScaleSize(16)),
      paddingTop: isLandscape
        ? Math.max(insets.top, scaleSize(10)) + scaleSize(64)
        : insets.top + scaleSize(148),
      paddingBottom: Math.max(insets.bottom, scaleSize(16)) + scaleSize(24),
    },
  });

  return {
    ...containerStyles,
    ...bannerStyles,
    ...jumpBackStyles,
    ...coreStyles,
  };
};

export type HomeScreenStyles = ReturnType<typeof getHomeScreenStyles>;
