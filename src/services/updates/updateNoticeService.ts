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

export interface ReleaseNotesValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a release notes object against a target version.
 * Used by build gates, CI scripts, and unit tests.
 */
export function validateReleaseNotes(
  notes: unknown,
  expectedVersion?: string,
): ReleaseNotesValidationResult {
  if (!notes || typeof notes !== "object") {
    return {
      valid: false,
      error: "Release notes must be a valid JSON object.",
    };
  }

  const candidate = notes as Partial<ReleaseHighlight>;

  if (typeof candidate.version !== "string" || !candidate.version.trim()) {
    return {
      valid: false,
      error: "Release notes 'version' is missing or empty.",
    };
  }

  if (expectedVersion && candidate.version !== expectedVersion) {
    return {
      valid: false,
      error: `Release notes version (${candidate.version}) does not match expected version (${expectedVersion}).`,
    };
  }

  const features = Array.isArray(candidate.features) ? candidate.features : [];
  const improvements = Array.isArray(candidate.improvements)
    ? candidate.improvements
    : [];
  const fixes = Array.isArray(candidate.fixes) ? candidate.fixes : [];

  const totalHighlights = features.length + improvements.length + fixes.length;
  if (totalHighlights === 0) {
    return {
      valid: false,
      error:
        "Release notes must contain at least one feature, improvement, or fix.",
    };
  }

  return { valid: true };
}

export const CURRENT_RELEASE_NOTES: ReleaseHighlight =
  releaseNotesData as ReleaseHighlight;

export const LATEST_RELEASE_NOTES: ReleaseHighlight = CURRENT_RELEASE_NOTES;

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
