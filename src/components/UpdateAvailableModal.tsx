import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppReleaseInfo } from "../constants/distributions";
import {
  openUpdateDestination,
  snoozeUpdatePrompt,
} from "../services/updates/appUpdateChecker";
import { COLORS } from "../constants/colors";
import { triggerImpactLight, triggerSelectionHaptic } from "../utils/haptics";
import { UpdateAvailableModalStyles } from "./UpdateAvailableModal.styles";
import { useModalBackHandler } from "../hooks/useModalBackHandler";
import { useDialogScaleAnimation } from "../hooks/useModalAnimation";

export interface UpdateAvailableModalProps {
  visible: boolean;
  releaseInfo: AppReleaseInfo | null;
  onDismiss: () => void;
  styles: UpdateAvailableModalStyles;
}

export const UpdateAvailableModal: React.FC<UpdateAvailableModalProps> =
  React.memo(({ visible, releaseInfo, onDismiss, styles }) => {
    const { fadeAnim, scaleAnim } = useDialogScaleAnimation(visible);

    useModalBackHandler(visible, onDismiss);

    const handleRemindLater = useCallback(async () => {
      triggerSelectionHaptic();
      await snoozeUpdatePrompt(24);
      onDismiss();
    }, [onDismiss]);

    const handleUpdate = useCallback(async () => {
      if (!releaseInfo) return;
      triggerImpactLight();
      try {
        await openUpdateDestination();
      } catch (error) {
        console.warn("Failed to open update destination:", error);
      } finally {
        onDismiss();
      }
    }, [releaseInfo, onDismiss]);

    if (!visible || !releaseInfo) {
      return null;
    }

    return (
      <View
        style={styles.updateOverlay}
        testID="update-available-modal"
        accessibilityViewIsModal={true}
      >
        <Animated.View style={[styles.updateBackdrop, { opacity: fadeAnim }]}>
          <Pressable
            style={{ flex: 1 }}
            onPress={onDismiss}
            accessible={false}
            testID="update-modal-backdrop"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.updateCard,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.updateHeader}>
            <View style={styles.updateBadgeRow}>
              <View style={styles.updateVersionBadge}>
                <Ionicons
                  name="sparkles-outline"
                  size={13}
                  color={COLORS.emerald}
                />
                <Text allowFontScaling={false} style={styles.updateVersionText}>
                  v{releaseInfo.version} Available
                </Text>
              </View>
            </View>

            <Text allowFontScaling={false} style={styles.updateTitle}>
              Update Available
            </Text>
          </View>

          <Text allowFontScaling={false} style={styles.updateDescriptionText}>
            A newer version of Moluxis (v{releaseInfo.version}) is ready on
            Google Play with new features, performance improvements, and bug
            fixes.
          </Text>

          <TouchableOpacity
            testID="update-primary-button"
            accessibilityRole="button"
            style={styles.updatePrimaryBtn}
            onPress={handleUpdate}
            activeOpacity={0.82}
          >
            <Ionicons
              name="logo-google-playstore"
              size={18}
              color={COLORS.textOnPrimary}
            />
            <Text allowFontScaling={false} style={styles.updatePrimaryBtnText}>
              Update on Google Play
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="update-snooze-button"
            accessibilityRole="button"
            style={styles.updateSnoozeBtn}
            onPress={handleRemindLater}
            activeOpacity={0.75}
          >
            <Text allowFontScaling={false} style={styles.updateSnoozeText}>
              Remind Me Later (24h)
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  });

UpdateAvailableModal.displayName = "UpdateAvailableModal";
