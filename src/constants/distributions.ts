import { Linking, Platform } from "react-native";
import * as Application from "expo-application";
import pkg from "../../package.json";

export const APP_NAME = "Moluxis";
export const APP_AUTHOR = "Ankush Sarkar";
export const APP_LICENSE = "Apache 2.0";
export const CONTACT_EMAIL = "ankushsarkar128@gmail.com";

export function getAppVersion(): string {
  return Application.nativeApplicationVersion || pkg.version;
}

export const ANDROID_PACKAGE_ID = "com.ankushsarkar.moluxis";
export const GITHUB_REPO = "ankrypht/Moluxis";
export const GITHUB_REPO_URL = `https://github.com/${GITHUB_REPO}`;
export const GITHUB_ISSUES_URL = `${GITHUB_REPO_URL}/issues`;
export const GITHUB_LICENSE_URL = `${GITHUB_REPO_URL}/blob/main/LICENSE`;
export const PRIVACY_POLICY_URL =
  "https://ankrypht.github.io/Moluxis/privacy.html";
export const CONTACT_MAILTO_URL = `mailto:${CONTACT_EMAIL}?subject=Moluxis%20Feedback`;

export function getFeedbackMailtoUrl(
  appVersion: string = getAppVersion(),
): string {
  const subject = encodeURIComponent(
    `${APP_NAME} v${appVersion} — Bug Report / Feature Suggestion`,
  );
  const body = encodeURIComponent(
    `Hi ${APP_AUTHOR},\n\nApp Version: v${appVersion}\nPlatform: ${Platform.OS}\n\nDetails:\n`,
  );
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_ID}`;
export const PLAY_STORE_MARKET_URI = `market://details?id=${ANDROID_PACKAGE_ID}`;

export interface DataSourceCredit {
  id: string;
  name: string;
  description: string;
  url: string;
}

export const DATA_SOURCES: readonly DataSourceCredit[] = [
  {
    id: "pubchem",
    name: "PubChem",
    description: "NIH chemical compound structures, properties & GHS safety",
    url: "https://pubchem.ncbi.nlm.nih.gov/",
  },
  {
    id: "cod",
    name: "Crystallography Open Database",
    description: "Open-access 3D crystal lattices & mineral unit cells",
    url: "https://www.crystallography.net/",
  },
  {
    id: "3dmol",
    name: "3Dmol.js",
    description: "Hardware-accelerated WebGL molecular visualization engine",
    url: "https://3dmol.csb.pitt.edu/",
  },
];

export interface AppReleaseInfo {
  version: string;
  releaseTitle?: string;
  releaseUrl: string;
  isNewer: boolean;
}

/**
 * Safely opens an external URL in the system browser or handler app.
 * Returns true if opened, false if opening failed.
 */
export async function openExternalUrl(url: string): Promise<boolean> {
  try {
    await Linking.openURL(url);
    return true;
  } catch (error) {
    console.warn(`Failed to open external URL (${url}):`, error);
    return false;
  }
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
