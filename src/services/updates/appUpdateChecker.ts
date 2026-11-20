import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import {
  AppReleaseInfo,
  GITHUB_REPO,
  getAppVersion,
  openPlayStoreUpdate,
} from "../../constants/distributions";
import {
  NOTIFICATION_CHANNEL_IDS,
  sendImmediateNotification,
} from "../notifications/notificationService";

export const SNOOZE_UPDATE_KEY = "@moluxis_update_snooze_until_v1";
export const NOTIFIED_UPDATE_VERSION_KEY =
  "@moluxis_notified_update_version_v1";
export const LAST_UPDATE_CHECK_KEY = "@moluxis_last_update_check_timestamp_v1";
const UPDATE_CHECK_COOLDOWN_MS = 6 * 60 * 60 * 1000; // 6 hours

const UPDATE_FETCH_TIMEOUT_MS = 8000;

export type { AppReleaseInfo };

/**
 * Compare semantic versions (e.g. "2.2.0" vs "2.1.1", "v2.2.0-rc.1" vs "2.1.1").
 * Strips leading 'v', pre-release tags, and build metadata.
 * Returns > 0 if v1 > v2, < 0 if v1 < v2, 0 if equal.
 */
export function compareSemver(v1: string, v2: string): number {
  const sanitize = (v: string) =>
    v.replace(/^v/i, "").split("-")[0].split("+")[0].trim();

  const parts1 = sanitize(v1)
    .split(".")
    .map((n) => parseInt(n, 10) || 0);
  const parts2 = sanitize(v2)
    .split(".")
    .map((n) => parseInt(n, 10) || 0);

  const maxLen = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < maxLen; i++) {
    const p1 = parts1[i] ?? 0;
    const p2 = parts2[i] ?? 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

export function getInstalledAppVersion(): string {
  return getAppVersion();
}

function isUpdateCheckDisabled(): boolean {
  return Boolean(Constants.expoConfig?.extra?.disableUpdateCheck);
}

export interface CheckForUpdateOptions {
  bypassSnooze?: boolean;
  bypassCooldown?: boolean;
  signal?: AbortSignal;
}

/**
 * Fetch latest release from GitHub Releases API and check if a newer version exists.
 */
export async function checkForAppUpdate(
  options: CheckForUpdateOptions = {},
): Promise<AppReleaseInfo | null> {
  if (isUpdateCheckDisabled()) {
    return null;
  }

  if (options.signal?.aborted) {
    return null;
  }

  try {
    if (!options.bypassCooldown) {
      const lastCheck = await AsyncStorage.getItem(LAST_UPDATE_CHECK_KEY);
      if (lastCheck) {
        const parsed = parseInt(lastCheck, 10);
        if (
          Number.isFinite(parsed) &&
          Date.now() - parsed < UPDATE_CHECK_COOLDOWN_MS
        ) {
          return null;
        }
      }
    }

    if (!options.bypassSnooze) {
      const snoozedUntil = await AsyncStorage.getItem(SNOOZE_UPDATE_KEY);
      if (snoozedUntil) {
        const parsed = parseInt(snoozedUntil, 10);
        if (Number.isFinite(parsed) && Date.now() < parsed) {
          return null;
        }
      }
    }

    const controller = new AbortController();
    const onParentAbort = () => controller.abort(options.signal?.reason);
    if (options.signal) {
      options.signal.addEventListener("abort", onParentAbort);
    }
    const timeoutId = setTimeout(
      () => controller.abort(),
      UPDATE_FETCH_TIMEOUT_MS,
    );

    let response: Response;
    try {
      response = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
        {
          headers: { Accept: "application/vnd.github.v3+json" },
          signal: controller.signal,
        },
      );
    } finally {
      clearTimeout(timeoutId);
      if (options.signal) {
        options.signal.removeEventListener("abort", onParentAbort);
      }
    }

    // Record check timestamp so future startup checks respect the cooldown
    await AsyncStorage.setItem(LAST_UPDATE_CHECK_KEY, Date.now().toString());

    if (!response.ok) return null;

    const data = await response.json();
    const rawTag = typeof data.tag_name === "string" ? data.tag_name : "";
    const latestVersion = rawTag.replace(/^v/i, "").trim();
    if (!latestVersion) return null;

    const currentVersion = getInstalledAppVersion();
    if (compareSemver(latestVersion, currentVersion) <= 0) {
      return null;
    }

    return {
      version: latestVersion,
      releaseTitle:
        (typeof data.name === "string" && data.name.trim()) ||
        `Moluxis v${latestVersion}`,
      releaseUrl:
        (typeof data.html_url === "string" && data.html_url) ||
        `https://github.com/${GITHUB_REPO}/releases/latest`,
      isNewer: true,
    };
  } catch (error: any) {
    if (error?.name === "AbortError" || options.signal?.aborted) {
      return null;
    }
    console.warn("Update check failed:", error);
    return null;
  }
}

/**
 * Post an Android notification announcing a new release on Google Play, deduplicated per version unless forced.
 */
export async function notifyUpdateAvailable(
  info: AppReleaseInfo,
  options: { force?: boolean } = {},
): Promise<string | null> {
  try {
    if (!options.force) {
      const lastNotifiedVersion = await AsyncStorage.getItem(
        NOTIFIED_UPDATE_VERSION_KEY,
      );
      if (lastNotifiedVersion === info.version) {
        return null;
      }
    }

    const id = await sendImmediateNotification(
      NOTIFICATION_CHANNEL_IDS.APP_UPDATES,
      {
        title: `Moluxis Update Available (v${info.version})`,
        body: `Moluxis v${info.version} is ready on Google Play. Tap to update.`,
        data: {
          type: "APP_UPDATE",
          url: "moluxis://update",
          version: info.version,
        },
      },
    );

    if (!options.force) {
      await AsyncStorage.setItem(NOTIFIED_UPDATE_VERSION_KEY, info.version);
    }

    return id;
  } catch (error) {
    console.warn("Failed to post update notification:", error);
    return null;
  }
}

export async function snoozeUpdatePrompt(hours = 24): Promise<void> {
  const until = Date.now() + hours * 60 * 60 * 1000;
  await AsyncStorage.setItem(SNOOZE_UPDATE_KEY, until.toString());
}

export async function openUpdateDestination(): Promise<void> {
  await openPlayStoreUpdate();
}
