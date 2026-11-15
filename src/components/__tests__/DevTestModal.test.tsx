import React from "react";
import { render, fireEvent, act, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { getScaleMetrics } from "../../utils/scaling";
import { DevTestModal } from "../DevTestModal";
import { getDevTestModalStyles } from "../DevTestModal.styles";
import {
  scheduleBookmarkRetentionReminder,
  scheduleWeeklyMoleculeSpotlight,
  sendImmediateNotification,
  triggerTestSpotlightNotification,
} from "../../services/notifications/notificationService";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  multiRemove: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("expo-notifications", () => ({
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(null),
  setNotificationHandler: jest.fn(),
  AndroidImportance: { LOW: 2, DEFAULT: 3, HIGH: 4 },
  SchedulableTriggerInputTypes: {
    TIME_INTERVAL: "timeInterval",
    WEEKLY: "weekly",
  },
}));

jest.mock("expo-application", () => ({
  nativeApplicationVersion: "2.1.1",
}));

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {
        isDevVariant: true,
      },
    },
  },
}));

jest.mock("../../services/notifications/notificationService", () => ({
  NOTIFICATION_CHANNEL_IDS: {
    APP_UPDATES: "app_updates",
    DISCOVERIES: "discoveries",
  },
  NOTIF_PERMISSION_ASKED_KEY: "@moluxis_notif_permission_asked_v1",
  getNotificationPermissionStatus: jest.fn().mockResolvedValue("granted"),
  setupNotificationChannels: jest.fn().mockResolvedValue(undefined),
  requestNotificationPermission: jest.fn().mockResolvedValue(true),
  sendImmediateNotification: jest.fn().mockResolvedValue("notif-1"),
  triggerTestSpotlightNotification: jest.fn().mockResolvedValue("notif-2"),
  scheduleBookmarkRetentionReminder: jest.fn().mockResolvedValue("notif-3"),
  scheduleWeeklyMoleculeSpotlight: jest.fn().mockResolvedValue("notif-4"),
}));

jest.mock("../../utils/haptics", () => ({
  triggerImpactLight: jest.fn(),
  triggerSelectionHaptic: jest.fn(),
}));

const metrics = getScaleMetrics(360, 736, {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
});
const styles = getDevTestModalStyles(metrics);

describe("DevTestModal", () => {
  const onClose = jest.fn();
  const onPreviewUpdateModal = jest.fn();
  const onPreviewWhatsNewModal = jest.fn();
  const onRunLiveUpdateCheck = jest.fn().mockResolvedValue(null);
  const onRefreshVersionNotice = jest
    .fn()
    .mockResolvedValue({ shouldShowModal: true });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("triggers modal preview cases including Play Store update and What's New", async () => {
    const { getByTestId } = render(
      <DevTestModal
        visible={true}
        onClose={onClose}
        styles={styles}
        bookmarks={[]}
        onPreviewUpdateModal={onPreviewUpdateModal}
        onPreviewWhatsNewModal={onPreviewWhatsNewModal}
        onRunLiveUpdateCheck={onRunLiveUpdateCheck}
        onRefreshVersionNotice={onRefreshVersionNotice}
      />,
    );

    await waitFor(() => {
      expect(getByTestId("dev-test-modal")).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(getByTestId("dev-preview-update-modal"));
    });
    expect(onPreviewUpdateModal).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(getByTestId("dev-preview-whats-new"));
    });
    expect(onPreviewWhatsNewModal).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(getByTestId("dev-live-github-check"));
    });
    expect(onRunLiveUpdateCheck).toHaveBeenCalled();
  });

  it("triggers immediate Play Store update and delayed notifications across channels", async () => {
    const { getByTestId } = render(
      <DevTestModal
        visible={true}
        onClose={onClose}
        styles={styles}
        bookmarks={[]}
        onPreviewUpdateModal={onPreviewUpdateModal}
        onPreviewWhatsNewModal={onPreviewWhatsNewModal}
        onRunLiveUpdateCheck={onRunLiveUpdateCheck}
        onRefreshVersionNotice={onRefreshVersionNotice}
      />,
    );

    await act(async () => {
      fireEvent.press(getByTestId("dev-notif-update-playstore"));
    });
    expect(sendImmediateNotification).toHaveBeenCalledWith(
      "app_updates",
      expect.objectContaining({
        data: expect.objectContaining({
          type: "APP_UPDATE",
          isDevPreview: true,
        }),
      }),
    );

    await act(async () => {
      fireEvent.press(getByTestId("dev-notif-spotlight-now"));
    });
    expect(triggerTestSpotlightNotification).toHaveBeenCalledWith(0);

    await act(async () => {
      fireEvent.press(getByTestId("dev-notif-spotlight-5s"));
    });
    expect(triggerTestSpotlightNotification).toHaveBeenCalledWith(5);

    await act(async () => {
      fireEvent.press(getByTestId("dev-notif-bookmarks-5s"));
    });
    expect(scheduleBookmarkRetentionReminder).toHaveBeenCalledWith(
      expect.any(Array),
      5,
    );

    await act(async () => {
      fireEvent.press(getByTestId("dev-notif-schedule-prod"));
    });
    expect(scheduleWeeklyMoleculeSpotlight).toHaveBeenCalled();
  });

  it("resets storage state, simulates upgrade, and cancels scheduled notifications", async () => {
    const { getByTestId } = render(
      <DevTestModal
        visible={true}
        onClose={onClose}
        styles={styles}
        bookmarks={[]}
        onPreviewUpdateModal={onPreviewUpdateModal}
        onPreviewWhatsNewModal={onPreviewWhatsNewModal}
        onRunLiveUpdateCheck={onRunLiveUpdateCheck}
        onRefreshVersionNotice={onRefreshVersionNotice}
      />,
    );

    await act(async () => {
      fireEvent.press(getByTestId("dev-reset-snooze-and-dedupe"));
    });
    expect(AsyncStorage.multiRemove).toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(getByTestId("dev-simulate-upgrade"));
    });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "@moluxis_last_seen_version_v1",
      "0.0.0",
    );
    expect(onRefreshVersionNotice).toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(getByTestId("dev-cancel-all-scheduled"));
    });
    expect(
      Notifications.cancelAllScheduledNotificationsAsync,
    ).toHaveBeenCalled();
  });
});
