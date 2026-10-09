import { StyleSheet } from "react-native";
import { COLORS, addOpacity } from "../constants/colors";
import { ScaleMetrics } from "../utils/scaling";

export const getShareExportModalStyles = ({
  isLandscape,
  insets,
  scaleSize,
  hScaleSize,
}: ScaleMetrics) =>
  StyleSheet.create({
    shareBackdrop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: addOpacity(COLORS.background, 0.78),
      zIndex: 250,
      justifyContent: "flex-end",
    },
    shareModalContainer: {
      backgroundColor: COLORS.surface,
      borderTopLeftRadius: scaleSize(28),
      borderTopRightRadius: scaleSize(28),
      borderWidth: 1,
      borderColor: COLORS.border,
      zIndex: 260,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: -12 },
      shadowOpacity: 0.5,
      shadowRadius: 24,
      elevation: 25,
      overflow: "hidden",
      width: "100%",
    },
    shareModalContainerLandscape: {
      position: "absolute",
      top: 0,
      bottom: 0,
      right: 0,
      left: "48%",
      width: "52%",
      borderTopLeftRadius: scaleSize(28),
      borderBottomLeftRadius: scaleSize(28),
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    },
    shareModalHeader: {
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
    shareModalTopBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
    },
    shareModalTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: hScaleSize(10),
    },
    shareModalIconBadge: {
      width: scaleSize(32),
      height: scaleSize(32),
      borderRadius: scaleSize(10),
      backgroundColor: addOpacity(COLORS.primary, 0.15),
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: addOpacity(COLORS.primary, 0.3),
    },
    shareModalTitle: {
      fontSize: scaleSize(17),
      fontWeight: "800",
      color: COLORS.textPrimary,
      letterSpacing: -0.3,
    },
    shareModalSubtitle: {
      fontSize: scaleSize(12),
      color: COLORS.textMuted,
      fontWeight: "500",
      marginTop: scaleSize(2),
    },
    shareCloseButton: {
      width: scaleSize(32),
      height: scaleSize(32),
      borderRadius: scaleSize(16),
      backgroundColor: addOpacity(COLORS.surfaceElevated, 0.8),
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: addOpacity(COLORS.border, 0.6),
    },
    shareContentScroll: {
      flex: 1,
      paddingLeft: scaleSize(16),
      paddingRight: isLandscape
        ? Math.max(insets.right, scaleSize(16))
        : scaleSize(16),
      paddingTop: scaleSize(14),
    },
    shareContentContainer: {
      paddingBottom: isLandscape
        ? Math.max(insets.bottom, scaleSize(16)) + scaleSize(24)
        : Math.max(insets.bottom, scaleSize(20)) + scaleSize(24),
    },
    sharePreviewCard: {
      backgroundColor: COLORS.surfaceElevated,
      borderRadius: scaleSize(18),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.border, 0.7),
      padding: scaleSize(14),
      marginBottom: scaleSize(16),
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
    sharePreviewTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: hScaleSize(12),
    },
    sharePreviewMetaCol: {
      flex: 1,
    },
    sharePreviewMoleculeName: {
      fontSize: scaleSize(16),
      fontWeight: "800",
      color: COLORS.textPrimary,
      letterSpacing: 0.5,
      marginBottom: scaleSize(4),
    },
    sharePreviewFormulaRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: scaleSize(8),
    },
    sharePreviewBadgesRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: hScaleSize(6),
    },
    sharePreviewBadge: {
      paddingHorizontal: hScaleSize(8),
      paddingVertical: scaleSize(3),
      borderRadius: scaleSize(6),
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: hScaleSize(4),
    },
    sharePreviewBadgeText: {
      fontSize: scaleSize(11),
      fontWeight: "700",
    },
    sharePreviewImageContainer: {
      width: scaleSize(88),
      height: scaleSize(88),
      borderRadius: scaleSize(14),
      backgroundColor: COLORS.background,
      borderWidth: 1,
      borderColor: addOpacity(COLORS.border, 0.8),
      overflow: "hidden",
      position: "relative",
      justifyContent: "center",
      alignItems: "center",
    },
    sharePreviewImage: {
      width: "100%",
      height: "100%",
    },
    sharePreviewImagePlaceholder: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: scaleSize(4),
    },
    sharePreviewImagePlaceholderText: {
      fontSize: scaleSize(9),
      color: COLORS.textMuted,
      fontWeight: "600",
      marginTop: scaleSize(4),
      textAlign: "center",
    },
    sharePreviewRetakeButton: {
      position: "absolute",
      right: scaleSize(4),
      bottom: scaleSize(4),
      width: scaleSize(22),
      height: scaleSize(22),
      borderRadius: scaleSize(11),
      backgroundColor: addOpacity(COLORS.surface, 0.85),
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: addOpacity(COLORS.border, 0.8),
    },
    shareSectionLabel: {
      fontSize: scaleSize(11),
      fontWeight: "800",
      color: COLORS.textMuted,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginBottom: scaleSize(10),
      paddingLeft: scaleSize(2),
    },
    shareOptionsList: {
      gap: scaleSize(10),
      marginBottom: scaleSize(20),
    },
    shareOptionCard: {
      backgroundColor: addOpacity(COLORS.surfaceElevated, 0.6),
      borderRadius: scaleSize(16),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.border, 0.5),
      padding: scaleSize(12),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    shareOptionCardActive: {
      borderColor: addOpacity(COLORS.primary, 0.4),
      backgroundColor: addOpacity(COLORS.primary, 0.06),
    },
    shareOptionLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: hScaleSize(12),
      flex: 1,
      marginRight: hScaleSize(10),
    },
    shareOptionIconBadge: {
      width: scaleSize(38),
      height: scaleSize(38),
      borderRadius: scaleSize(12),
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
    },
    shareOptionTextCol: {
      flex: 1,
    },
    shareOptionTitle: {
      fontSize: scaleSize(14),
      fontWeight: "700",
      color: COLORS.textPrimary,
      marginBottom: scaleSize(2),
    },
    shareOptionDescription: {
      fontSize: scaleSize(11.5),
      color: COLORS.textSecondary,
      fontWeight: "500",
    },
    shareOptionActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: hScaleSize(6),
    },
    shareActionButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: hScaleSize(5),
      paddingHorizontal: hScaleSize(12),
      paddingVertical: scaleSize(8),
      borderRadius: scaleSize(10),
      borderWidth: 1,
    },
    shareActionButtonPrimary: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },
    shareActionButtonSecondary: {
      backgroundColor: addOpacity(COLORS.surfaceElevated, 0.9),
      borderColor: addOpacity(COLORS.border, 0.8),
    },
    shareActionButtonText: {
      fontSize: scaleSize(12),
      fontWeight: "700",
      color: COLORS.background,
    },
    shareActionButtonTextSecondary: {
      fontSize: scaleSize(12),
      fontWeight: "700",
      color: COLORS.textPrimary,
    },
  });

export type ShareExportModalStyles = ReturnType<
  typeof getShareExportModalStyles
>;
