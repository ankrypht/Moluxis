import { StyleSheet } from "react-native";
import { COLORS, addOpacity } from "../constants/colors";
import {
  createModalBackdropStyle,
  createBottomSheetContainerStyle,
  createBottomSheetLandscapeStyle,
  createCircularCloseButtonStyle,
  SHADOWS,
} from "../constants/theme";
import { ScaleMetrics } from "../utils/scaling";

export const getAboutModalStyles = ({
  isLandscape,
  insets,
  scaleSize,
  hScaleSize,
}: ScaleMetrics) =>
  StyleSheet.create({
    aboutBackdrop: createModalBackdropStyle(0.78, {
      zIndex: 250,
      justifyContent: "flex-end",
    }),
    aboutModalContainer: createBottomSheetContainerStyle({
      scaleSize,
      radius: 28,
      zIndex: 260,
    }),
    aboutModalContainerLandscape: createBottomSheetLandscapeStyle(scaleSize, {
      left: "48%",
      width: "52%",
      radius: 28,
    }),
    aboutModalHeader: {
      paddingLeft: scaleSize(18),
      paddingRight: isLandscape
        ? Math.max(insets.right, scaleSize(18))
        : scaleSize(18),
      paddingTop: isLandscape
        ? Math.max(insets.top, scaleSize(12))
        : scaleSize(16),
      paddingBottom: scaleSize(12),
      borderBottomWidth: 1,
      borderBottomColor: addOpacity(COLORS.border, 0.4),
      width: "100%",
    },
    aboutModalTopBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
    aboutModalTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: hScaleSize(10),
    },
    aboutModalIconBadge: {
      width: scaleSize(32),
      height: scaleSize(32),
      borderRadius: scaleSize(10),
      backgroundColor: addOpacity(COLORS.primary, 0.15),
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: addOpacity(COLORS.primary, 0.3),
    },
    aboutModalTitle: {
      fontSize: scaleSize(17),
      fontWeight: "800",
      color: COLORS.textPrimary,
      letterSpacing: -0.3,
    },
    aboutModalSubtitle: {
      fontSize: scaleSize(12),
      color: COLORS.textMuted,
      fontWeight: "500",
      marginTop: scaleSize(1),
    },
    aboutCloseButton: createCircularCloseButtonStyle(scaleSize, 0.8, 32),
    aboutContentScroll: {
      flex: 1,
      paddingLeft: scaleSize(16),
      paddingRight: isLandscape
        ? Math.max(insets.right, scaleSize(16))
        : scaleSize(16),
      paddingTop: scaleSize(14),
    },
    aboutContentContainer: {
      paddingBottom: isLandscape
        ? Math.max(insets.bottom, scaleSize(16)) + scaleSize(24)
        : Math.max(insets.bottom, scaleSize(20)) + scaleSize(24),
    },
    aboutHeroCard: {
      backgroundColor: addOpacity(COLORS.surfaceElevated, 0.55),
      borderRadius: scaleSize(20),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.border, 0.7),
      padding: scaleSize(16),
      marginBottom: scaleSize(16),
      ...SHADOWS.card,
    },
    aboutHeroTopRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: hScaleSize(14),
    },
    aboutAppIconFrame: {
      width: scaleSize(54),
      height: scaleSize(54),
      borderRadius: scaleSize(15),
      backgroundColor: COLORS.background,
      borderWidth: 3,
      borderColor: addOpacity(COLORS.surfaceElevated, 0.35),
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
    },
    aboutAppIconImage: {
      width: "100%",
      height: "100%",
    },
    aboutHeroTextCol: {
      flex: 1,
    },
    aboutHeroNameRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: hScaleSize(8),
      marginBottom: scaleSize(4),
    },
    aboutHeroAppName: {
      fontSize: scaleSize(19),
      fontWeight: "900",
      color: COLORS.textPrimary,
      letterSpacing: -0.4,
    },
    aboutVersionPill: {
      backgroundColor: addOpacity(COLORS.primary, 0.16),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.primary, 0.35),
      borderRadius: scaleSize(8),
      paddingHorizontal: hScaleSize(7),
      paddingVertical: scaleSize(2),
    },
    aboutVersionPillText: {
      fontSize: scaleSize(11),
      fontWeight: "700",
      color: COLORS.primary,
    },
    aboutOpenSourcePill: {
      backgroundColor: addOpacity(COLORS.emerald, 0.14),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.emerald, 0.35),
      borderRadius: scaleSize(8),
      paddingHorizontal: hScaleSize(7),
      paddingVertical: scaleSize(2),
    },
    aboutOpenSourcePillText: {
      fontSize: scaleSize(10.5),
      fontWeight: "700",
      color: COLORS.emerald,
    },
    aboutHeroTagline: {
      fontSize: scaleSize(12.5),
      color: COLORS.textSecondary,
      lineHeight: scaleSize(17.5),
      fontWeight: "500",
    },
    aboutAuthorBar: {
      marginTop: scaleSize(12),
      paddingTop: scaleSize(10),
      borderTopWidth: 1,
      borderTopColor: addOpacity(COLORS.border, 0.45),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: scaleSize(6),
    },
    aboutAuthorLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: hScaleSize(6),
    },
    aboutAuthorLabel: {
      fontSize: scaleSize(12.5),
      color: COLORS.textSecondary,
      fontWeight: "500",
    },
    aboutAuthorName: {
      fontSize: scaleSize(12.5),
      color: COLORS.textPrimary,
      fontWeight: "800",
    },
    aboutLicenseTag: {
      fontSize: scaleSize(11),
      color: COLORS.textMuted,
      fontWeight: "600",
    },
    aboutSectionLabel: {
      fontSize: scaleSize(11),
      fontWeight: "800",
      color: COLORS.textMuted,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginBottom: scaleSize(8),
      paddingLeft: scaleSize(2),
    },
    aboutGroupCard: {
      backgroundColor: addOpacity(COLORS.surfaceElevated, 0.55),
      borderRadius: scaleSize(16),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.border, 0.55),
      overflow: "hidden",
      marginBottom: scaleSize(16),
    },
    aboutRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: scaleSize(13),
      paddingVertical: scaleSize(12),
      gap: hScaleSize(10),
    },
    aboutRowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: addOpacity(COLORS.border, 0.35),
    },
    aboutRowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: hScaleSize(12),
      flex: 1,
    },
    aboutRowIconBadge: {
      width: scaleSize(36),
      height: scaleSize(36),
      borderRadius: scaleSize(11),
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
    },
    aboutRowTextCol: {
      flex: 1,
    },
    aboutRowTitle: {
      fontSize: scaleSize(13.5),
      fontWeight: "700",
      color: COLORS.textPrimary,
      marginBottom: scaleSize(1.5),
    },
    aboutRowDescription: {
      fontSize: scaleSize(11.5),
      color: COLORS.textSecondary,
      fontWeight: "500",
    },
    aboutRowDescriptionSuccess: {
      color: COLORS.emerald,
      fontWeight: "600",
    },
    aboutFeedbackBlock: {
      paddingHorizontal: scaleSize(13),
      paddingVertical: scaleSize(12),
      gap: scaleSize(10),
    },
    aboutFeedbackActionsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: hScaleSize(8),
    },
    aboutFeedbackActionBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: hScaleSize(6),
      paddingVertical: scaleSize(9),
      paddingHorizontal: hScaleSize(10),
      borderRadius: scaleSize(11),
      borderWidth: 1,
    },
    aboutFeedbackEmailBtn: {
      backgroundColor: addOpacity(COLORS.primary, 0.14),
      borderColor: addOpacity(COLORS.primary, 0.38),
    },
    aboutFeedbackEmailText: {
      fontSize: scaleSize(12),
      fontWeight: "700",
      color: COLORS.primary,
    },
    aboutFeedbackGithubBtn: {
      backgroundColor: addOpacity(COLORS.surface, 0.9),
      borderColor: addOpacity(COLORS.border, 0.75),
    },
    aboutFeedbackGithubText: {
      fontSize: scaleSize(12),
      fontWeight: "700",
      color: COLORS.textPrimary,
    },
    aboutLegalRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: hScaleSize(8),
      marginBottom: scaleSize(14),
    },
    aboutLegalChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: hScaleSize(5),
      backgroundColor: addOpacity(COLORS.surfaceElevated, 0.75),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.border, 0.55),
      borderRadius: scaleSize(12),
      paddingHorizontal: hScaleSize(11),
      paddingVertical: scaleSize(7),
    },
    aboutLegalChipText: {
      fontSize: scaleSize(11.5),
      fontWeight: "600",
      color: COLORS.textSecondary,
    },
    aboutColophon: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: hScaleSize(5),
      paddingTop: scaleSize(2),
    },
    aboutColophonText: {
      fontSize: scaleSize(11.5),
      color: COLORS.textMuted,
      fontWeight: "500",
    },
  });

export type AboutModalStyles = ReturnType<typeof getAboutModalStyles>;
