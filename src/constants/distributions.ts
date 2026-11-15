import { Linking } from "react-native";

export const ANDROID_PACKAGE_ID = "com.ankushsarkar.moluxis";
export const GITHUB_REPO = "ankrypht/Moluxis";
export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_ID}`;
export const PLAY_STORE_MARKET_URI = `market://details?id=${ANDROID_PACKAGE_ID}`;

export interface AppReleaseInfo {
  version: string;
  releaseTitle?: string;
  releaseUrl: string;
  isNewer: boolean;
}

/**
 * Opens Google Play Store via native market:// URI with fallback to HTTPS web link.
 * Safe for Android 11+ (avoids package visibility restrictions with Linking.canOpenURL).
 */
export async function openPlayStoreUpdate(): Promise<void> {
  try {
    await Linking.openURL(PLAY_STORE_MARKET_URI);
  } catch {
    await Linking.openURL(PLAY_STORE_URL);
  }
}
