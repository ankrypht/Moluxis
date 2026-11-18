import { useEffect, useRef } from "react";
import { BackHandler } from "react-native";

interface UseAppBackHandlerOptions {
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
