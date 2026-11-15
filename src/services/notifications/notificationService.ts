import * as Notifications from "expo-notifications";
import { AndroidImportance } from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { getSpotlightMolecule } from "../../constants/spotlightMolecules";
import { COLORS } from "../../constants/colors";
import { SavedCompoundItem } from "../../types";
import { formatSubscriptFormula } from "../../utils/formula";

export {
  SPOTLIGHT_MOLECULES,
  type SpotlightMolecule,
} from "../../constants/spotlightMolecules";

export const NOTIFICATION_CHANNEL_IDS = {
  APP_UPDATES: "app_updates",
  DISCOVERIES: "discoveries",
} as const;

export type NotificationChannelId =
  (typeof NOTIFICATION_CHANNEL_IDS)[keyof typeof NOTIFICATION_CHANNEL_IDS];

export const SCHEDULED_NOTIFICATION_IDS = {
  WEEKLY_SPOTLIGHT: "weekly_spotlight",
  BOOKMARK_RETENTION: "bookmark_retention",
} as const;

export const NOTIF_PERMISSION_ASKED_KEY = "@moluxis_notif_permission_asked_v1";

const FOURTEEN_DAYS_IN_SECONDS = 14 * 24 * 60 * 60;

/**
 * Configure foreground notification behavior once at module load.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Configure Android notification channels (required on Android 8.0+ / API 26+).
 */
export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS !== "android") return;

  await Promise.all([
    Notifications.setNotificationChannelAsync(
      NOTIFICATION_CHANNEL_IDS.APP_UPDATES,
      {
        name: "App Updates & Releases",
        description:
          "Notifications for new releases, APKs, and changelog highlights",
        importance: AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: COLORS.emerald,
      },
    ),
    Notifications.setNotificationChannelAsync(
      NOTIFICATION_CHANNEL_IDS.DISCOVERIES,
      {
        name: "Molecule Discoveries",
        description:
          "Weekly featured molecule spotlights and saved library reminders",
        importance: AndroidImportance.DEFAULT,
      },
    ),
  ]);
}

/**
 * Request notification permission (POST_NOTIFICATIONS on Android 13+).
 * Avoids re-prompting on every launch if the user has already been asked unless `forcePrompt` is true.
 */
export async function requestNotificationPermission(
  options: { forcePrompt?: boolean } = {},
): Promise<boolean> {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    if (existingStatus === "granted") {
      return true;
    }

    if (!options.forcePrompt) {
      const alreadyAsked = await AsyncStorage.getItem(
        NOTIF_PERMISSION_ASKED_KEY,
      );
      if (alreadyAsked === "true") {
        return false;
      }
    }

    await AsyncStorage.setItem(NOTIF_PERMISSION_ASKED_KEY, "true");
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.warn("Notification permission check failed:", error);
    return false;
  }
}

export async function getNotificationPermissionStatus(): Promise<Notifications.PermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

/**
 * Send an immediate local notification routed to a specific Android channel.
 * In Expo SDK 58+, `channelId` is passed on `trigger` via ChannelAwareTriggerInput.
 */
export async function sendImmediateNotification(
  channelId: NotificationChannelId,
  content: Notifications.NotificationContentInput,
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content,
    trigger: Platform.OS === "android" ? { channelId } : null,
  });
}

/**
 * Schedule an offline weekly Molecule Spotlight notification.
 * Uses SchedulableTriggerInputTypes.WEEKLY on Android (CALENDAR is iOS-only).
 */
export async function scheduleWeeklyMoleculeSpotlight(
  moleculeIndex?: number,
): Promise<string | null> {
  try {
    await Notifications.cancelScheduledNotificationAsync(
      SCHEDULED_NOTIFICATION_IDS.WEEKLY_SPOTLIGHT,
    ).catch(() => {});

    const molecule = getSpotlightMolecule(moleculeIndex);
    if (!molecule) return null;

    const formattedFormula =
      molecule.formattedFormula || formatSubscriptFormula(molecule.formula);
    const formulaPart = formattedFormula ? ` (${formattedFormula})` : "";

    const trigger: Notifications.NotificationTriggerInput =
      Platform.OS === "ios"
        ? {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            weekday: 7, // Saturday (1 = Sunday .. 7 = Saturday)
            hour: 10,
            minute: 0,
            repeats: true,
          }
        : {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: 7, // Saturday
            hour: 10,
            minute: 0,
            channelId: NOTIFICATION_CHANNEL_IDS.DISCOVERIES,
          };

    const body =
      molecule.description ||
      `Explore the 3D structure and chemical properties of this ${molecule.tag.toLowerCase()}.`;

    return await Notifications.scheduleNotificationAsync({
      identifier: SCHEDULED_NOTIFICATION_IDS.WEEKLY_SPOTLIGHT,
      content: {
        title: `Molecule Spotlight: ${molecule.name}${formulaPart}`,
        body,
        data: {
          type: "MOLECULE_SPOTLIGHT",
          query: molecule.query,
          url: `moluxis://molecule?query=${encodeURIComponent(molecule.query)}`,
        },
      },
      trigger,
    });
  } catch (error) {
    console.warn("Failed to schedule weekly molecule spotlight:", error);
    return null;
  }
}

/**
 * Schedule a 14-day retention reminder if the user has bookmarked compounds.
 * Call whenever the app becomes active or bookmarks change to reset the inactivity timer.
 */
export async function scheduleBookmarkRetentionReminder(
  bookmarks: SavedCompoundItem[],
  delaySeconds = FOURTEEN_DAYS_IN_SECONDS,
): Promise<string | null> {
  try {
    await Notifications.cancelScheduledNotificationAsync(
      SCHEDULED_NOTIFICATION_IDS.BOOKMARK_RETENTION,
    ).catch(() => {});

    if (!bookmarks || bookmarks.length === 0) {
      return null;
    }

    const previewNames = bookmarks
      .slice(0, 2)
      .map((item) => item.name)
      .join(" and ");
    const body =
      bookmarks.length === 1
        ? `Revisit ${previewNames} in 3D and explore new compounds!`
        : `You have ${bookmarks.length} saved molecules including ${previewNames}. Tap to continue exploring!`;

    return await Notifications.scheduleNotificationAsync({
      identifier: SCHEDULED_NOTIFICATION_IDS.BOOKMARK_RETENTION,
      content: {
        title: "Your Molecular Library Awaits",
        body,
        data: {
          type: "OPEN_BOOKMARKS",
          url: "moluxis://bookmarks",
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(1, Math.round(delaySeconds)),
        repeats: false,
        channelId: NOTIFICATION_CHANNEL_IDS.DISCOVERIES,
      },
    });
  } catch (error) {
    console.warn("Failed to schedule bookmark retention reminder:", error);
    return null;
  }
}

/**
 * Dev/testing helper: trigger an immediate or delayed Molecule Spotlight notification.
 */
export async function triggerTestSpotlightNotification(
  delaySeconds = 0,
  moleculeIndex?: number,
): Promise<string | null> {
  const molecule = getSpotlightMolecule(moleculeIndex);
  if (!molecule) return null;

  const formattedFormula =
    molecule.formattedFormula || formatSubscriptFormula(molecule.formula);
  const formulaPart = formattedFormula ? ` (${formattedFormula})` : "";

  const body =
    molecule.description ||
    `Tap to inspect the 3D structure of this ${molecule.tag.toLowerCase()}.`;

  const content: Notifications.NotificationContentInput = {
    title: `Molecule Spotlight: ${molecule.name}${formulaPart}`,
    body,
    data: {
      type: "MOLECULE_SPOTLIGHT",
      query: molecule.query,
      url: `moluxis://molecule?query=${encodeURIComponent(molecule.query)}`,
    },
  };

  if (delaySeconds > 0) {
    return Notifications.scheduleNotificationAsync({
      content,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(1, Math.round(delaySeconds)),
        repeats: false,
        channelId: NOTIFICATION_CHANNEL_IDS.DISCOVERIES,
      },
    });
  }

  return sendImmediateNotification(
    NOTIFICATION_CHANNEL_IDS.DISCOVERIES,
    content,
  );
}
