import { StyleSheet } from "react-native";
import { COLORS, addOpacity } from "../constants/colors";
import { ScaleMetrics } from "../utils/scaling";

export const getFeaturedMoleculesStyles = ({
  isLandscape,
  insets,
  scaleSize,
  hScaleSize,
}: ScaleMetrics) =>
  StyleSheet.create({
    featuredContainer: {
      flex: 1,
      width: "100%",
    },
    featuredScrollContent: {
      width: "100%",
      paddingHorizontal: hScaleSize(16),
      paddingTop: isLandscape
        ? Math.max(insets.top, scaleSize(10)) + scaleSize(75)
        : insets.top + scaleSize(145),
      paddingBottom: Math.max(insets.bottom, scaleSize(16)) + scaleSize(24),
    },
    heroSection: {
      alignItems: "center",
      marginBottom: scaleSize(16),
      paddingHorizontal: hScaleSize(8),
      maxWidth: 720,
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
      paddingHorizontal: hScaleSize(10),
      paddingVertical: scaleSize(4),
      gap: hScaleSize(5),
      marginBottom: scaleSize(8),
    },
    heroBadgeText: {
      fontSize: scaleSize(11),
      fontWeight: "700",
      color: COLORS.primary,
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },
    heroTitle: {
      fontSize: scaleSize(22),
      fontWeight: "900",
      color: COLORS.textPrimary,
      textAlign: "center",
      letterSpacing: -0.4,
    },
    heroSubtitle: {
      fontSize: scaleSize(13),
      color: COLORS.textSecondary,
      textAlign: "center",
      marginTop: scaleSize(4),
      maxWidth: scaleSize(340),
      lineHeight: scaleSize(18),
    },
    categorySection: {
      marginBottom: scaleSize(20),
      maxWidth: 960,
      width: "100%",
      alignSelf: "center",
    },
    categoryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: scaleSize(10),
      paddingHorizontal: hScaleSize(2),
    },
    categoryHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: hScaleSize(8),
    },
    categoryIconBadge: {
      width: scaleSize(26),
      height: scaleSize(26),
      borderRadius: scaleSize(13),
      justifyContent: "center",
      alignItems: "center",
    },
    categoryTitle: {
      fontSize: scaleSize(15),
      fontWeight: "700",
      color: COLORS.textPrimary,
      letterSpacing: -0.2,
    },
    categoryCount: {
      fontSize: scaleSize(11),
      color: COLORS.textMuted,
      fontWeight: "600",
    },
    card: {
      flex: 1,
      backgroundColor: addOpacity(COLORS.surface, 0.9),
      borderRadius: scaleSize(18),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.border, 0.7),
      padding: scaleSize(13),
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
      marginBottom: scaleSize(10),
    },
    moleculeIconContainer: {
      width: scaleSize(34),
      height: scaleSize(34),
      borderRadius: scaleSize(10),
      justifyContent: "center",
      alignItems: "center",
    },
    spinBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: addOpacity(COLORS.surfaceElevated, 0.9),
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: scaleSize(8),
      paddingHorizontal: hScaleSize(6),
      paddingVertical: scaleSize(2),
      gap: hScaleSize(3),
    },
    spinBadgeText: {
      fontSize: scaleSize(9),
      fontWeight: "800",
      color: COLORS.primary,
      letterSpacing: 0.3,
    },
    cardName: {
      fontSize: scaleSize(14),
      fontWeight: "700",
      color: COLORS.textPrimary,
      letterSpacing: -0.2,
    },
    cardFormula: {
      fontSize: scaleSize(12),
      fontWeight: "700",
      color: COLORS.textSecondary,
      marginTop: scaleSize(2),
    },
    cardTag: {
      fontSize: scaleSize(11),
      color: COLORS.textMuted,
      fontWeight: "500",
      marginTop: scaleSize(4),
    },
    cardFooter: {
      marginTop: scaleSize(10),
      paddingTop: scaleSize(8),
      borderTopWidth: 1,
      borderTopColor: addOpacity(COLORS.surfaceElevated, 0.9),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    cardFooterAction: {
      fontSize: scaleSize(11),
      fontWeight: "700",
      color: COLORS.primary,
    },
    gridContainer: {
      width: "100%",
    },
    gridRow: {
      flexDirection: "row",
      width: "100%",
      gap: hScaleSize(10),
      marginBottom: scaleSize(10),
    },
  });

export type FeaturedMoleculesStyles = ReturnType<
  typeof getFeaturedMoleculesStyles
>;
