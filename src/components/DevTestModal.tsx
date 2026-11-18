import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { COLORS } from "../constants/colors";
import { SavedCompoundItem } from "../types";
import { triggerImpactLight, triggerSelectionHaptic } from "../utils/haptics";
import { useModalBackHandler } from "../hooks/useModalBackHandler";
import {
  NOTIFICATION_CHANNEL_IDS,
  NOTIF_PERMISSION_ASKED_KEY,
  getNotificationPermissionStatus,
  requestNotificationPermission,
  scheduleBookmarkRetentionReminder,
  scheduleWeeklyMoleculeSpotlight,
  sendImmediateNotification,
  setupNotificationChannels,
  triggerTestSpotlightNotification,
} from "../services/notifications/notificationService";
import {
  AppReleaseInfo,
  NOTIFIED_UPDATE_VERSION_KEY,
  SNOOZE_UPDATE_KEY,
  getInstalledAppVersion,
} from "../services/updates/appUpdateChecker";
import {
  CURRENT_RELEASE_NOTES,
  LAST_SEEN_VERSION_KEY,
  ReleaseHighlight,
} from "../services/updates/updateNoticeService";
import {
  isBackgroundUpdateTaskRegistered,
  registerBackgroundUpdateTask,
  triggerBackgroundUpdateTaskForTesting,
} from "../services/updates/backgroundUpdateTask";
import { DevTestModalStyles } from "./DevTestModal.styles";

export interface DevTestModalProps {
  visible: boolean;
  onClose: () => void;
  styles: DevTestModalStyles;
  bookmarks: SavedCompoundItem[];
  onPreviewUpdateModal: () => void;
  onPreviewWhatsNewModal: (notes: ReleaseHighlight) => void;
  onRunLiveUpdateCheck: () => Promise<AppReleaseInfo | null>;
  onRefreshVersionNotice: () => Promise<{ shouldShowModal: boolean }>;
}

interface DiagnosticsState {
  permissionStatus: string;
  appVersion: string;
  snoozeUntil: string;
  notifiedVersion: string;
  lastSeenVersion: string;
  scheduledIds: string[];
  backgroundTaskRegistered: boolean;
}

const INITIAL_DIAGNOSTICS: DiagnosticsState = {
  permissionStatus: "loading...",
  appVersion: getInstalledAppVersion(),
  snoozeUntil: "none",
  notifiedVersion: "none",
  lastSeenVersion: "none",
  scheduledIds: [],
  backgroundTaskRegistered: false,
};

export const DevTestModal: React.FC<DevTestModalProps> = React.memo(
  ({
    visible,
    onClose,
    styles,
    bookmarks,
    onPreviewUpdateModal,
    onPreviewWhatsNewModal,
    onRunLiveUpdateCheck,
    onRefreshVersionNotice,
  }) => {
    const [diag, setDiag] = useState<DiagnosticsState>(INITIAL_DIAGNOSTICS);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const refreshDiagnostics = useCallback(async () => {
      try {
        const [
          permissionStatus,
          snoozeRaw,
          notifiedVer,
          lastSeen,
          scheduled,
          isBgRegistered,
        ] = await Promise.all([
          getNotificationPermissionStatus(),
          AsyncStorage.getItem(SNOOZE_UPDATE_KEY),
          AsyncStorage.getItem(NOTIFIED_UPDATE_VERSION_KEY),
          AsyncStorage.getItem(LAST_SEEN_VERSION_KEY),
          Notifications.getAllScheduledNotificationsAsync().catch(() => []),
          isBackgroundUpdateTaskRegistered(),
        ]);

        let snoozeText = "none";
        if (snoozeRaw) {
          const ts = parseInt(snoozeRaw, 10);
          snoozeText = Number.isFinite(ts)
            ? new Date(ts).toLocaleString()
            : snoozeRaw;
        }

        setDiag({
          permissionStatus: String(permissionStatus),
          appVersion: getInstalledAppVersion(),
          snoozeUntil: snoozeText,
          notifiedVersion: notifiedVer || "none",
          lastSeenVersion: lastSeen || "none",
          scheduledIds: scheduled.map((req) => req.identifier),
          backgroundTaskRegistered: isBgRegistered,
        });
      } catch (error) {
        setStatusMessage(`Diagnostics error: ${String(error)}`);
      }
    }, []);

    useEffect(() => {
      if (visible) {
        setStatusMessage(null);
        refreshDiagnostics();
      }
    }, [visible, refreshDiagnostics]);

    useModalBackHandler(visible, onClose);

    const runAction = useCallback(
      async (label: string, fn: () => Promise<void> | void) => {
        triggerImpactLight();
        try {
          await fn();
          setStatusMessage(label);
        } catch (error) {
          setStatusMessage(`Failed: ${String(error)}`);
        } finally {
          await refreshDiagnostics();
        }
      },
      [refreshDiagnostics],
    );

    const triggerDevUpdateNotification = useCallback(async () => {
      const content: Notifications.NotificationContentInput = {
        title: "Moluxis Update Available (v9.9.0)",
        body: "Moluxis v9.9.0 is ready on Google Play. Tap to update.",
        data: {
          type: "APP_UPDATE",
          url: "moluxis://update",
          version: "9.9.0",
          isDevPreview: true,
        },
      };
      await sendImmediateNotification(
        NOTIFICATION_CHANNEL_IDS.APP_UPDATES,
        content,
      );
    }, []);

    const triggerDelayedBookmarkNotification = useCallback(async () => {
      const sampleBookmarks: SavedCompoundItem[] =
        bookmarks.length > 0
          ? bookmarks
          : [
              { name: "Caffeine", formula: "C8H10N4O2", timestamp: Date.now() },
              { name: "Aspirin", formula: "C9H8O4", timestamp: Date.now() },
            ];
      await scheduleBookmarkRetentionReminder(sampleBookmarks, 5);
    }, [bookmarks]);

    if (!visible) {
      return null;
    }

    return (
      <View
        style={styles.devOverlay}
        testID="dev-test-modal"
        accessibilityViewIsModal={true}
      >
        <Pressable
          style={styles.devBackdrop}
          onPress={onClose}
          accessible={false}
          testID="dev-test-backdrop"
        />

        <View style={styles.devCard}>
          <View style={styles.devHeader}>
            <View style={styles.devTitleRow}>
              <View style={styles.devBadge}>
                <Ionicons name="flask-outline" size={18} color={COLORS.amber} />
              </View>
              <View>
                <Text allowFontScaling={false} style={styles.devTitle}>
                  Dev Notification &amp; Update Lab
                </Text>
                <Text allowFontScaling={false} style={styles.devSubtitle}>
                  Dev build diagnostics &amp; modal triggers
                </Text>
              </View>
            </View>

            <TouchableOpacity
              testID="dev-test-close-button"
              style={styles.devCloseBtn}
              onPress={() => {
                triggerSelectionHaptic();
                onClose();
              }}
              accessibilityRole="button"
              accessibilityLabel="Close dev test lab"
            >
              <Ionicons name="close" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.devScroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Diagnostics */}
            <Text
              allowFontScaling={false}
              style={[styles.devSectionTitle, { marginTop: 2 }]}
            >
              Live Diagnostics
            </Text>
            <View style={styles.devDiagnosticsBox}>
              <Text allowFontScaling={false} style={styles.devDiagLine}>
                Permission:{" "}
                <Text style={styles.devDiagValue}>{diag.permissionStatus}</Text>{" "}
                • Platform:{" "}
                <Text style={styles.devDiagValue}>{Platform.OS}</Text>
              </Text>
              <Text allowFontScaling={false} style={styles.devDiagLine}>
                Store: <Text style={styles.devDiagValue}>Google Play</Text> •
                Version:{" "}
                <Text style={styles.devDiagValue}>{diag.appVersion}</Text>
              </Text>
              <Text allowFontScaling={false} style={styles.devDiagLine}>
                Last Seen:{" "}
                <Text style={styles.devDiagValue}>{diag.lastSeenVersion}</Text>{" "}
                • Notified:{" "}
                <Text style={styles.devDiagValue}>{diag.notifiedVersion}</Text>
              </Text>
              <Text allowFontScaling={false} style={styles.devDiagLine}>
                Snoozed Until:{" "}
                <Text style={styles.devDiagValue}>{diag.snoozeUntil}</Text>
              </Text>
              <Text allowFontScaling={false} style={styles.devDiagLine}>
                Scheduled ({diag.scheduledIds.length}):{" "}
                <Text style={styles.devDiagValue}>
                  {diag.scheduledIds.length > 0
                    ? diag.scheduledIds.join(", ")
                    : "none"}
                </Text>
              </Text>
              <Text allowFontScaling={false} style={styles.devDiagLine}>
                WorkManager Task:{" "}
                <Text style={styles.devDiagValue}>
                  {diag.backgroundTaskRegistered
                    ? "Registered"
                    : "Unregistered"}
                </Text>
              </Text>
            </View>

            {statusMessage && (
              <View
                style={styles.devStatusBanner}
                testID="dev-test-status-banner"
              >
                <Text allowFontScaling={false} style={styles.devStatusText}>
                  {statusMessage}
                </Text>
              </View>
            )}

            {/* Modal Previews */}
            <Text allowFontScaling={false} style={styles.devSectionTitle}>
              Update &amp; Changelog Modals
            </Text>
            <View style={styles.devButtonGrid}>
              <TouchableOpacity
                testID="dev-preview-update-modal"
                style={styles.devActionBtn}
                onPress={() => {
                  onClose();
                  onPreviewUpdateModal();
                }}
              >
                <Ionicons
                  name="logo-google-playstore"
                  size={15}
                  color={COLORS.emerald}
                />
                <Text allowFontScaling={false} style={styles.devActionText}>
                  Update: Play Store
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="dev-live-github-check"
                style={styles.devActionBtn}
                onPress={() =>
                  runAction("Live GitHub check finished", async () => {
                    const info = await onRunLiveUpdateCheck();
                    if (info) {
                      onClose();
                      setStatusMessage(
                        `Live check found newer v${info.version}`,
                      );
                    } else {
                      setStatusMessage(
                        "Live check: already up to date (or disabled)",
                      );
                    }
                  })
                }
              >
                <Ionicons
                  name="cloud-download-outline"
                  size={15}
                  color={COLORS.blue}
                />
                <Text allowFontScaling={false} style={styles.devActionText}>
                  Check Release API
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="dev-preview-whats-new"
                style={styles.devActionBtn}
                onPress={() => {
                  onClose();
                  onPreviewWhatsNewModal(CURRENT_RELEASE_NOTES);
                }}
              >
                <Ionicons
                  name="sparkles-outline"
                  size={15}
                  color={COLORS.emerald}
                />
                <Text allowFontScaling={false} style={styles.devActionText}>
                  What&apos;s New
                </Text>
              </TouchableOpacity>
            </View>

            {/* Notifications */}
            <Text allowFontScaling={false} style={styles.devSectionTitle}>
              Notification Cases (All Channels &amp; Delays)
            </Text>
            <View style={styles.devButtonGrid}>
              <TouchableOpacity
                testID="dev-notif-permission"
                style={styles.devActionBtn}
                onPress={() =>
                  runAction("Permission & channels updated", async () => {
                    await setupNotificationChannels();
                    const granted = await requestNotificationPermission({
                      forcePrompt: true,
                    });
                    setStatusMessage(
                      granted
                        ? "Notification permission granted"
                        : "Notification permission denied",
                    );
                  })
                }
              >
                <Ionicons
                  name="notifications-outline"
                  size={15}
                  color={COLORS.amber}
                />
                <Text allowFontScaling={false} style={styles.devActionText}>
                  Request Permission
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="dev-notif-update-playstore"
                style={styles.devActionBtn}
                onPress={() =>
                  runAction("Sent Play Store update notification", () =>
                    triggerDevUpdateNotification(),
                  )
                }
              >
                <Ionicons
                  name="arrow-up-circle-outline"
                  size={15}
                  color={COLORS.emerald}
                />
                <Text allowFontScaling={false} style={styles.devActionText}>
                  Notif: Play Update
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="dev-notif-spotlight-now"
                style={styles.devActionBtn}
                onPress={() =>
                  runAction("Sent immediate Molecule Spotlight", async () => {
                    await triggerTestSpotlightNotification(0);
                  })
                }
              >
                <Ionicons name="planet-outline" size={15} color={COLORS.cyan} />
                <Text allowFontScaling={false} style={styles.devActionText}>
                  Spotlight (Now)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="dev-notif-spotlight-5s"
                style={styles.devActionBtn}
                onPress={() =>
                  runAction(
                    "Spotlight scheduled in 5s — background/close app to test tap!",
                    async () => {
                      await triggerTestSpotlightNotification(5);
                    },
                  )
                }
              >
                <Ionicons name="timer-outline" size={15} color={COLORS.amber} />
                <Text allowFontScaling={false} style={styles.devActionText}>
                  Spotlight (5s Delay)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="dev-notif-bookmarks-5s"
                style={styles.devActionBtn}
                onPress={() =>
                  runAction(
                    "Bookmarks reminder scheduled in 5s!",
                    triggerDelayedBookmarkNotification,
                  )
                }
              >
                <Ionicons
                  name="bookmarks-outline"
                  size={15}
                  color={COLORS.warning}
                />
                <Text allowFontScaling={false} style={styles.devActionText}>
                  Bookmarks (5s Delay)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="dev-notif-schedule-prod"
                style={styles.devActionBtnFull}
                onPress={() =>
                  runAction(
                    "Scheduled weekly spotlight & 14d bookmark retention",
                    async () => {
                      await scheduleWeeklyMoleculeSpotlight();
                      await scheduleBookmarkRetentionReminder(
                        bookmarks.length > 0
                          ? bookmarks
                          : [
                              {
                                name: "Caffeine",
                                formula: "C8H10N4O2",
                                timestamp: Date.now(),
                              },
                            ],
                      );
                    },
                  )
                }
              >
                <Ionicons
                  name="calendar-outline"
                  size={15}
                  color={COLORS.emerald}
                />
                <Text allowFontScaling={false} style={styles.devActionText}>
                  Schedule Weekly Spotlight &amp; 14-Day Retention
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="dev-trigger-background-task"
                style={styles.devActionBtn}
                onPress={() =>
                  runAction(
                    "Triggered WorkManager background update check",
                    async () => {
                      const success =
                        await triggerBackgroundUpdateTaskForTesting();
                      setStatusMessage(
                        success
                          ? "Background update check executed successfully"
                          : "Background update check reported failure",
                      );
                    },
                  )
                }
              >
                <Ionicons
                  name="sync-outline"
                  size={15}
                  color={COLORS.emerald}
                />
                <Text allowFontScaling={false} style={styles.devActionText}>
                  Trigger WorkManager
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="dev-register-background-task"
                style={styles.devActionBtn}
                onPress={() =>
                  runAction("WorkManager task re-registered", async () => {
                    await registerBackgroundUpdateTask();
                  })
                }
              >
                <Ionicons
                  name="hardware-chip-outline"
                  size={15}
                  color={COLORS.cyan}
                />
                <Text allowFontScaling={false} style={styles.devActionText}>
                  Register WorkManager
                </Text>
              </TouchableOpacity>
            </View>

            {/* Resets */}
            <Text allowFontScaling={false} style={styles.devSectionTitle}>
              State &amp; Storage Resets
            </Text>
            <View style={styles.devButtonGrid}>
              <TouchableOpacity
                testID="dev-reset-snooze-and-dedupe"
                style={styles.devActionBtn}
                onPress={() =>
                  runAction("Cleared snooze & notified dedupe", async () => {
                    await AsyncStorage.multiRemove([
                      SNOOZE_UPDATE_KEY,
                      NOTIFIED_UPDATE_VERSION_KEY,
                      NOTIF_PERMISSION_ASKED_KEY,
                    ]);
                  })
                }
              >
                <Ionicons
                  name="refresh-outline"
                  size={15}
                  color={COLORS.primary}
                />
                <Text allowFontScaling={false} style={styles.devActionText}>
                  Reset Update State
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="dev-simulate-upgrade"
                style={styles.devActionBtn}
                onPress={() =>
                  runAction("Simulated upgrade notice", async () => {
                    await AsyncStorage.setItem(LAST_SEEN_VERSION_KEY, "0.0.0");
                    const res = await onRefreshVersionNotice();
                    if (res.shouldShowModal) {
                      onClose();
                    }
                  })
                }
              >
                <Ionicons
                  name="rocket-outline"
                  size={15}
                  color={COLORS.emerald}
                />
                <Text allowFontScaling={false} style={styles.devActionText}>
                  Simulate App Upgrade
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="dev-cancel-all-scheduled"
                style={[styles.devActionBtnFull, styles.devActionBtnDanger]}
                onPress={() =>
                  runAction(
                    "Cancelled all scheduled notifications",
                    async () => {
                      await Notifications.cancelAllScheduledNotificationsAsync();
                    },
                  )
                }
              >
                <Ionicons
                  name="trash-outline"
                  size={15}
                  color={COLORS.danger}
                />
                <Text
                  allowFontScaling={false}
                  style={[styles.devActionText, { color: COLORS.danger }]}
                >
                  Cancel All Scheduled Notifications
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  },
);

DevTestModal.displayName = "DevTestModal";
