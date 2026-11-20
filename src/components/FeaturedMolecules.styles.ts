import { StyleSheet } from "react-native";
import { COLORS, addOpacity } from "../constants/colors";
import {
  BREAKPOINTS,
  getResponsiveContainerMaxWidth,
  SHADOWS,
} from "../constants/theme";
import { ScaleMetrics } from "../utils/scaling";

export const getFeaturedMoleculesCoreStyles = ({
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
    featuredMoleculesSection: {
      width: "100%",
    },
    heroSection: {
      alignItems: "center",
      marginBottom: sectionGap,
      paddingHorizontal: hScaleSize(8),
      maxWidth: containerMaxWidth,
      width: "100%",
      alignSelf: "center",
    },
    heroBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: addOpacity(COLORS.primary, 0.12),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.primary, 0.35),
      borderRadius: scaleSize(20),
      paddingHorizontal: isPhoneLandscape ? scaleSize(8) : hScaleSize(10),
      paddingVertical: isPhoneLandscape ? scaleSize(2) : scaleSize(4),
      gap: isPhoneLandscape ? scaleSize(4) : hScaleSize(5),
      marginBottom: isPhoneLandscape ? scaleSize(4) : scaleSize(8),
    },
    heroBadgeText: {
      fontSize: isPhoneLandscape ? scaleSize(9.5) : scaleSize(11),
      fontWeight: "700",
      color: COLORS.primary,
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },
    heroTitle: {
      fontSize: isPhoneLandscape ? scaleSize(17) : scaleSize(22),
      fontWeight: "900",
      color: COLORS.textPrimary,
      textAlign: "center",
      letterSpacing: -0.4,
    },
    heroSubtitle: {
      fontSize: isPhoneLandscape ? scaleSize(11.5) : scaleSize(13),
      color: COLORS.textSecondary,
      textAlign: "center",
      marginTop: isPhoneLandscape ? scaleSize(2) : scaleSize(4),
      maxWidth: isPhoneLandscape ? scaleSize(400) : scaleSize(340),
      lineHeight: isPhoneLandscape ? scaleSize(15) : scaleSize(18),
    },
    tabBarContainer: {
      marginBottom: sectionGap,
      maxWidth: containerMaxWidth,
      width: "100%",
      alignSelf: "center",
    },
    tabBarScroll: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: isPhoneLandscape ? scaleSize(6) : hScaleSize(8),
      paddingHorizontal: hScaleSize(4),
      flexGrow: 1,
    },
    categoryTab: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: addOpacity(COLORS.surface, 0.75),
      borderRadius: isPhoneLandscape ? scaleSize(14) : scaleSize(20),
      paddingVertical: isPhoneLandscape ? scaleSize(5) : scaleSize(8),
      paddingHorizontal: isPhoneLandscape ? scaleSize(8) : hScaleSize(12),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.border, 0.6),
      gap: isPhoneLandscape ? scaleSize(4) : hScaleSize(6),
    },
    categoryTabActive: {
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 3,
    },
    categoryTabIconBadge: {
      width: isPhoneLandscape ? scaleSize(18) : scaleSize(22),
      height: isPhoneLandscape ? scaleSize(18) : scaleSize(22),
      borderRadius: isPhoneLandscape ? scaleSize(9) : scaleSize(11),
      justifyContent: "center",
      alignItems: "center",
    },
    categoryTabText: {
      fontSize: isPhoneLandscape ? scaleSize(11) : scaleSize(12),
      fontWeight: "600",
      color: COLORS.textSecondary,
    },
    categoryTabTextActive: {
      fontWeight: "800",
      color: COLORS.textPrimary,
    },
    categoryTabCountBadge: {
      paddingHorizontal: isPhoneLandscape ? scaleSize(4) : hScaleSize(6),
      paddingVertical: scaleSize(1),
      borderRadius: scaleSize(10),
      backgroundColor: addOpacity(COLORS.surfaceElevated, 0.8),
    },
    categoryTabCountText: {
      fontSize: isPhoneLandscape ? scaleSize(9) : scaleSize(10),
      fontWeight: "700",
      color: COLORS.textMuted,
    },
    categorySection: {
      marginBottom: isPhoneLandscape ? scaleSize(12) : scaleSize(20),
      maxWidth: containerMaxWidth,
      width: "100%",
      alignSelf: "center",
    },
    categoryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: isPhoneLandscape ? scaleSize(6) : scaleSize(10),
      paddingHorizontal: hScaleSize(2),
    },
    categoryHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: isPhoneLandscape ? scaleSize(6) : hScaleSize(8),
    },
    categoryIconBadge: {
      width: isPhoneLandscape ? scaleSize(22) : scaleSize(26),
      height: isPhoneLandscape ? scaleSize(22) : scaleSize(26),
      borderRadius: isPhoneLandscape ? scaleSize(11) : scaleSize(13),
      justifyContent: "center",
      alignItems: "center",
    },
    categoryTitle: {
      fontSize: isPhoneLandscape ? scaleSize(13) : scaleSize(15),
      fontWeight: "700",
      color: COLORS.textPrimary,
      letterSpacing: -0.2,
    },
    categoryCount: {
      fontSize: isPhoneLandscape ? scaleSize(10) : scaleSize(11),
      color: COLORS.textMuted,
      fontWeight: "600",
    },
    card: {
      flex: 1,
      backgroundColor: addOpacity(COLORS.surface, 0.9),
      borderRadius: isPhoneLandscape ? scaleSize(14) : scaleSize(18),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.border, 0.7),
      padding: isPhoneLandscape ? scaleSize(9) : scaleSize(13),
      justifyContent: "space-between",
      ...SHADOWS.card,
    },
    cardTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: isPhoneLandscape ? scaleSize(6) : scaleSize(10),
    },
    moleculeIconContainer: {
      width: isPhoneLandscape ? scaleSize(28) : scaleSize(34),
      height: isPhoneLandscape ? scaleSize(28) : scaleSize(34),
      borderRadius: isPhoneLandscape ? scaleSize(8) : scaleSize(10),
      justifyContent: "center",
      alignItems: "center",
    },
    spinBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: addOpacity(COLORS.surfaceElevated, 0.9),
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: isPhoneLandscape ? scaleSize(6) : scaleSize(8),
      paddingHorizontal: isPhoneLandscape ? scaleSize(4) : hScaleSize(6),
      paddingVertical: scaleSize(2),
      gap: isPhoneLandscape ? scaleSize(2) : hScaleSize(3),
    },
    spinBadgeText: {
      fontSize: isPhoneLandscape ? scaleSize(8) : scaleSize(9),
      fontWeight: "800",
      color: COLORS.primary,
      letterSpacing: 0.3,
    },
    cardName: {
      fontSize: isPhoneLandscape ? scaleSize(12) : scaleSize(14),
      fontWeight: "700",
      color: COLORS.textPrimary,
      letterSpacing: -0.2,
    },
    cardFormula: {
      fontSize: isPhoneLandscape ? scaleSize(10.5) : scaleSize(12),
      fontWeight: "700",
      color: COLORS.textSecondary,
      marginTop: isPhoneLandscape ? scaleSize(1) : scaleSize(2),
    },
    cardTag: {
      fontSize: isPhoneLandscape ? scaleSize(9.5) : scaleSize(11),
      color: COLORS.textMuted,
      fontWeight: "500",
      marginTop: isPhoneLandscape ? scaleSize(2) : scaleSize(4),
    },
    cardFooter: {
      marginTop: isPhoneLandscape ? scaleSize(6) : scaleSize(10),
      paddingTop: isPhoneLandscape ? scaleSize(5) : scaleSize(8),
      borderTopWidth: 1,
      borderTopColor: addOpacity(COLORS.surfaceElevated, 0.9),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    cardFooterAction: {
      fontSize: isPhoneLandscape ? scaleSize(10) : scaleSize(11),
      fontWeight: "700",
      color: COLORS.primary,
    },
    gridContainer: {
      width: "100%",
    },
    gridRow: {
      flexDirection: "row",
      width: "100%",
      gap: isPhoneLandscape ? scaleSize(8) : hScaleSize(10),
      marginBottom: isPhoneLandscape ? scaleSize(8) : scaleSize(10),
    },
  });
};

export type FeaturedMoleculesCoreStyles = ReturnType<
  typeof getFeaturedMoleculesCoreStyles
>;

export const getFeaturedMoleculesStyles = getFeaturedMoleculesCoreStyles;
export type FeaturedMoleculesStyles = FeaturedMoleculesCoreStyles;
