import { StyleSheet } from "react-native";
import { COLORS, addOpacity } from "../constants/colors";
import { ScaleMetrics } from "../utils/scaling";

export const getFeaturedMoleculesStyles = ({
  width,
  height,
  isLandscape,
  insets,
  scaleSize,
  hScaleSize,
}: ScaleMetrics) => {
  const isPhoneLandscape = isLandscape && height < 600;
  const isTabletLandscape = isLandscape && height >= 600;
  const isTabletPortrait = !isLandscape && width >= 600;

  // Harmonious aligned container maxWidths across all breakpoints
  const containerMaxWidth = isTabletLandscape
    ? 860
    : isTabletPortrait
    ? 680
    : isPhoneLandscape
    ? 520
    : 500;

  const sectionGap = isPhoneLandscape ? scaleSize(8) : scaleSize(16);

  return StyleSheet.create({
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
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 4,
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

export type FeaturedMoleculesStyles = ReturnType<
  typeof getFeaturedMoleculesStyles
>;
