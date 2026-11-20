import { StyleSheet } from "react-native";
import { COLORS, addOpacity } from "../constants/colors";
import {
  createModalBackdropStyle,
  createBottomSheetContainerStyle,
  createBottomSheetLandscapeStyle,
  createCircularCloseButtonStyle,
} from "../constants/theme";
import { ScaleMetrics } from "../utils/scaling";

export const getHistoryBookmarksModalStyles = ({
  isLandscape,
  insets,
  scaleSize,
}: ScaleMetrics) =>
  StyleSheet.create({
    backdrop: createModalBackdropStyle(0.75, {
      zIndex: 250,
      justifyContent: "flex-end",
    }),
    modalContainer: createBottomSheetContainerStyle({
      scaleSize,
      radius: 28,
      zIndex: 260,
    }),
    modalContainerLandscape: createBottomSheetLandscapeStyle(scaleSize, {
      left: "48%",
      width: "52%",
      radius: 28,
    }),
    modalHeader: {
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
    modalTopBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: scaleSize(10),
      width: "100%",
    },
    modalTitle: {
      fontSize: scaleSize(17),
      fontWeight: "800",
      color: COLORS.textPrimary,
      letterSpacing: -0.3,
      flexShrink: 1,
    },
    toggleSegmentContainer: {
      flexDirection: "row",
      backgroundColor: COLORS.surfaceElevated,
      borderRadius: scaleSize(12),
      padding: scaleSize(3),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.border, 0.6),
      width: "100%",
    },
    toggleSegmentButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: scaleSize(7),
      paddingHorizontal: scaleSize(8),
      borderRadius: scaleSize(9),
      gap: scaleSize(6),
    },
    toggleSegmentButtonActive: {
      backgroundColor: COLORS.primary,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.35,
      shadowRadius: 4,
      elevation: 3,
    },
    toggleSegmentText: {
      fontSize: scaleSize(13),
      fontWeight: "600",
      color: COLORS.textSecondary,
    },
    toggleSegmentTextActive: {
      color: COLORS.textOnPrimary,
      fontWeight: "800",
    },
    badgeCount: {
      backgroundColor: addOpacity(COLORS.surface, 0.6),
      paddingHorizontal: scaleSize(6),
      paddingVertical: scaleSize(1),
      borderRadius: scaleSize(8),
      marginLeft: scaleSize(2),
    },
    badgeCountActive: {
      backgroundColor: addOpacity(COLORS.background, 0.25),
    },
    badgeCountText: {
      fontSize: scaleSize(11),
      fontWeight: "700",
      color: COLORS.textPrimary,
    },
    headerRightActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: scaleSize(8),
      flexShrink: 0,
    },
    modalClearButton: {
      paddingVertical: scaleSize(6),
      paddingHorizontal: scaleSize(10),
      borderRadius: scaleSize(10),
      backgroundColor: addOpacity(COLORS.danger, 0.12),
      flexDirection: "row",
      alignItems: "center",
      gap: scaleSize(4),
    },
    modalClearButtonText: {
      fontSize: scaleSize(12),
      color: COLORS.danger,
      fontWeight: "700",
    },
    closeButton: createCircularCloseButtonStyle(scaleSize, 0.9, 32),
    listContent: {
      paddingLeft: scaleSize(20),
      paddingRight: isLandscape
        ? Math.max(insets.right, scaleSize(20))
        : scaleSize(20),
      paddingTop: scaleSize(12),
      paddingBottom: isLandscape
        ? Math.max(insets.bottom, scaleSize(16)) + scaleSize(16)
        : scaleSize(32),
    },
    itemCard: {
      backgroundColor: COLORS.surfaceElevated,
      borderRadius: scaleSize(16),
      padding: scaleSize(14),
      marginBottom: scaleSize(10),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.border, 0.6),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    itemLeftSection: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      marginRight: scaleSize(10),
    },
    iconBadge: {
      width: scaleSize(40),
      height: scaleSize(40),
      borderRadius: scaleSize(12),
      backgroundColor: addOpacity(COLORS.primary, 0.12),
      justifyContent: "center",
      alignItems: "center",
      marginRight: scaleSize(12),
    },
    iconBadgeFavorite: {
      backgroundColor: addOpacity(COLORS.warning, 0.15),
    },
    itemDetails: {
      flex: 1,
    },
    itemName: {
      fontSize: scaleSize(16),
      fontWeight: "800",
      color: COLORS.textPrimary,
      marginBottom: scaleSize(2),
    },
    itemMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: scaleSize(8),
      flexWrap: "wrap",
    },
    itemFormulaText: {
      fontSize: scaleSize(13),
      color: COLORS.textSecondary,
      fontWeight: "600",
    },
    itemTimeText: {
      fontSize: scaleSize(11),
      color: COLORS.textMuted,
      fontWeight: "500",
    },
    itemRightSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: scaleSize(4),
    },
    actionIconButton: {
      padding: scaleSize(8),
      borderRadius: scaleSize(8),
      justifyContent: "center",
      alignItems: "center",
    },
    emptyStateContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: scaleSize(48),
      paddingHorizontal: scaleSize(32),
    },
    emptyStateIconBadge: {
      width: scaleSize(68),
      height: scaleSize(68),
      borderRadius: scaleSize(34),
      backgroundColor: addOpacity(COLORS.surfaceElevated, 0.9),
      justifyContent: "center",
      alignItems: "center",
      marginBottom: scaleSize(16),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.border, 0.5),
    },
    emptyStateTitle: {
      fontSize: scaleSize(17),
      fontWeight: "800",
      color: COLORS.textPrimary,
      marginBottom: scaleSize(8),
      textAlign: "center",
    },
    emptyStateMessage: {
      fontSize: scaleSize(14),
      color: COLORS.textSecondary,
      textAlign: "center",
      lineHeight: scaleSize(20),
    },
  });

export type HistoryBookmarksModalStyles = ReturnType<
  typeof getHistoryBookmarksModalStyles
>;
