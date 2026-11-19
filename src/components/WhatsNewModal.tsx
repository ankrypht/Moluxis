import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Pressable,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  CURRENT_RELEASE_NOTES,
  ReleaseHighlight,
  markCurrentVersionSeen,
} from "../services/updates/updateNoticeService";
import { COLORS } from "../constants/colors";
import { triggerImpactLight } from "../utils/haptics";
import { WhatsNewModalStyles } from "./WhatsNewModal.styles";
import { useDialogScaleAnimation } from "../hooks/useModalAnimation";

export interface WhatsNewModalProps {
  visible: boolean;
  releaseNotes?: ReleaseHighlight | null;
  onClose: () => void;
  styles: WhatsNewModalStyles;
}

export const WhatsNewModal: React.FC<WhatsNewModalProps> = React.memo(
  ({ visible, releaseNotes, onClose, styles }) => {
    const notes = releaseNotes || CURRENT_RELEASE_NOTES;
    const { fadeAnim, scaleAnim } = useDialogScaleAnimation(visible);

    const handleDismiss = useCallback(async () => {
      triggerImpactLight();
      await markCurrentVersionSeen(notes.version);
      onClose();
    }, [notes.version, onClose]);

    if (!visible) {
      return null;
    }

    return (
      <View
        style={styles.whatsNewOverlay}
        testID="whats-new-modal"
        accessibilityViewIsModal={true}
      >
        <Animated.View style={[styles.whatsNewBackdrop, { opacity: fadeAnim }]}>
          <Pressable
            style={{ flex: 1 }}
            onPress={handleDismiss}
            accessible={false}
            testID="whats-new-backdrop"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.whatsNewCard,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.whatsNewHeader}>
            <View style={styles.whatsNewVersionPill}>
              <Text allowFontScaling={false} style={styles.whatsNewVersionText}>
                v{notes.version}
              </Text>
            </View>
            <Text allowFontScaling={false} style={styles.whatsNewTitle}>
              What&apos;s New in Moluxis
            </Text>
            <Text allowFontScaling={false} style={styles.whatsNewDate}>
              {notes.releaseDate}
            </Text>
          </View>

          <ScrollView
            style={styles.whatsNewScroll}
            contentContainerStyle={styles.whatsNewScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {notes.features.length > 0 && (
              <>
                <Text
                  allowFontScaling={false}
                  style={[styles.whatsNewSectionTitle, { marginTop: 2 }]}
                >
                  New Features
                </Text>
                {notes.features.map((item, idx) => (
                  <View key={`feat-${idx}`} style={styles.whatsNewItemRow}>
                    <Ionicons
                      name="sparkles"
                      size={15}
                      color={COLORS.emerald}
                      style={styles.whatsNewItemIcon}
                    />
                    <Text
                      allowFontScaling={false}
                      style={styles.whatsNewItemText}
                    >
                      {item}
                    </Text>
                  </View>
                ))}
              </>
            )}

            {notes.improvements.length > 0 && (
              <>
                <Text
                  allowFontScaling={false}
                  style={styles.whatsNewSectionTitle}
                >
                  Performance & UI
                </Text>
                {notes.improvements.map((item, idx) => (
                  <View key={`imp-${idx}`} style={styles.whatsNewItemRow}>
                    <Ionicons
                      name="flash"
                      size={15}
                      color={COLORS.cyan}
                      style={styles.whatsNewItemIcon}
                    />
                    <Text
                      allowFontScaling={false}
                      style={styles.whatsNewItemText}
                    >
                      {item}
                    </Text>
                  </View>
                ))}
              </>
            )}

            {notes.fixes.length > 0 && (
              <>
                <Text
                  allowFontScaling={false}
                  style={styles.whatsNewSectionTitle}
                >
                  Bug Fixes
                </Text>
                {notes.fixes.map((item, idx) => (
                  <View key={`fix-${idx}`} style={styles.whatsNewItemRow}>
                    <Ionicons
                      name="checkmark-circle"
                      size={15}
                      color={COLORS.purple}
                      style={styles.whatsNewItemIcon}
                    />
                    <Text
                      allowFontScaling={false}
                      style={styles.whatsNewItemText}
                    >
                      {item}
                    </Text>
                  </View>
                ))}
              </>
            )}
          </ScrollView>

          <TouchableOpacity
            testID="whats-new-dismiss-button"
            accessibilityRole="button"
            style={styles.whatsNewPrimaryBtn}
            onPress={handleDismiss}
            activeOpacity={0.82}
          >
            <Text allowFontScaling={false} style={styles.whatsNewPrimaryText}>
              Got It
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  },
);

WhatsNewModal.displayName = "WhatsNewModal";
