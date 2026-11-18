import { Platform } from "react-native";
import * as TaskManager from "expo-task-manager";
import * as BackgroundTask from "expo-background-task";
import {
  getNotificationPermissionStatus,
  setupNotificationChannels,
} from "../notifications/notificationService";
import { checkForAppUpdate, notifyUpdateAvailable } from "./appUpdateChecker";

/**
 * Unique identifier for the WorkManager / BGTaskScheduler background update task.
 */
export const BACKGROUND_UPDATE_TASK_NAME = "moluxis-background-update-task";

/**
 * Interval in minutes between background checks.
 * Android WorkManager enforces a minimum of 15 minutes.
 * 12 hours (720 minutes) matches periodic system wakeup (Wi-Fi + charging window).
 */
export const BACKGROUND_UPDATE_INTERVAL_MINUTES = 12 * 60; // 12 hours

/**
 * Task executor called periodically by Android WorkManager / iOS BGTaskScheduler.
 * Runs silently in the background:
 * 1. Ensures notification channels are initialized.
 * 2. Checks GitHub Releases for a newer semver version.
 * 3. If a newer release exists and notifications are permitted, posts the update notification.
 */
export async function executeBackgroundUpdateCheck(): Promise<BackgroundTask.BackgroundTaskResult> {
  try {
    // 1. Guarantee Android notification channels exist in headless runtime
    await setupNotificationChannels();

    // 2. Fetch latest release semver from GitHub and compare to installed version
    const updateInfo = await checkForAppUpdate();
    if (!updateInfo || !updateInfo.isNewer) {
      return BackgroundTask.BackgroundTaskResult.Success;
    }

    // 3. Post notification if user has granted notification permissions
    const permissionStatus = await getNotificationPermissionStatus();
    if (permissionStatus === "granted") {
      await notifyUpdateAvailable(updateInfo);
    }

    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (error) {
    console.warn("Background update check error:", error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
}

/**
 * Register task definition in the global scope so headless JS runtimes can locate it.
 */
if (!TaskManager.isTaskDefined(BACKGROUND_UPDATE_TASK_NAME)) {
  TaskManager.defineTask(
    BACKGROUND_UPDATE_TASK_NAME,
    executeBackgroundUpdateCheck,
  );
}

/**
 * Schedules the periodic background check with the platform's background task scheduler
 * (Jetpack WorkManager on Android).
 */
export async function registerBackgroundUpdateTask(
  options: { minimumInterval?: number } = {},
): Promise<boolean> {
  try {
    if (Platform.OS !== "android" && Platform.OS !== "ios") {
      return false;
    }

    const isAvailable = await TaskManager.isAvailableAsync();
    if (!isAvailable) {
      return false;
    }

    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_UPDATE_TASK_NAME,
    );
    if (!isRegistered) {
      await BackgroundTask.registerTaskAsync(BACKGROUND_UPDATE_TASK_NAME, {
        minimumInterval:
          options.minimumInterval ?? BACKGROUND_UPDATE_INTERVAL_MINUTES,
      });
    }
    return true;
  } catch (error) {
    console.warn("Failed to register background update task:", error);
    return false;
  }
}

/**
 * Unregisters the periodic background update task.
 */
export async function unregisterBackgroundUpdateTask(): Promise<boolean> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_UPDATE_TASK_NAME,
    );
    if (isRegistered) {
      await BackgroundTask.unregisterTaskAsync(BACKGROUND_UPDATE_TASK_NAME);
    }
    return true;
  } catch (error) {
    console.warn("Failed to unregister background update task:", error);
    return false;
  }
}

/**
 * Checks whether the periodic update check task is currently registered.
 */
export async function isBackgroundUpdateTaskRegistered(): Promise<boolean> {
  try {
    return await TaskManager.isTaskRegisteredAsync(BACKGROUND_UPDATE_TASK_NAME);
  } catch {
    return false;
  }
}

/**
 * Inspects the system availability status for background tasks.
 */
export async function getBackgroundUpdateTaskStatus(): Promise<BackgroundTask.BackgroundTaskStatus | null> {
  try {
    return await BackgroundTask.getStatusAsync();
  } catch {
    return null;
  }
}

/**
 * Test helper: triggers the background worker in dev or executes directly.
 */
export async function triggerBackgroundUpdateTaskForTesting(): Promise<boolean> {
  try {
    if (__DEV__) {
      return await BackgroundTask.triggerTaskWorkerForTestingAsync();
    }
    const result = await executeBackgroundUpdateCheck();
    return result === BackgroundTask.BackgroundTaskResult.Success;
  } catch (error) {
    console.warn(
      "Failed to trigger background update task for testing:",
      error,
    );
    return false;
  }
}
