import { StyleSheet } from "react-native";
import { COLORS, addOpacity } from "../constants/colors";
import {
  createModalBackdropStyle,
  createDialogCardStyle,
} from "../constants/theme";
import { ScaleMetrics } from "../utils/scaling";

export const getWhatsNewModalStyles = ({
  isLandscape,
  height,
  insets,
  scaleSize,
}: ScaleMetrics) =>
  StyleSheet.create({
    whatsNewOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9100,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: isLandscape
        ? Math.max(insets.left, insets.right, scaleSize(24))
        : scaleSize(20),
      paddingVertical: scaleSize(16),
    },
    whatsNewBackdrop: createModalBackdropStyle(0.8),
    whatsNewCard: createDialogCardStyle({
      maxWidth: isLandscape ? scaleSize(480) : scaleSize(360),
      scaleSize,
      maxHeight: isLandscape ? Math.round(height * 0.9) : "82%",
      borderOpacity: 0.8,
      borderRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
      zIndex: 9110,
    }),
    whatsNewHeader: {
      alignItems: "center",
      marginBottom: scaleSize(12),
    },
    whatsNewVersionPill: {
      backgroundColor: addOpacity(COLORS.emerald, 0.16),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.emerald, 0.35),
      paddingHorizontal: scaleSize(12),
      paddingVertical: scaleSize(4),
      borderRadius: scaleSize(12),
      marginBottom: scaleSize(8),
    },
    whatsNewVersionText: {
      color: COLORS.emerald,
      fontWeight: "700",
      fontSize: scaleSize(12.5),
    },
    whatsNewTitle: {
      color: COLORS.textPrimary,
      fontSize: scaleSize(20),
      fontWeight: "800",
      letterSpacing: -0.3,
    },
    whatsNewDate: {
      color: COLORS.textMuted,
      fontSize: scaleSize(12),
      fontWeight: "500",
      marginTop: scaleSize(2),
    },
    whatsNewScroll: {
      maxHeight: isLandscape ? scaleSize(150) : scaleSize(260),
      backgroundColor: addOpacity(COLORS.background, 0.55),
      borderRadius: scaleSize(14),
      borderWidth: 1,
      borderColor: addOpacity(COLORS.border, 0.45),
      marginBottom: scaleSize(16),
    },
    whatsNewScrollContent: {
      paddingHorizontal: scaleSize(14),
      paddingTop: scaleSize(10),
      paddingBottom: scaleSize(14),
    },
    whatsNewSectionTitle: {
      color: COLORS.textPrimary,
      fontSize: scaleSize(13.5),
      fontWeight: "700",
      marginTop: scaleSize(10),
      marginBottom: scaleSize(6),
    },
    whatsNewItemRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: scaleSize(8),
      marginBottom: scaleSize(7),
    },
    whatsNewItemIcon: {
      marginTop: scaleSize(2),
    },
    whatsNewItemText: {
      flex: 1,
      color: COLORS.textSecondary,
      fontSize: scaleSize(13),
      lineHeight: scaleSize(18.5),
    },
    whatsNewPrimaryBtn: {
      width: "100%",
      height: scaleSize(44),
      borderRadius: scaleSize(14),
      backgroundColor: COLORS.emerald,
      justifyContent: "center",
      alignItems: "center",
    },
    whatsNewPrimaryText: {
      color: COLORS.textOnPrimary,
      fontWeight: "700",
      fontSize: scaleSize(14),
    },
  });

export type WhatsNewModalStyles = ReturnType<typeof getWhatsNewModalStyles>;
