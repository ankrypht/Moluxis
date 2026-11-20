import AsyncStorage from "@react-native-async-storage/async-storage";
import releaseNotesData from "../../constants/releaseNotes.json";
import { getInstalledAppVersion } from "./appUpdateChecker";

export const LAST_SEEN_VERSION_KEY = "@moluxis_last_seen_version_v1";

export interface ReleaseHighlight {
  version: string;
  releaseDate: string;
  features: string[];
  improvements: string[];
  fixes: string[];
}

export const CURRENT_RELEASE_NOTES: ReleaseHighlight =
  releaseNotesData as ReleaseHighlight;

export interface VersionNoticeCheckResult {
  shouldShowModal: boolean;
  releaseNotes: ReleaseHighlight;
}

/**
 * Checks whether the app was upgraded since the previous launch.
 * On first install, silently records the current version without popping up a changelog modal.
 */
export async function checkVersionAndTriggerNotice(): Promise<VersionNoticeCheckResult> {
  const currentVersion = getInstalledAppVersion();
  const releaseNotes = CURRENT_RELEASE_NOTES;

  try {
    const lastSeenVersion = await AsyncStorage.getItem(LAST_SEEN_VERSION_KEY);

    if (!lastSeenVersion) {
      await AsyncStorage.setItem(LAST_SEEN_VERSION_KEY, currentVersion);
      return { shouldShowModal: false, releaseNotes };
    }

    if (lastSeenVersion !== currentVersion) {
      return { shouldShowModal: true, releaseNotes };
    }
  } catch (error) {
    console.warn("Error checking version notice:", error);
  }

  return { shouldShowModal: false, releaseNotes };
}

export async function markCurrentVersionSeen(
  version: string = getInstalledAppVersion(),
): Promise<void> {
  await AsyncStorage.setItem(LAST_SEEN_VERSION_KEY, version);
}
