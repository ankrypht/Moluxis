import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as distributions from "../../../constants/distributions";
import {
  LAST_UPDATE_CHECK_KEY,
  NOTIFIED_UPDATE_VERSION_KEY,
  SNOOZE_UPDATE_KEY,
  checkForAppUpdate,
  compareSemver,
  notifyUpdateAvailable,
  openUpdateDestination,
  snoozeUpdatePrompt,
} from "../appUpdateChecker";

const mockSendImmediateNotification = jest.fn().mockResolvedValue("notif-id");

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("expo-application", () => ({
  nativeApplicationVersion: "2.1.1",
}));

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {
        disableUpdateCheck: false,
      },
    },
  },
}));

jest.mock("../../notifications/notificationService", () => ({
  NOTIFICATION_CHANNEL_IDS: {
    APP_UPDATES: "app_updates",
    DISCOVERIES: "discoveries",
  },
  sendImmediateNotification: (...args: unknown[]) =>
    mockSendImmediateNotification(...args),
}));

describe("appUpdateChecker", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    (Platform as { OS: string }).OS = "android";
    Constants.expoConfig!.extra!.disableUpdateCheck = false;
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe("compareSemver", () => {
    it("compares semantic versions accurately", () => {
      expect(compareSemver("v2.2.0", "2.1.1")).toBe(1);
      expect(compareSemver("2.1.1", "2.2.0")).toBe(-1);
      expect(compareSemver("2.1.1", "v2.1.1")).toBe(0);
      expect(compareSemver("2.2.0-rc.1+42", "2.1.9")).toBe(1);
      expect(compareSemver("3.0", "2.9.9")).toBe(1);
    });
  });

  describe("checkForAppUpdate", () => {
    it("returns null immediately when disableUpdateCheck is true", async () => {
      Constants.expoConfig!.extra!.disableUpdateCheck = true;
      global.fetch = jest.fn();
      expect(await checkForAppUpdate()).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("respects 6h cooldown unless bypassCooldown is true", async () => {
      const recentCheck = String(Date.now() - 30 * 60 * 1000); // 30 minutes ago
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) =>
        key === LAST_UPDATE_CHECK_KEY
          ? Promise.resolve(recentCheck)
          : Promise.resolve(null),
      );
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ tag_name: "v2.5.0", assets: [] }),
      });

      expect(await checkForAppUpdate()).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();

      const bypassed = await checkForAppUpdate({ bypassCooldown: true });
      expect(bypassed?.version).toBe("2.5.0");
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("cancels cleanly when an aborted signal is provided", async () => {
      const controller = new AbortController();
      controller.abort();
      global.fetch = jest.fn();

      expect(await checkForAppUpdate({ signal: controller.signal })).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("persists check timestamp on check attempt", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ tag_name: "v2.1.1" }),
      });

      await checkForAppUpdate();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        LAST_UPDATE_CHECK_KEY,
        expect.any(String),
      );
    });

    it("respects 24h snooze unless bypassSnooze is true", async () => {
      const future = String(Date.now() + 60_000);
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) =>
        key === SNOOZE_UPDATE_KEY
          ? Promise.resolve(future)
          : Promise.resolve(null),
      );
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ tag_name: "v2.5.0", assets: [] }),
      });

      expect(await checkForAppUpdate()).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();

      const bypassed = await checkForAppUpdate({ bypassSnooze: true });
      expect(bypassed?.version).toBe("2.5.0");
    });

    it("returns parsed release info when a newer release exists", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          tag_name: "v2.2.0",
          name: "Moluxis 2.2.0",
          body: "Added measurements & notifications",
          html_url: "https://github.com/ankrypht/Moluxis/releases/tag/v2.2.0",
        }),
      });

      const info = await checkForAppUpdate();
      expect(info).toEqual({
        version: "2.2.0",
        releaseTitle: "Moluxis 2.2.0",
        releaseUrl: "https://github.com/ankrypht/Moluxis/releases/tag/v2.2.0",
        isNewer: true,
      });
    });

    it("returns null when latest version is equal or older", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ tag_name: "v2.1.1" }),
      });
      expect(await checkForAppUpdate()).toBeNull();
    });

    it("returns null when fetch fails or response is not ok", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });
      expect(await checkForAppUpdate()).toBeNull();
    });
  });

  describe("notifyUpdateAvailable & snooze", () => {
    it("sends update notification once per version unless forced", async () => {
      const info = {
        version: "2.2.0",
        releaseTitle: "Moluxis 2.2.0",
        releaseUrl: "https://github.com/ankrypht/Moluxis/releases/latest",
        isNewer: true,
      };

      await notifyUpdateAvailable(info);
      expect(mockSendImmediateNotification).toHaveBeenCalledWith(
        "app_updates",
        expect.objectContaining({
          title: "Moluxis Update Available (v2.2.0)",
          body: "Moluxis v2.2.0 is ready on Google Play. Tap to update.",
          data: expect.objectContaining({ url: "moluxis://update" }),
        }),
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        NOTIFIED_UPDATE_VERSION_KEY,
        "2.2.0",
      );

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("2.2.0");
      expect(await notifyUpdateAvailable(info)).toBeNull();
      expect(mockSendImmediateNotification).toHaveBeenCalledTimes(1);

      await notifyUpdateAvailable(info, { force: true });
      expect(mockSendImmediateNotification).toHaveBeenCalledTimes(2);
    });

    it("persists snooze timestamp for 24h", async () => {
      await snoozeUpdatePrompt(24);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        SNOOZE_UPDATE_KEY,
        expect.any(String),
      );
    });

    it("opens update destination via openPlayStoreUpdate", async () => {
      const openSpy = jest
        .spyOn(distributions, "openPlayStoreUpdate")
        .mockResolvedValueOnce(undefined);

      await openUpdateDestination();
      expect(openSpy).toHaveBeenCalledTimes(1);
      openSpy.mockRestore();
    });
  });
});
