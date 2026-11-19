import { Platform } from "react-native";
import * as TaskManager from "expo-task-manager";
import * as BackgroundTask from "expo-background-task";
import * as notificationService from "../../notifications/notificationService";
import * as appUpdateChecker from "../appUpdateChecker";
import {
  BACKGROUND_UPDATE_INTERVAL_MINUTES,
  BACKGROUND_UPDATE_TASK_NAME,
  executeBackgroundUpdateCheck,
  getBackgroundUpdateTaskStatus,
  isBackgroundUpdateTaskRegistered,
  registerBackgroundUpdateTask,
  triggerBackgroundUpdateTaskForTesting,
  unregisterBackgroundUpdateTask,
} from "../backgroundUpdateTask";

jest.mock("../appUpdateChecker", () => ({
  checkForAppUpdate: jest.fn(),
  notifyUpdateAvailable: jest.fn(),
}));

jest.mock("../../notifications/notificationService", () => ({
  NOTIFICATION_CHANNEL_IDS: {
    APP_UPDATES: "app_updates",
    DISCOVERIES: "discoveries",
  },
  setupNotificationChannels: jest.fn().mockResolvedValue(undefined),
  getNotificationPermissionStatus: jest.fn().mockResolvedValue("granted"),
}));

describe("backgroundUpdateTask", () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    (Platform as { OS: string }).OS = "android";
    (TaskManager.isAvailableAsync as jest.Mock).mockResolvedValue(true);
    (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);
    (BackgroundTask.registerTaskAsync as jest.Mock).mockResolvedValue(
      undefined,
    );
    (BackgroundTask.unregisterTaskAsync as jest.Mock).mockResolvedValue(
      undefined,
    );
    (
      notificationService.setupNotificationChannels as jest.Mock
    ).mockResolvedValue(undefined);
    (
      notificationService.getNotificationPermissionStatus as jest.Mock
    ).mockResolvedValue("granted");
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  describe("constants & task definition", () => {
    it("defines the expected task name and 12-hour minimum interval", () => {
      expect(BACKGROUND_UPDATE_TASK_NAME).toBe(
        "moluxis-background-update-task",
      );
      expect(BACKGROUND_UPDATE_INTERVAL_MINUTES).toBe(720);
    });

    it("registers the task definition with TaskManager on module load", () => {
      expect(TaskManager.isTaskDefined(BACKGROUND_UPDATE_TASK_NAME)).toBe(true);
    });
  });

  describe("executeBackgroundUpdateCheck", () => {
    it("initializes channels and succeeds silently when no newer update exists", async () => {
      (appUpdateChecker.checkForAppUpdate as jest.Mock).mockResolvedValue(null);

      const result = await executeBackgroundUpdateCheck();

      expect(result).toBe(BackgroundTask.BackgroundTaskResult.Success);
      expect(
        notificationService.setupNotificationChannels,
      ).toHaveBeenCalledTimes(1);
      expect(appUpdateChecker.checkForAppUpdate).toHaveBeenCalledTimes(1);
      expect(appUpdateChecker.notifyUpdateAvailable).not.toHaveBeenCalled();
    });

    it("posts update notification when newer version exists and permission is granted", async () => {
      const mockRelease: appUpdateChecker.AppReleaseInfo = {
        version: "2.3.0",
        releaseTitle: "Moluxis v2.3.0",
        releaseUrl: "https://github.com/ankrypht/Moluxis/releases/latest",
        isNewer: true,
      };

      (appUpdateChecker.checkForAppUpdate as jest.Mock).mockResolvedValue(
        mockRelease,
      );
      (
        notificationService.getNotificationPermissionStatus as jest.Mock
      ).mockResolvedValue("granted");
      (appUpdateChecker.notifyUpdateAvailable as jest.Mock).mockResolvedValue(
        "notif-123",
      );

      const result = await executeBackgroundUpdateCheck();

      expect(result).toBe(BackgroundTask.BackgroundTaskResult.Success);
      expect(appUpdateChecker.notifyUpdateAvailable).toHaveBeenCalledWith(
        mockRelease,
      );
    });

    it("returns early without waking radio or checking network if permission is not granted", async () => {
      const mockRelease: appUpdateChecker.AppReleaseInfo = {
        version: "2.3.0",
        releaseTitle: "Moluxis v2.3.0",
        releaseUrl: "https://github.com/ankrypht/Moluxis/releases/latest",
        isNewer: true,
      };

      (appUpdateChecker.checkForAppUpdate as jest.Mock).mockResolvedValue(
        mockRelease,
      );
      (
        notificationService.getNotificationPermissionStatus as jest.Mock
      ).mockResolvedValue("denied");

      const result = await executeBackgroundUpdateCheck();

      expect(result).toBe(BackgroundTask.BackgroundTaskResult.Success);
      expect(
        notificationService.setupNotificationChannels,
      ).not.toHaveBeenCalled();
      expect(appUpdateChecker.checkForAppUpdate).not.toHaveBeenCalled();
      expect(appUpdateChecker.notifyUpdateAvailable).not.toHaveBeenCalled();
    });

    it("returns Failed when update check throws an error", async () => {
      (appUpdateChecker.checkForAppUpdate as jest.Mock).mockRejectedValue(
        new Error("Network timeout"),
      );

      const result = await executeBackgroundUpdateCheck();

      expect(result).toBe(BackgroundTask.BackgroundTaskResult.Failed);
      expect(warnSpy).toHaveBeenCalledWith(
        "Background update check error:",
        expect.any(Error),
      );
    });
  });

  describe("registerBackgroundUpdateTask", () => {
    it("returns false on unsupported platforms (e.g. web)", async () => {
      (Platform as { OS: string }).OS = "web";

      const registered = await registerBackgroundUpdateTask();

      expect(registered).toBe(false);
      expect(BackgroundTask.registerTaskAsync).not.toHaveBeenCalled();
    });

    it("returns false if TaskManager API is unavailable", async () => {
      (TaskManager.isAvailableAsync as jest.Mock).mockResolvedValue(false);

      const registered = await registerBackgroundUpdateTask();

      expect(registered).toBe(false);
      expect(BackgroundTask.registerTaskAsync).not.toHaveBeenCalled();
    });

    it("registers the task with WorkManager when not already registered", async () => {
      (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);

      const registered = await registerBackgroundUpdateTask();

      expect(registered).toBe(true);
      expect(BackgroundTask.registerTaskAsync).toHaveBeenCalledWith(
        BACKGROUND_UPDATE_TASK_NAME,
        {
          minimumInterval: BACKGROUND_UPDATE_INTERVAL_MINUTES,
        },
      );
    });

    it("does not re-register if already registered", async () => {
      (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(true);

      const registered = await registerBackgroundUpdateTask();

      expect(registered).toBe(true);
      expect(BackgroundTask.registerTaskAsync).not.toHaveBeenCalled();
    });

    it("accepts custom minimumInterval override", async () => {
      (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);

      const registered = await registerBackgroundUpdateTask({
        minimumInterval: 60,
      });

      expect(registered).toBe(true);
      expect(BackgroundTask.registerTaskAsync).toHaveBeenCalledWith(
        BACKGROUND_UPDATE_TASK_NAME,
        {
          minimumInterval: 60,
        },
      );
    });

    it("handles registration exceptions gracefully", async () => {
      (TaskManager.isTaskRegisteredAsync as jest.Mock).mockRejectedValue(
        new Error("WorkManager init failed"),
      );

      const registered = await registerBackgroundUpdateTask();

      expect(registered).toBe(false);
      expect(warnSpy).toHaveBeenCalledWith(
        "Failed to register background update task:",
        expect.any(Error),
      );
    });
  });

  describe("unregisterBackgroundUpdateTask", () => {
    it("unregisters the task when currently registered", async () => {
      (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(true);

      const unregistered = await unregisterBackgroundUpdateTask();

      expect(unregistered).toBe(true);
      expect(BackgroundTask.unregisterTaskAsync).toHaveBeenCalledWith(
        BACKGROUND_UPDATE_TASK_NAME,
      );
    });

    it("skips unregister call if task was not registered", async () => {
      (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);

      const unregistered = await unregisterBackgroundUpdateTask();

      expect(unregistered).toBe(true);
      expect(BackgroundTask.unregisterTaskAsync).not.toHaveBeenCalled();
    });

    it("handles unregister errors gracefully", async () => {
      (TaskManager.isTaskRegisteredAsync as jest.Mock).mockRejectedValue(
        new Error("Unregister failure"),
      );

      const unregistered = await unregisterBackgroundUpdateTask();

      expect(unregistered).toBe(false);
      expect(warnSpy).toHaveBeenCalledWith(
        "Failed to unregister background update task:",
        expect.any(Error),
      );
    });
  });

  describe("status & test helpers", () => {
    it("reports registration status correctly", async () => {
      (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValueOnce(
        true,
      );
      expect(await isBackgroundUpdateTaskRegistered()).toBe(true);

      (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValueOnce(
        false,
      );
      expect(await isBackgroundUpdateTaskRegistered()).toBe(false);
    });

    it("gets background task status from BackgroundTask API", async () => {
      (BackgroundTask.getStatusAsync as jest.Mock).mockResolvedValue(
        BackgroundTask.BackgroundTaskStatus.Available,
      );

      const status = await getBackgroundUpdateTaskStatus();

      expect(status).toBe(BackgroundTask.BackgroundTaskStatus.Available);
      expect(BackgroundTask.getStatusAsync).toHaveBeenCalledTimes(1);
    });

    it("triggers task worker for testing in dev mode", async () => {
      (
        BackgroundTask.triggerTaskWorkerForTestingAsync as jest.Mock
      ).mockResolvedValue(true);

      const triggered = await triggerBackgroundUpdateTaskForTesting();

      expect(triggered).toBe(true);
      expect(
        BackgroundTask.triggerTaskWorkerForTestingAsync,
      ).toHaveBeenCalledTimes(1);
    });
  });
});
