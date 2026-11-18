import { Linking } from "react-native";
import * as Application from "expo-application";
import pkg from "../../../package.json";
import {
  ANDROID_PACKAGE_ID,
  APP_AUTHOR,
  APP_LICENSE,
  APP_NAME,
  CONTACT_EMAIL,
  CONTACT_MAILTO_URL,
  DATA_SOURCES,
  GITHUB_ISSUES_URL,
  GITHUB_LICENSE_URL,
  GITHUB_REPO,
  GITHUB_REPO_URL,
  PLAY_STORE_MARKET_URI,
  PLAY_STORE_URL,
  PRIVACY_POLICY_URL,
  getAppVersion,
  getFeedbackMailtoUrl,
  openExternalUrl,
  openPlayStoreUpdate,
} from "../distributions";

jest.mock("expo-application", () => ({
  nativeApplicationVersion: null,
}));

describe("distributions / store configuration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (
      Application as { nativeApplicationVersion: string | null }
    ).nativeApplicationVersion = null;
  });

  it("exports correct app metadata, GitHub URLs, and Play Store URIs", () => {
    expect(APP_NAME).toBe("Moluxis");
    expect(APP_AUTHOR).toBe("Ankush Sarkar");
    expect(APP_LICENSE).toBe("Apache 2.0");
    expect(CONTACT_EMAIL).toBe("ankushsarkar128@gmail.com");
    expect(ANDROID_PACKAGE_ID).toBe("com.ankushsarkar.moluxis");
    expect(GITHUB_REPO).toBe("ankrypht/Moluxis");
    expect(GITHUB_REPO_URL).toBe("https://github.com/ankrypht/Moluxis");
    expect(GITHUB_ISSUES_URL).toBe(
      "https://github.com/ankrypht/Moluxis/issues",
    );
    expect(GITHUB_LICENSE_URL).toBe(
      "https://github.com/ankrypht/Moluxis/blob/main/LICENSE",
    );
    expect(PRIVACY_POLICY_URL).toBe(
      "https://ankrypht.github.io/Moluxis/privacy.html",
    );
    expect(CONTACT_MAILTO_URL).toContain("mailto:ankushsarkar128@gmail.com");
    expect(PLAY_STORE_MARKET_URI).toBe(
      "market://details?id=com.ankushsarkar.moluxis",
    );
    expect(PLAY_STORE_URL).toBe(
      "https://play.google.com/store/apps/details?id=com.ankushsarkar.moluxis",
    );
    expect(DATA_SOURCES.map((s) => s.id)).toEqual(["pubchem", "cod", "3dmol"]);
    expect(getAppVersion()).toBe(pkg.version);

    (
      Application as { nativeApplicationVersion: string | null }
    ).nativeApplicationVersion = "2.5.0";
    expect(getAppVersion()).toBe("2.5.0");

    const feedbackMailto = getFeedbackMailtoUrl("2.5.0");
    expect(feedbackMailto).toContain("mailto:ankushsarkar128@gmail.com?");
    expect(feedbackMailto).toContain("subject=");
    expect(feedbackMailto).toContain("2.5.0");
    expect(feedbackMailto).toContain("body=");
  });

  it("opens external URL safely and returns true on success", async () => {
    const openSpy = jest
      .spyOn(Linking, "openURL")
      .mockResolvedValueOnce(undefined as never);

    const opened = await openExternalUrl(GITHUB_REPO_URL);

    expect(opened).toBe(true);
    expect(openSpy).toHaveBeenCalledWith(GITHUB_REPO_URL);
    openSpy.mockRestore();
  });

  it("returns false and warns without throwing when openExternalUrl fails", async () => {
    const openSpy = jest
      .spyOn(Linking, "openURL")
      .mockRejectedValueOnce(new Error("Cannot open URL"));
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const opened = await openExternalUrl(GITHUB_REPO_URL);

    expect(opened).toBe(false);
    expect(warnSpy).toHaveBeenCalled();
    openSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it("opens Play Store via native market:// URI when available", async () => {
    const openSpy = jest
      .spyOn(Linking, "openURL")
      .mockResolvedValueOnce(undefined as never);

    await openPlayStoreUpdate();

    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(openSpy).toHaveBeenCalledWith(PLAY_STORE_MARKET_URI);
    openSpy.mockRestore();
  });

  it("falls back to HTTPS Play Store URL when market:// fails", async () => {
    const openSpy = jest
      .spyOn(Linking, "openURL")
      .mockRejectedValueOnce(new Error("No market app"))
      .mockResolvedValueOnce(undefined as never);

    await openPlayStoreUpdate();

    expect(openSpy).toHaveBeenNthCalledWith(1, PLAY_STORE_MARKET_URI);
    expect(openSpy).toHaveBeenNthCalledWith(2, PLAY_STORE_URL);
    openSpy.mockRestore();
  });

  it("re-throws error when both market:// and web fallback fail", async () => {
    const openSpy = jest
      .spyOn(Linking, "openURL")
      .mockRejectedValue(new Error("Cannot open browser"));

    await expect(openPlayStoreUpdate()).rejects.toThrow("Cannot open browser");
    openSpy.mockRestore();
  });
});
