import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import * as Notifications from "expo-notifications";
import * as Linking from "expo-linking";
import Constants from "expo-constants";
import { AppReleaseInfo } from "../constants/distributions";
import { FeaturedCategoryKey } from "../constants/featuredMolecules";
import { SavedCompoundItem } from "../types";
import {
  requestNotificationPermission,
  scheduleBookmarkRetentionReminder,
  scheduleWeeklyMoleculeSpotlight,
  setupNotificationChannels,
} from "../services/notifications/notificationService";
import {
  checkForAppUpdate,
  notifyUpdateAvailable,
} from "../services/updates/appUpdateChecker";
import { registerBackgroundUpdateTask } from "../services/updates/backgroundUpdateTask";
import {
  ReleaseHighlight,
  checkVersionAndTriggerNotice,
} from "../services/updates/updateNoticeService";

export const IS_DEV_TEST_ENABLED =
  __DEV__ || Boolean(Constants.expoConfig?.extra?.isDevVariant);

export function createMockReleaseInfo(): AppReleaseInfo {
  return {
    version: "9.9.0",
    releaseTitle: "Moluxis v9.9.0 (Play Store Preview)",
    releaseUrl: "https://github.com/ankrypht/Moluxis/releases/latest",
    isNewer: true,
  };
}

const VALID_CATEGORIES = new Set<FeaturedCategoryKey>([
  "biochemicals",
  "medicinal",
  "crystals",
]);

export interface UseNotificationsAndUpdatesOptions {
  bookmarks: SavedCompoundItem[];
  onSelectMolecule: (query: string) => void;
  onOpenBookmarks: () => void;
  onOpenCategory: (category: FeaturedCategoryKey) => void;
}

export function useNotificationsAndUpdates({
  bookmarks,
  onSelectMolecule,
  onOpenBookmarks,
  onOpenCategory,
}: UseNotificationsAndUpdatesOptions) {
  const [releaseInfo, setReleaseInfo] = useState<AppReleaseInfo | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const [whatsNewNotes, setWhatsNewNotes] = useState<ReleaseHighlight | null>(
    null,
  );
  const [showWhatsNewModal, setShowWhatsNewModal] = useState(false);

  const bookmarksRef = useRef<SavedCompoundItem[]>(bookmarks);
  useEffect(() => {
    bookmarksRef.current = bookmarks;
  }, [bookmarks]);

  const releaseInfoRef = useRef<AppReleaseInfo | null>(releaseInfo);
  useEffect(() => {
    releaseInfoRef.current = releaseInfo;
  }, [releaseInfo]);

  const handledResponseIdsRef = useRef<Set<string>>(new Set());

  const handleDeepLinkUrl = useCallback(
    (rawUrl: string) => {
      if (!rawUrl || typeof rawUrl !== "string") return;
      try {
        const parsed = Linking.parse(rawUrl);
        const target = (parsed.hostname || parsed.path || "").toLowerCase();
        const params = parsed.queryParams || {};

        if (target === "molecule" && params.query) {
          onSelectMolecule(String(params.query));
          return;
        }

        if (target === "bookmarks") {
          onOpenBookmarks();
          return;
        }

        if (target === "category" && params.name) {
          const category = String(params.name).toLowerCase();
          if (VALID_CATEGORIES.has(category as FeaturedCategoryKey)) {
            onOpenCategory(category as FeaturedCategoryKey);
          }
          return;
        }

        if (target === "update") {
          if (releaseInfoRef.current) {
            setShowUpdateModal(true);
          } else {
            checkForAppUpdate({ bypassSnooze: true })
              .then((info) => {
                if (info) {
                  setReleaseInfo(info);
                  setShowUpdateModal(true);
                }
              })
              .catch(() => {});
          }
        }
      } catch (error) {
        console.warn("Failed to handle deep link:", error);
      }
    },
    [onSelectMolecule, onOpenBookmarks, onOpenCategory],
  );

  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse | null | undefined) => {
      if (!response) return;
      const responseId = response.notification.request.identifier;
      if (handledResponseIdsRef.current.has(responseId)) {
        return;
      }
      handledResponseIdsRef.current.add(responseId);

      const data = response.notification.request.content.data as
        Record<string, unknown> | undefined;
      if (!data) return;

      if (
        IS_DEV_TEST_ENABLED &&
        data.isDevPreview === true &&
        data.type === "APP_UPDATE"
      ) {
        setReleaseInfo(createMockReleaseInfo());
        setShowUpdateModal(true);
        return;
      }

      if (
        data.type === "APP_UPDATE" &&
        typeof data.version === "string" &&
        !releaseInfoRef.current
      ) {
        setReleaseInfo({
          version: data.version,
          releaseTitle: `Moluxis v${data.version}`,
          releaseUrl: "https://github.com/ankrypht/Moluxis/releases/latest",
          isNewer: true,
        });
      }

      if (typeof data.url === "string" && data.url.length > 0) {
        handleDeepLinkUrl(data.url);
        return;
      }

      if (data.type === "OPEN_BOOKMARKS") {
        onOpenBookmarks();
      } else if (typeof data.query === "string" && data.query.trim()) {
        onSelectMolecule(data.query.trim());
      } else if (data.type === "APP_UPDATE") {
        handleDeepLinkUrl("moluxis://update");
      }
    },
    [handleDeepLinkUrl, onOpenBookmarks, onSelectMolecule],
  );

  // Startup initialization: channels, permission, spotlight, What's New, and update check
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      await setupNotificationChannels();
      const granted = await requestNotificationPermission();
      if (granted) {
        await scheduleWeeklyMoleculeSpotlight();
        await scheduleBookmarkRetentionReminder(bookmarksRef.current);
      }

      await registerBackgroundUpdateTask();

      const notice = await checkVersionAndTriggerNotice();
      if (!isMounted) return;

      if (notice.shouldShowModal) {
        setWhatsNewNotes(notice.releaseNotes);
        setShowWhatsNewModal(true);
      }

      const updateInfo = await checkForAppUpdate();
      if (!isMounted || !updateInfo) return;

      setReleaseInfo(updateInfo);

      if (granted) {
        await notifyUpdateAvailable(updateInfo);
      }

      // Avoid stacking two modals on first launch after upgrade
      if (!notice.shouldShowModal) {
        setShowUpdateModal(true);
      }
    };

    initialize().catch((error) => {
      console.warn("Notification/update initialization failed:", error);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Reschedule 14-day bookmark retention reminder whenever bookmarks change or app returns to foreground
  useEffect(() => {
    scheduleBookmarkRetentionReminder(bookmarks).catch(() => {});

    const appStateSub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        scheduleBookmarkRetentionReminder(bookmarksRef.current).catch(() => {});
      }
    });

    return () => {
      appStateSub.remove();
    };
  }, [bookmarks]);

  // Listen for notification taps (foreground/background + cold start) and moluxis:// deep links
  useEffect(() => {
    const responseSub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        handleNotificationResponse(response);
      },
    );

    Notifications.getLastNotificationResponseAsync()
      .then((lastResponse) => {
        if (lastResponse) {
          handleNotificationResponse(lastResponse);
          Notifications.clearLastNotificationResponseAsync().catch(() => {});
        }
      })
      .catch(() => {});

    const linkingSub = Linking.addEventListener("url", ({ url }) => {
      handleDeepLinkUrl(url);
    });

    Linking.getInitialURL()
      .then((initialUrl) => {
        if (initialUrl) {
          handleDeepLinkUrl(initialUrl);
        }
      })
      .catch(() => {});

    return () => {
      responseSub.remove();
      linkingSub.remove();
    };
  }, [handleNotificationResponse, handleDeepLinkUrl]);

  // Dev & programmatic controls
  const openPreviewUpdateModal = useCallback(() => {
    setReleaseInfo(createMockReleaseInfo());
    setShowUpdateModal(true);
  }, []);

  const openPreviewWhatsNewModal = useCallback((notes: ReleaseHighlight) => {
    setWhatsNewNotes(notes);
    setShowWhatsNewModal(true);
  }, []);

  const runLiveUpdateCheck = useCallback(async () => {
    const info = await checkForAppUpdate({ bypassSnooze: true });
    if (info) {
      setReleaseInfo(info);
      setShowUpdateModal(true);
    }
    return info;
  }, []);

  const refreshVersionNotice = useCallback(async () => {
    const result = await checkVersionAndTriggerNotice();
    if (result.shouldShowModal) {
      setWhatsNewNotes(result.releaseNotes);
      setShowWhatsNewModal(true);
    }
    return result;
  }, []);

  const dismissUpdateModal = useCallback(() => {
    setShowUpdateModal(false);
  }, []);

  const dismissWhatsNewModal = useCallback(() => {
    setShowWhatsNewModal(false);
  }, []);

  return {
    releaseInfo,
    showUpdateModal,
    dismissUpdateModal,
    whatsNewNotes,
    showWhatsNewModal,
    dismissWhatsNewModal,
    openPreviewUpdateModal,
    openPreviewWhatsNewModal,
    runLiveUpdateCheck,
    refreshVersionNotice,
  };
}
