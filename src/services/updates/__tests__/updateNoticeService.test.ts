import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  LAST_SEEN_VERSION_KEY,
  checkVersionAndTriggerNotice,
  markCurrentVersionSeen,
} from "../updateNoticeService";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../appUpdateChecker", () => ({
  getInstalledAppVersion: jest.fn(() => "2.1.1"),
}));

describe("updateNoticeService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  describe("checkVersionAndTriggerNotice", () => {
    it("stores current version silently on first install without showing modal", async () => {
      const res = await checkVersionAndTriggerNotice();
      expect(res.shouldShowModal).toBe(false);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        LAST_SEEN_VERSION_KEY,
        "2.1.1",
      );
    });

    it("triggers What's New modal when lastSeenVersion differs from current version", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("2.0.4");
      const res = await checkVersionAndTriggerNotice();
      expect(res.shouldShowModal).toBe(true);
      expect(res.releaseNotes.version).toBe("2.2.0");
    });

    it("does not trigger modal when version matches lastSeenVersion", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("2.1.1");
      const res = await checkVersionAndTriggerNotice();
      expect(res.shouldShowModal).toBe(false);
    });

    it("persists seen version in markCurrentVersionSeen", async () => {
      await markCurrentVersionSeen("2.2.0");
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        LAST_SEEN_VERSION_KEY,
        "2.2.0",
      );
    });
  });
});
