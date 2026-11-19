import { useEffect, useRef } from "react";
import { BackHandler } from "react-native";

export interface UseAppBackHandlerOptions {
  hasActiveAlert?: boolean;
  onCloseAlert?: () => void;
  showUpdateModal?: boolean;
  onCloseUpdateModal?: () => void;
  showWhatsNewModal?: boolean;
  onCloseWhatsNewModal?: () => void;
  showDevTestModal?: boolean;
  onCloseDevTestModal?: () => void;
  showShareModal: boolean;
  onCloseShareModal: () => void;
  showHistoryModal: boolean;
  onCloseHistoryModal: () => void;
  showAboutModal: boolean;
  onCloseAboutModal: () => void;
  isMeasuring: boolean;
  onCloseMeasure: () => void;
  showInfo: boolean;
  onCloseInfo: () => void;
  showDisplayOptions: boolean;
  onCloseDisplayOptions: () => void;
  showControls: boolean;
  onExitZenMode: () => void;
  showSuggestions: boolean;
  onCloseSuggestions: () => void;
  canClearToShowcase: boolean;
  onClearToShowcase: () => void;
}

export function useAppBackHandler(options: UseAppBackHandlerOptions) {
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  const {
    hasActiveAlert,
    showUpdateModal,
    showWhatsNewModal,
    showDevTestModal,
    showShareModal,
    showHistoryModal,
    showAboutModal,
    isMeasuring,
    showInfo,
    showDisplayOptions,
    showControls,
    showSuggestions,
    canClearToShowcase,
  } = options;

  const canGoBack = Boolean(
    hasActiveAlert ||
    showUpdateModal ||
    showWhatsNewModal ||
    showDevTestModal ||
    showShareModal ||
    showHistoryModal ||
    showAboutModal ||
    isMeasuring ||
    showInfo ||
    showDisplayOptions ||
    !showControls ||
    showSuggestions ||
    canClearToShowcase,
  );

  useEffect(() => {
    if (!canGoBack) return;

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        const currentOptions = optionsRef.current;
        if (currentOptions.hasActiveAlert) {
          currentOptions.onCloseAlert?.();
          return true;
        }
        if (currentOptions.showUpdateModal) {
          currentOptions.onCloseUpdateModal?.();
          return true;
        }
        if (currentOptions.showWhatsNewModal) {
          currentOptions.onCloseWhatsNewModal?.();
          return true;
        }
        if (currentOptions.showDevTestModal) {
          currentOptions.onCloseDevTestModal?.();
          return true;
        }
        if (currentOptions.showShareModal) {
          currentOptions.onCloseShareModal();
          return true;
        }
        if (currentOptions.showHistoryModal) {
          currentOptions.onCloseHistoryModal();
          return true;
        }
        if (currentOptions.showAboutModal) {
          currentOptions.onCloseAboutModal();
          return true;
        }
        if (currentOptions.isMeasuring) {
          currentOptions.onCloseMeasure();
          return true;
        }
        if (currentOptions.showInfo) {
          currentOptions.onCloseInfo();
          return true;
        }
        if (currentOptions.showDisplayOptions) {
          currentOptions.onCloseDisplayOptions();
          return true;
        }
        if (!currentOptions.showControls) {
          currentOptions.onExitZenMode();
          return true;
        }
        if (currentOptions.showSuggestions) {
          currentOptions.onCloseSuggestions();
          return true;
        }
        if (currentOptions.canClearToShowcase) {
          currentOptions.onClearToShowcase();
          return true;
        }
        return false;
      },
    );

    return () => subscription.remove();
  }, [
    canGoBack,
    hasActiveAlert,
    showUpdateModal,
    showWhatsNewModal,
    showDevTestModal,
    showShareModal,
    showHistoryModal,
    showAboutModal,
    isMeasuring,
    showInfo,
    showDisplayOptions,
    showControls,
    showSuggestions,
    canClearToShowcase,
  ]);
}
