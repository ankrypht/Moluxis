import { Linking } from "react-native";
import {
  ANDROID_PACKAGE_ID,
  GITHUB_REPO,
  PLAY_STORE_MARKET_URI,
  PLAY_STORE_URL,
  openPlayStoreUpdate,
} from "../distributions";

describe("distributions / store configuration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("exports correct Android package ID and Play Store URIs", () => {
    expect(ANDROID_PACKAGE_ID).toBe("com.ankushsarkar.moluxis");
    expect(GITHUB_REPO).toBe("ankrypht/Moluxis");
    expect(PLAY_STORE_MARKET_URI).toBe(
      "market://details?id=com.ankushsarkar.moluxis",
    );
    expect(PLAY_STORE_URL).toBe(
      "https://play.google.com/store/apps/details?id=com.ankushsarkar.moluxis",
    );
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
