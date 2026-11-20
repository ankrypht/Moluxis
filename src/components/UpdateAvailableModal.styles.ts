import { StyleSheet } from "react-native";
import { COLORS, addOpacity } from "../constants/colors";
import {
  createModalBackdropStyle,
  createDialogCardStyle,
} from "../constants/theme";
import { ScaleMetrics } from "../utils/scaling";

export const getUpdateAvailableModalStyles = ({
  isLandscape,
  insets,
  scaleSize,
}: ScaleMetrics) =>
  StyleSheet.create({
    updateOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9000,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: isLandscape
        ? Math.max(insets.left, insets.right, scaleSize(24))
        : scaleSize(20),
      paddingVertical: scaleSize(16),
    },
    updateBackdrop: createModalBackdropStyle(0.8),
    updateCard: createDialogCardStyle({
      maxWidth: isLandscape ? scaleSize(440) : scaleSize(340),
      scaleSize,
      borderOpacity: 0.8,
      borderRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 22,
      paddingBottom: 18,
      zIndex: 9010,
    }),
    updateHeader: {
      marginBottom: scaleSize(10),
    },
    updateBadgeRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: scaleSize(10),
    },
    updateVersionBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: scaleSize(5),
      backgroundColor: addOpacity(COLORS.emerald, 0.16),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.emerald, 0.35),
      paddingHorizontal: scaleSize(10),
      paddingVertical: scaleSize(4),
      borderRadius: scaleSize(10),
    },
    updateVersionText: {
      color: COLORS.emerald,
      fontWeight: "700",
      fontSize: scaleSize(12),
    },
    updateTitle: {
      color: COLORS.textPrimary,
      fontSize: scaleSize(18.5),
      fontWeight: "800",
      letterSpacing: -0.3,
    },
    updateDescriptionText: {
      color: COLORS.textSecondary,
      fontSize: scaleSize(13.5),
      lineHeight: scaleSize(20),
      marginBottom: scaleSize(18),
    },
    updatePrimaryBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: scaleSize(8),
      height: scaleSize(46),
      borderRadius: scaleSize(14),
      paddingHorizontal: scaleSize(16),
      backgroundColor: COLORS.emerald,
    },
    updatePrimaryBtnText: {
      color: COLORS.textOnPrimary,
      fontWeight: "700",
      fontSize: scaleSize(15),
    },
    updateSnoozeBtn: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: scaleSize(10),
      marginTop: scaleSize(4),
    },
    updateSnoozeText: {
      color: COLORS.textMuted,
      fontSize: scaleSize(12.5),
      fontWeight: "500",
    },
  });

export type UpdateAvailableModalStyles = ReturnType<
  typeof getUpdateAvailableModalStyles
>;
