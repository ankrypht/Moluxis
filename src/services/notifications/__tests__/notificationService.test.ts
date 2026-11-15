import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { AndroidImportance } from "expo-notifications";
import {
  NOTIFICATION_CHANNEL_IDS,
  NOTIF_PERMISSION_ASKED_KEY,
  SCHEDULED_NOTIFICATION_IDS,
  requestNotificationPermission,
  scheduleBookmarkRetentionReminder,
  scheduleWeeklyMoleculeSpotlight,
  sendImmediateNotification,
  setupNotificationChannels,
  triggerTestSpotlightNotification,
} from "../notificationService";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(null),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue("scheduled-id"),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
  AndroidImportance: {
    LOW: 2,
    DEFAULT: 3,
    HIGH: 4,
  },
  SchedulableTriggerInputTypes: {
    TIME_INTERVAL: "timeInterval",
    WEEKLY: "weekly",
    CALENDAR: "calendar",
  },
}));

describe("notificationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Platform as { OS: string }).OS = "android";
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "granted",
    });
  });

  it("creates both Android notification channels", async () => {
    await setupNotificationChannels();
    expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledTimes(2);
    expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
      NOTIFICATION_CHANNEL_IDS.APP_UPDATES,
      expect.objectContaining({ importance: AndroidImportance.HIGH }),
    );
    expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
      NOTIFICATION_CHANNEL_IDS.DISCOVERIES,
      expect.objectContaining({
        importance: AndroidImportance.DEFAULT,
      }),
    );
  });

  it("requests notification permission once if undetermined and respects already-asked flag", async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "undetermined",
    });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
      status: "denied",
    });

    const first = await requestNotificationPermission();
    expect(first).toBe(false);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      NOTIF_PERMISSION_ASKED_KEY,
      "true",
    );

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("true");
    const second = await requestNotificationPermission();
    expect(second).toBe(false);
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);

    const forced = await requestNotificationPermission({ forcePrompt: true });
    expect(forced).toBe(false);
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(2);
  });

  it("passes channelId on trigger for immediate Android notifications", async () => {
    await sendImmediateNotification(NOTIFICATION_CHANNEL_IDS.APP_UPDATES, {
      title: "Test",
      body: "Body",
    });

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
      content: { title: "Test", body: "Body" },
      trigger: { channelId: NOTIFICATION_CHANNEL_IDS.APP_UPDATES },
    });
  });

  it("schedules weekly molecule spotlight with formatted subscript formula", async () => {
    await scheduleWeeklyMoleculeSpotlight(0);

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      SCHEDULED_NOTIFICATION_IDS.WEEKLY_SPOTLIGHT,
    );

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
      identifier: SCHEDULED_NOTIFICATION_IDS.WEEKLY_SPOTLIGHT,
      content: expect.objectContaining({
        title: "Molecule Spotlight: Caffeine (C₈H₁₀N₄O₂)",
        body: expect.stringContaining("coffee and tea"),
        data: expect.objectContaining({
          type: "MOLECULE_SPOTLIGHT",
          url: "moluxis://molecule?query=Caffeine",
        }),
      }),
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 7,
        hour: 10,
        minute: 0,
        channelId: NOTIFICATION_CHANNEL_IDS.DISCOVERIES,
      },
    });
  });

  it("schedules spotlight for other molecules in the catalog when indexed", async () => {
    // Index 1 is Dopamine (C8H11NO2 -> C₈H₁₁NO₂)
    await scheduleWeeklyMoleculeSpotlight(1);

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: SCHEDULED_NOTIFICATION_IDS.WEEKLY_SPOTLIGHT,
        content: expect.objectContaining({
          title: "Molecule Spotlight: Dopamine (C₈H₁₁NO₂)",
          body: expect.stringContaining("catecholamine neurotransmitter"),
          data: expect.objectContaining({
            type: "MOLECULE_SPOTLIGHT",
            query: "Dopamine",
            url: "moluxis://molecule?query=Dopamine",
          }),
        }),
      }),
    );
  });

  it("triggers test spotlight notification with formatted subscript formula", async () => {
    // Immediate (delaySeconds = 0)
    await triggerTestSpotlightNotification(0);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: expect.stringMatching(
            /Molecule Spotlight: .* \([A-Za-z₀-₉()]+\)/,
          ),
          data: expect.objectContaining({
            type: "MOLECULE_SPOTLIGHT",
          }),
        }),
        trigger: { channelId: NOTIFICATION_CHANNEL_IDS.DISCOVERIES },
      }),
    );

    // Delayed (delaySeconds = 5)
    await triggerTestSpotlightNotification(5);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: expect.stringMatching(
            /Molecule Spotlight: .* \([A-Za-z₀-₉()]+\)/,
          ),
          data: expect.objectContaining({
            type: "MOLECULE_SPOTLIGHT",
          }),
        }),
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 5,
          repeats: false,
          channelId: NOTIFICATION_CHANNEL_IDS.DISCOVERIES,
        },
      }),
    );
  });

  it("schedules 14-day bookmark retention only when bookmarks exist", async () => {
    await scheduleBookmarkRetentionReminder([]);
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      SCHEDULED_NOTIFICATION_IDS.BOOKMARK_RETENTION,
    );
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();

    await scheduleBookmarkRetentionReminder([
      { name: "Caffeine", formula: "C8H10N4O2", timestamp: 1 },
      { name: "Aspirin", formula: "C9H8O4", timestamp: 2 },
    ]);

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: SCHEDULED_NOTIFICATION_IDS.BOOKMARK_RETENTION,
        trigger: expect.objectContaining({
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 14 * 24 * 60 * 60,
          repeats: false,
          channelId: NOTIFICATION_CHANNEL_IDS.DISCOVERIES,
        }),
      }),
    );
  });
});
